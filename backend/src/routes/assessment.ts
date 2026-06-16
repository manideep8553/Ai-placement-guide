import { Router, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

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

    const evaluation: {
      questionId: string
      answer: string
      isCorrect: boolean
      marksObtained: number
    }[] = []
    let totalScore = 0
    const sectionMap: Record<string, { score: number; total: number }> = {}

    for (const ans of answers) {
      const question = attempt.assessment.questions.find(q => q.id === ans.questionId)
      if (!question) continue

      const qData = question.questionData as any
      let isCorrect = false
      let marksObtained = 0

      if (question.questionType === 'MCQ') {
        isCorrect = ans.answer === qData.correctAnswer
        marksObtained = isCorrect ? question.marks : 0
      } else {
        isCorrect = ans.answer && ans.answer.trim().length > 0 ? true : false
        marksObtained = isCorrect ? question.marks : 0
      }

      totalScore += marksObtained

      if (!sectionMap[question.topic]) {
        sectionMap[question.topic] = { score: 0, total: 0 }
      }
      sectionMap[question.topic].score += marksObtained
      sectionMap[question.topic].total += question.marks

      evaluation.push({
        questionId: question.id,
        answer: ans.answer || '',
        isCorrect,
        marksObtained
      })
    }

    const totalMarks = attempt.assessment.totalMarks
    const accuracy = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0
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
    if (accuracy < 40) {
      suggestions.push({
        area: 'General',
        suggestion: 'Build a strong foundation by revisiting basic concepts before attempting advanced topics.'
      })
    }

    const strengths = strongTopics
    const weaknesses = weakTopics

    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        score: totalScore,
        accuracy,
        submittedAt: new Date(),
        timeTaken,
        sectionScores,
        strengths,
        weaknesses,
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

router.get('/:id/attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId: req.userId!, assessmentId: req.params.id as string},
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

export default router
