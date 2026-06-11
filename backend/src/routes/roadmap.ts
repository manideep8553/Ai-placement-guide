import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  const { target_company, current_level, daily_hours, target_date } = req.body
  
  const weeks = [
    { weekNumber: 1, phase: 'Foundation', topic: 'Arrays & Hashing Basics', resourceCount: 5, estimatedHours: daily_hours * 7 },
    { weekNumber: 2, phase: 'Foundation', topic: 'Two Pointers & Sliding Window', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 3, phase: 'Foundation', topic: 'Stacks & Queues', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 4, phase: 'Foundation', topic: 'Linked Lists', resourceCount: 5, estimatedHours: daily_hours * 7 },
    { weekNumber: 5, phase: 'Core DSA', topic: 'Binary Search & Divide Conquer', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 6, phase: 'Core DSA', topic: 'Trees & Binary Search Trees', resourceCount: 6, estimatedHours: daily_hours * 7 },
    { weekNumber: 7, phase: 'Core DSA', topic: 'Graphs & BFS/DFS', resourceCount: 6, estimatedHours: daily_hours * 7 },
    { weekNumber: 8, phase: 'Core DSA', topic: 'Dynamic Programming I', resourceCount: 5, estimatedHours: daily_hours * 7 },
    { weekNumber: 9, phase: 'Core DSA', topic: 'Dynamic Programming II', resourceCount: 5, estimatedHours: daily_hours * 7 },
    { weekNumber: 10, phase: 'Advanced', topic: 'System Design Basics', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 11, phase: 'Advanced', topic: 'Object-Oriented Design', resourceCount: 3, estimatedHours: daily_hours * 7 },
    { weekNumber: 12, phase: 'Advanced', topic: 'Company-Specific Topics', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 13, phase: 'Mock', topic: 'Mock Interviews: DSA', resourceCount: 5, estimatedHours: daily_hours * 7 },
    { weekNumber: 14, phase: 'Mock', topic: 'Mock Interviews: System Design', resourceCount: 4, estimatedHours: daily_hours * 7 },
    { weekNumber: 15, phase: 'Mock', topic: 'Mock Interviews: HR & Behavioral', resourceCount: 3, estimatedHours: daily_hours * 7 },
    { weekNumber: 16, phase: 'Mock', topic: 'Final Review & Revision', resourceCount: 5, estimatedHours: daily_hours * 7 },
  ]

  const startDate = new Date()
  const endDate = target_date ? new Date(target_date) : new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: req.userId!,
      targetCompany: target_company || 'Amazon',
      currentLevel: current_level || 'Intermediate',
      dailyHours: daily_hours || 4,
      startDate,
      endDate,
      weeks: {
        create: weeks
      }
    },
    include: { weeks: { orderBy: { weekNumber: 'asc' } } }
  })

  res.json(roadmap)
})

router.get('/:userId/active', async (req: Request, res: Response) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: String(req.params.userId) },
    orderBy: { createdAt: 'desc' },
    include: { weeks: { orderBy: { weekNumber: 'asc' } } }
  })
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found', code: 'NOT_FOUND' })
  res.json(roadmap)
})

router.patch('/week/:weekId/complete', async (req: Request, res: Response) => {
  const week = await prisma.roadmapWeek.update({
    where: { id: String(req.params.weekId) },
    data: { completed: req.body.completed ?? true }
  })
  res.json(week)
})

export default router
