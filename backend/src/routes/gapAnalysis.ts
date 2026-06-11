import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  const jobId = `gap-${Date.now()}`
  const { resume_id, leetcode_username, github_username, target_role } = req.body
  
  // Mock - in production would enqueue BullMQ job
  const result = {
    resumeSkills: ['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Git', 'Docker', 'MongoDB', 'Express', 'TypeScript'],
    leetcodeStats: JSON.stringify({ solved: 124, rating: 1689, weakTopics: ['DP', 'Graphs', 'System Design'] }),
    githubStats: JSON.stringify({ repos: 24, languages: [{ name: 'JavaScript', percentage: 45 }, { name: 'Python', percentage: 30 }, { name: 'TypeScript', percentage: 15 }, { name: 'Java', percentage: 10 }], contributions: 587 }),
    missingSkills: ['Docker', 'Kubernetes', 'AWS Lambda', 'System Design', 'Redis', 'GraphQL', 'CI/CD', 'Microservices'],
    weakAreas: ['Dynamic Programming', 'Graphs', 'System Design', 'OS Concepts', 'Network Protocols'],
    strengths: ['React', 'Node.js', 'Python', 'JavaScript', 'REST APIs', 'SQL', 'Git', 'HTML/CSS'],
    overallMatch: 65,
    targetRole: target_role || 'SDE',
  }

  const analysis = await prisma.gapAnalysis.create({
    data: {
      userId: req.userId!,
      resumeSkills: result.resumeSkills,
      leetcodeStats: result.leetcodeStats,
      githubStats: result.githubStats,
      missingSkills: result.missingSkills,
      weakAreas: result.weakAreas,
      strengths: result.strengths,
      overallMatch: result.overallMatch,
      targetRole: result.targetRole,
    }
  })

  res.json({ jobId, id: analysis.id, ...result })
})

router.get('/:jobId/status', (req: Request, res: Response) => {
  res.json({ status: 'done', progress: 100 })
})

router.get('/:id/result', async (req: Request, res: Response) => {
  try {
    const analysis = await prisma.gapAnalysis.findUnique({ where: { id: String(req.params.id) } })
    if (!analysis) return res.status(404).json({ error: 'Analysis not found', code: 'NOT_FOUND' })
    res.json(analysis)
  } catch {
    res.status(500).json({ error: 'Failed to fetch analysis', code: 'FETCH_ERROR' })
  }
})

export default router
