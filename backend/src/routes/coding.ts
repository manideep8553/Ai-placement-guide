import { Router, Response } from 'express'
import { prisma } from '../index'
import { executeTestCases } from '../services/judge0'
import { generateCodingFeedback } from '../services/codingFeedback'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  const { topic, difficulty, company, search, page = '1', limit = '20' } = req.query as Record<string, string>
  const where: Record<string, any> = {}
  if (difficulty) where.difficulty = difficulty
  if (topic) where.topic = topic
  if (company) where.companyTags = { has: company }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { topic: { contains: search, mode: 'insensitive' } },
    ]
  }

  const pageNum = Math.max(1, parseInt(page))
  const perPage = Math.min(50, Math.max(1, parseInt(limit)))

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      skip: (pageNum - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { testCases: true } } },
    }),
    prisma.problem.count({ where }),
  ])

  res.json({
    problems: problems.map(p => ({ ...p, testCaseCount: p._count.testCases })),
    total, page: pageNum, perPage,
  })
})

router.get('/topics', async (_req: AuthRequest, res: Response) => {
  const problems = await prisma.problem.findMany({ select: { topic: true } })
  res.json([...new Set(problems.map(p => p.topic))].sort())
})

router.get('/companies', async (_req: AuthRequest, res: Response) => {
  const problems = await prisma.problem.findMany({ select: { companyTags: true } })
  res.json([...new Set(problems.flatMap(p => p.companyTags))].sort())
})

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const [totalSubmissions, acceptedSubmissions, uniqueSolved, sessions, topicData] = await Promise.all([
    prisma.codingSubmission.count({ where: { userId } }),
    prisma.codingSubmission.count({ where: { userId, status: 'ACCEPTED' } }),
    prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      select: { problemId: true },
      distinct: ['problemId'],
    }),
    prisma.codingSession.findMany({ where: { userId }, orderBy: { startedAt: 'desc' }, take: 10 }),
    prisma.codingSubmission.findMany({
      where: { userId },
      include: { problem: { select: { topic: true, difficulty: true } } },
    }),
  ])

  const topicPerformance: Record<string, { attempted: number; passed: number }> = {}
  const difficultyBreakdown: Record<string, { attempted: number; passed: number }> = {}
  for (const sub of topicData) {
    const topic = sub.problem.topic
    if (!topicPerformance[topic]) topicPerformance[topic] = { attempted: 0, passed: 0 }
    topicPerformance[topic].attempted++
    if (sub.status === 'ACCEPTED') topicPerformance[topic].passed++

    const diff = sub.problem.difficulty
    if (!difficultyBreakdown[diff]) difficultyBreakdown[diff] = { attempted: 0, passed: 0 }
    difficultyBreakdown[diff].attempted++
    if (sub.status === 'ACCEPTED') difficultyBreakdown[diff].passed++
  }

  res.json({
    totalSubmissions,
    acceptedSubmissions,
    successRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
    uniqueProblemsSolved: uniqueSolved.length,
    topicPerformance,
    difficultyBreakdown,
    recentSessions: sessions,
  })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const problem = await prisma.problem.findUnique({
    where: { id: String(req.params.id) },
    include: { testCases: { orderBy: { orderIndex: 'asc' } } },
  })
  if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' })

  const testCases = (problem as any).testCases || []
  const visibleTestCases = testCases.filter((tc: any) => !tc.isHidden)
  const hiddenCount = testCases.filter((tc: any) => tc.isHidden).length

  res.json({
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    topic: problem.topic,
    companyTags: problem.companyTags,
    constraints: problem.constraints,
    examples: problem.examples,
    solutionApproach: problem.solutionApproach,
    optimalComplexity: problem.optimalComplexity,
    starterCode: problem.starterCode,
    funcSignature: problem.funcSignature,
    visibleTestCases,
    hiddenTestCaseCount: hiddenCount,
    totalTestCaseCount: problem.testCases.length,
    createdAt: problem.createdAt,
  })
})

router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const { code, language, sessionId } = req.body
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing code or language', code: 'MISSING_FIELDS' })
  }

  const supportedLangs = ['python', 'java', 'cpp', 'javascript', 'c']
  if (!supportedLangs.includes(language)) {
    return res.status(400).json({ error: `Unsupported language: ${language}`, code: 'UNSUPPORTED_LANGUAGE' })
  }

  const problem = await prisma.problem.findUnique({
    where: { id: String(req.params.id) },
    include: { testCases: { orderBy: { orderIndex: 'asc' } } },
  })
  if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' })

  const allTestCases = (problem as any).testCases || []
  if (allTestCases.length === 0) {
    return res.status(400).json({ error: 'No test cases defined for this problem', code: 'NO_TEST_CASES' })
  }

  let submission = await prisma.codingSubmission.create({
    data: {
      userId,
      problemId: problem.id,
      sessionId: sessionId || null,
      code,
      language,
      status: 'RUNNING',
    },
  })

  const testCaseInputs = allTestCases.map((tc: any) => ({
    id: tc.id,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    orderIndex: tc.orderIndex,
  }))

  try {
    const { results, passedCount, totalCount, averageTime } = await executeTestCases(code, language, testCaseInputs)

    const status = passedCount === totalCount ? 'ACCEPTED' : 'WRONG_ANSWER'
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0

    const feedback = await generateCodingFeedback({
      problemTitle: problem.title,
      problemDescription: problem.description,
      difficulty: problem.difficulty,
      code,
      language,
      passedCount,
      totalCount,
      testCaseResults: results.map(r => ({ passed: r.passed, error: r.error })),
      solutionApproach: problem.solutionApproach,
      optimalComplexity: problem.optimalComplexity as any,
    })

    submission = await prisma.codingSubmission.update({
      where: { id: submission.id },
      data: {
        passedTestCases: passedCount,
        totalTestCases: totalCount,
        score,
        executionTime: averageTime,
        status,
        errorMessage: results.find(r => !r.passed && r.error)?.error || null,
        testCaseResults: results.map(r => ({
          testCaseId: r.testCaseId,
          passed: r.passed,
          actualOutput: r.actualOutput,
          executionTime: r.executionTime,
          index: r.index,
        })),
        aiFeedback: feedback as any,
      },
    })

    if (sessionId) {
      await updateSessionScore(sessionId, userId)
    }

    const subErr = (submission as any).errorMessage
    res.json({
      id: submission.id,
      passed: status === 'ACCEPTED',
      passedCount,
      totalCount,
      score,
      status,
      executionTime: averageTime,
      error: subErr,
      testResults: results.map(r => ({
        testCaseId: r.testCaseId,
        passed: r.passed,
        actualOutput: r.actualOutput,
        error: r.error,
        executionTime: r.executionTime,
        index: r.index,
        isHidden: allTestCases.find((tc: any) => tc.id === r.testCaseId)?.isHidden || false,
      })),
      feedback,
    })
  } catch (err: any) {
    await prisma.codingSubmission.update({
      where: { id: submission.id },
      data: { status: 'ERROR', errorMessage: err.message },
    })

    res.json({
      id: submission.id,
      passed: false,
      passedCount: 0,
      totalCount: allTestCases.length,
      score: 0,
      status: 'ERROR',
      error: err.message,
      testResults: [],
      feedback: null,
    })
  }
})

async function updateSessionScore(sessionId: string, userId: string) {
  try {
    const session = await prisma.codingSession.findUnique({ where: { id: sessionId } })
    if (!session) return

    const submissions = await prisma.codingSubmission.findMany({
      where: { sessionId, userId },
    })

    const avgScore = submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length)
      : 0

    await prisma.codingSession.update({
      where: { id: sessionId },
      data: {
        score: avgScore,
        totalScore: submissions.length * 100,
        problemCount: submissions.length,
      },
    })
  } catch {
    // silent
  }
}

router.get('/submissions', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const { page = '1', limit = '20', status: filterStatus, problemId } = req.query as Record<string, string>
  const where: Record<string, any> = { userId }
  if (filterStatus) where.status = filterStatus
  if (problemId) where.problemId = problemId

  const pageNum = Math.max(1, parseInt(page))
  const perPage = Math.min(50, Math.max(1, parseInt(limit)))

  const [submissions, total] = await Promise.all([
    prisma.codingSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: {
        problem: { select: { id: true, title: true, difficulty: true, topic: true, companyTags: true } },
      },
    }),
    prisma.codingSubmission.count({ where }),
  ])

  res.json({ submissions, total, page: pageNum, perPage })
})

router.get('/submissions/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const submission = await prisma.codingSubmission.findUnique({
    where: { id: String(req.params.id) },
    include: {
      problem: {
        select: { id: true, title: true, difficulty: true, topic: true, description: true, constraints: true, examples: true, companyTags: true },
      },
    },
  })

  if (!submission) return res.status(404).json({ error: 'Submission not found', code: 'NOT_FOUND' })
  if (submission.userId !== userId) return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' })

  res.json(submission)
})

router.post('/session/start', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const { type = 'PRACTICE', company, difficulty, duration } = req.body

  const session = await prisma.codingSession.create({
    data: {
      userId,
      type,
      company: company || null,
      difficulty: difficulty || null,
      duration: duration || null,
      title: company ? `${company} Coding Round` : type === 'TIMED' ? 'Timed Practice' : 'Practice Session',
      status: 'IN_PROGRESS',
    },
  })

  res.json(session)
})

router.post('/session/:id/end', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const session = await prisma.codingSession.findUnique({ where: { id: String(req.params.id) } })
  if (!session) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' })
  if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' })

  const updated = await prisma.codingSession.update({
    where: { id: String(req.params.id) },
    data: { status: 'COMPLETED', completedAt: new Date() },
    include: {
      submissions: {
        include: { problem: { select: { title: true, difficulty: true } } },
        orderBy: { submittedAt: 'asc' },
      },
    },
  })

  res.json(updated)
})

router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })

  const sessions = await prisma.codingSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: { _count: { select: { submissions: true } } },
  })

  res.json(sessions)
})

router.get('/sessions/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const session = await prisma.codingSession.findUnique({
    where: { id: String(req.params.id) },
    include: {
      submissions: {
        include: { problem: { select: { id: true, title: true, difficulty: true, topic: true } } },
        orderBy: { submittedAt: 'asc' },
      },
    },
  })

  if (!session) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' })
  if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' })

  res.json(session)
})

router.get('/company-rounds/:company', async (req: AuthRequest, res: Response) => {
  const company = String(req.params.company)
  const problems = await prisma.problem.findMany({
    where: { companyTags: { has: company } },
    orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
    select: {
      id: true, title: true, difficulty: true, topic: true,
      _count: { select: { testCases: true } },
    },
  })

  const rounds = [
    {
      name: 'Coding Round 1',
      description: `${company} specific coding assessment - DSA focused`,
      duration: '60 mins',
      difficulty: 'Easy-Medium',
      problemCount: 2,
      problems: problems.filter(p => p.difficulty === 'Easy' || p.difficulty === 'Medium').slice(0, 2),
    },
    {
      name: 'Coding Round 2',
      description: 'Advanced problem solving and optimization',
      duration: '90 mins',
      difficulty: 'Medium-Hard',
      problemCount: 2,
      problems: problems.filter(p => p.difficulty === 'Medium' || p.difficulty === 'Hard').slice(0, 2),
    },
  ]

  res.json({ company, rounds, totalProblems: problems.length })
})

export default router
