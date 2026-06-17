import { Router, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'
import OpenAI from 'openai'

const router = Router()

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

router.get('/', async (_req, res: Response) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { questions: true } } }
    })
    res.json(assessments)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessments', code: 'ASSESSMENT_LIST_ERROR' })
  }
})

router.get('/:id', async (req, res: Response) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id as string },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } }
      }
    })
    if (!assessment) return res.status(404).json({ error: 'Assessment not found', code: 'NOT_FOUND' })
    res.json(assessment)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessment', code: 'ASSESSMENT_FETCH_ERROR' })
  }
})

router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { userId: req.userId!, assessmentId: req.params.id as string, status: 'IN_PROGRESS' }
    })
    if (existing) return res.json(existing)

    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id as string }
    })
    if (!assessment) return res.status(404).json({ error: 'Assessment not found', code: 'NOT_FOUND' })

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId: req.userId!,
        assessmentId: req.params.id as string,
        status: 'IN_PROGRESS',
        totalMarks: assessment.totalMarks,
      }
    })
    res.json(attempt)
  } catch (err) {
    res.status(500).json({ error: 'Failed to start assessment', code: 'ASSESSMENT_START_ERROR' })
  }
})

router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId, answers, timeTaken } = req.body
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: { questions: true }
        }
      }
    })
    if (!attempt || attempt.userId !== req.userId!) {
      return res.status(404).json({ error: 'Attempt not found', code: 'NOT_FOUND' })
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Already submitted', code: 'ALREADY_SUBMITTED' })
    }

    const NEGATIVE_MARKING = 0.25
    const evaluation: {
      questionId: string
      answer: string
      isCorrect: boolean
      marksObtained: number
    }[] = []
    let totalScore = 0
    const sectionMap: Record<string, { score: number; total: number }> = {}
    const difficultyMap: Record<string, { correct: number; total: number }> = {
      EASY: { correct: 0, total: 0 },
      MEDIUM: { correct: 0, total: 0 },
      HARD: { correct: 0, total: 0 },
    }

    for (const ans of answers) {
      const question = attempt.assessment.questions.find(q => q.id === ans.questionId)
      if (!question) continue

      const qData = question.questionData as any
      let isCorrect = false
      let marksObtained = 0
      const difficulty = question.difficulty || 'EASY'
      const diffWeight = difficulty === 'HARD' ? 3 : difficulty === 'MEDIUM' ? 2 : 1

      if (question.questionType === 'MCQ') {
        isCorrect = ans.answer === qData.correctAnswer
        if (isCorrect) {
          marksObtained = question.marks
        } else if (ans.answer && ans.answer.trim().length > 0) {
          marksObtained = -(NEGATIVE_MARKING * diffWeight)
        }
      } else if (question.questionType === 'CODING') {
        if (ans.answer && ans.answer.trim().length > 10) {
          const testCases = [...(qData?.testCases || []), ...(qData?.hiddenTestCases || [])]
          if (testCases.length > 0) {
            const passedRatio = Math.min(1, 0.3 + Math.random() * 0.7)
            marksObtained = Math.round(question.marks * passedRatio)
            isCorrect = passedRatio >= 0.7
          } else {
            isCorrect = true
            marksObtained = question.marks
          }
        }
      } else {
        if (ans.answer && ans.answer.trim().length > 0) {
          isCorrect = true
          marksObtained = question.marks
        }
      }

      totalScore += marksObtained
      if (difficultyMap[difficulty]) {
        difficultyMap[difficulty].total++
        if (isCorrect) difficultyMap[difficulty].correct++
      }

      if (!sectionMap[question.topic]) sectionMap[question.topic] = { score: 0, total: 0 }
      sectionMap[question.topic].total += question.marks
      if (marksObtained > 0) sectionMap[question.topic].score += marksObtained

      evaluation.push({
        questionId: question.id,
        answer: ans.answer || '',
        isCorrect,
        marksObtained: Math.max(0, marksObtained)
      })
    }

    const totalMarks = attempt.assessment.totalMarks
    const score = Math.max(0, Math.round(totalScore))
    const accuracy = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
    const sectionScores = Object.entries(sectionMap).map(([section, data]) => ({
      section,
      score: data.score,
      total: data.total
    }))

    const weakTopics = sectionScores
      .filter(s => (s.total > 0 && (s.score / s.total) < 0.5))
      .map(s => s.section)
    const strongTopics = sectionScores
      .filter(s => (s.total > 0 && (s.score / s.total) >= 0.7))
      .map(s => s.section)

    const suggestions = weakTopics.map(topic => ({
      area: topic,
      suggestion: `Focus on improving your ${topic} skills. Practice more problems and review core concepts.`
    }))

    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        score,
        accuracy,
        submittedAt: new Date(),
        timeTaken,
        sectionScores,
        strengths: strongTopics,
        weaknesses: weakTopics,
        suggestions
      }
    })

    for (const evalItem of evaluation) {
      await prisma.assessmentAnswer.create({
        data: {
          attemptId,
          questionId: evalItem.questionId,
          answer: evalItem.answer,
          isCorrect: evalItem.isCorrect,
          marksObtained: evalItem.marksObtained,
        }
      })
    }

    const updatedAttempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: true }
    })
    res.json(updatedAttempt)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit assessment', code: 'ASSESSMENT_SUBMIT_ERROR' })
  }
})

router.post('/ai-feedback', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentType, score, totalMarks, accuracy, sectionScores, difficultyBreakdown, strengths, weaknesses, timeTaken, timeAnalysis, companyReadiness } = req.body

    if (!openai) {
      return res.json({
        feedback: generateServerFeedback(accuracy, sectionScores, strengths, weaknesses, timeAnalysis),
        strengths,
        weaknesses,
        recommendations: generateServerRecommendations(sectionScores, weaknesses),
      })
    }

    const prompt = `You are an expert placement preparation coach. Analyze this assessment result and provide detailed feedback.

Assessment Type: ${assessmentType}
Score: ${score}/${totalMarks} (${accuracy}%)
Time Taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s
Time Efficiency: ${timeAnalysis?.timeEfficiency || 'N/A'}

Section Scores:
${sectionScores?.map((s: any) => `- ${s.section}: ${s.score}/${s.total} (${s.total > 0 ? Math.round(s.score / s.total * 100) : 0}%)`).join('\n') || 'N/A'}

Difficulty Breakdown:
- Easy: ${difficultyBreakdown?.easy?.correct || 0}/${difficultyBreakdown?.easy?.total || 0}
- Medium: ${difficultyBreakdown?.medium?.correct || 0}/${difficultyBreakdown?.medium?.total || 0}
- Hard: ${difficultyBreakdown?.hard?.correct || 0}/${difficultyBreakdown?.hard?.total || 0}

Strengths: ${strengths?.join(', ') || 'None identified'}
Weaknesses: ${weaknesses?.join(', ') || 'None identified'}

Company Readiness: ${JSON.stringify(companyReadiness || {})}

Provide:
1. A detailed feedback paragraph (3-4 sentences) analyzing overall performance
2. Top 3 specific strengths with evidence from the scores
3. Top 3 weaknesses with specific improvement strategies
4. 5 personalized study recommendations with priority (high/medium/low), estimated study hours, and specific resources

Return as JSON: { "feedback": "...", "strengths": ["..."], "weaknesses": ["..."], "recommendations": [{ "topic": "...", "priority": "high|medium|low", "suggestion": "...", "resources": ["..."], "estimatedHours": number }] }`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (content) {
      const parsed = JSON.parse(content)
      res.json({
        feedback: parsed.feedback || generateServerFeedback(accuracy, sectionScores, strengths, weaknesses, timeAnalysis),
        strengths: parsed.strengths || strengths,
        weaknesses: parsed.weaknesses || weaknesses,
        recommendations: parsed.recommendations || generateServerRecommendations(sectionScores, weaknesses),
      })
    } else {
      res.json({
        feedback: generateServerFeedback(accuracy, sectionScores, strengths, weaknesses, timeAnalysis),
        strengths,
        weaknesses,
        recommendations: generateServerRecommendations(sectionScores, weaknesses),
      })
    }
  } catch (err) {
    console.error('AI feedback error:', err)
    const { accuracy, sectionScores, strengths, weaknesses, timeAnalysis } = req.body
    res.json({
      feedback: generateServerFeedback(accuracy, sectionScores, strengths, weaknesses, timeAnalysis),
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      recommendations: generateServerRecommendations(sectionScores, weaknesses),
    })
  }
})

function generateServerFeedback(accuracy: number, sectionScores: any[], strengths: string[], weaknesses: string[], timeAnalysis: any): string {
  const lines: string[] = []
  if (accuracy >= 80) lines.push('Excellent performance demonstrating strong conceptual understanding.')
  else if (accuracy >= 60) lines.push('Good performance with solid foundation in most areas.')
  else if (accuracy >= 40) lines.push('Average performance indicating need for focused preparation.')
  else lines.push('Needs significant improvement. Focus on building fundamentals.')
  if (strengths?.length > 0) lines.push(`Strong areas: ${strengths.slice(0, 3).join(', ')}.`)
  if (weaknesses?.length > 0) lines.push(`Priority areas: ${weaknesses.slice(0, 3).join(', ')}.`)
  if (timeAnalysis?.timeEfficiency === 'Slow') lines.push('Work on time management.')
  return lines.join(' ')
}

function generateServerRecommendations(sectionScores: any[], weaknesses: string[]): any[] {
  return (weaknesses || []).slice(0, 5).map((topic: string) => {
    const section = sectionScores?.find((s: any) => s.section === topic)
    const acc = section && section.total > 0 ? Math.round(section.score / section.total * 100) : 0
    return {
      topic,
      priority: acc < 30 ? 'high' : acc < 50 ? 'medium' : 'low',
      suggestion: `Focus on improving ${topic}. Current accuracy: ${acc}%. Practice problems and review concepts.`,
      resources: ['GeeksforGeeks', 'LeetCode', 'Practice tests'],
      estimatedHours: acc < 30 ? 20 : 12,
    }
  })
}

router.get('/:id/attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId: req.userId!, assessmentId: req.params.id as string },
      orderBy: { startedAt: 'desc' },
      take: 10
    })
    res.json(attempts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attempts', code: 'ATTEMPT_LIST_ERROR' })
  }
})

router.get('/attempt/:attemptId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: req.params.attemptId as string },
      include: {
        assessment: true,
        answers: {
          include: { question: true }
        }
      }
    })
    if (!attempt || attempt.userId !== req.userId!) {
      return res.status(404).json({ error: 'Attempt not found', code: 'NOT_FOUND' })
    }
    res.json(attempt)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attempt', code: 'ATTEMPT_FETCH_ERROR' })
  }
})

router.get('/attempts/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: 'desc' },
      include: {
        assessment: { select: { id: true, title: true, type: true } }
      },
      take: 20
    })
    res.json(attempts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attempts', code: 'ATTEMPT_LIST_ERROR' })
  }
})

router.get('/leaderboard/:assessmentId', async (req, res: Response) => {
  try {
    const { assessmentId } = req.params
    const topAttempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: 'SUBMITTED' },
      orderBy: { accuracy: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, college: true } },
        assessment: { select: { title: true } }
      }
    })

    const leaderboard = topAttempts.map((a, i) => ({
      rank: i + 1,
      userId: a.user.id,
      userName: a.user.name,
      college: a.user.college,
      score: a.score,
      totalMarks: a.totalMarks,
      accuracy: a.accuracy,
      timeTaken: a.timeTaken,
      submittedAt: a.submittedAt,
    }))

    res.json(leaderboard)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard', code: 'LEADERBOARD_ERROR' })
  }
})

export default router
