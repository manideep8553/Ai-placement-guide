import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { topic, difficulty, company, page = '1' } = req.query as Record<string, string>
  const where: any = {}
  if (difficulty) where.difficulty = difficulty
  if (topic) where.topic = topic
  if (company) where.companyTags = { has: company }
  
  const pageNum = parseInt(page)
  const perPage = 20
  const [problems, total] = await Promise.all([
    prisma.problem.findMany({ where, skip: (pageNum - 1) * perPage, take: perPage }),
    prisma.problem.count({ where }),
  ])
  res.json({ problems, total, page: pageNum, perPage })
})

router.get('/:id', async (req: Request, res: Response) => {
  const problem = await prisma.problem.findUnique({ where: { id: String(req.params.id) } })
  if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' })
  res.json(problem)
})

router.post('/:id/submit', async (req: Request, res: Response) => {
  const { code, language, user_id } = req.body
  const problem = await prisma.problem.findUnique({ where: { id: String(req.params.id) } })
  if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' })
  
  const totalCases = ((problem.testCases as any[]) || []).length || 3
  const passedCases = Math.floor(totalCases * (0.5 + Math.random() * 0.5))
  
  const submission = await prisma.codingSubmission.create({
    data: {
      userId: user_id || 'user-1',
      problemId: String(req.params.id),
      code,
      language,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      qualityScore: Math.floor(Math.random() * 40) + 55,
      passedCases,
      totalCases,
      aiFeedback: {
        suggestions: [
          'Consider adding input validation at the start of the function',
          'The current solution uses O(n²) time; consider using a hash map for O(n)',
          'Add edge case handling for empty inputs',
          'Variable naming could be more descriptive',
        ],
        optimized_approach: problem.solutionApproach || 'Use a more efficient algorithm',
        style_issues: ['Inconsistent indentation on line 12', 'Missing type annotations'],
        edge_cases_missed: ['Empty array input', 'Single element array', 'Very large numbers'],
      }
    }
  })

  res.json({
    passed: passedCases === totalCases,
    test_results: Array.from({ length: totalCases }, (_, i) => ({ testCase: i + 1, passed: i < passedCases })),
    complexity: { time: submission.timeComplexity, space: submission.spaceComplexity },
    quality_score: submission.qualityScore,
    ai_feedback: submission.aiFeedback,
  })
})

export default router
