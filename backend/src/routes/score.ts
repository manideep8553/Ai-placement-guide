import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const score = await prisma.placementScore.findFirst({
      where: { userId: String(req.params.userId) },
      orderBy: { calculatedAt: 'desc' },
      include: { companyChances: true }
    })
    if (!score) {
      return res.status(404).json({ error: 'No score found', code: 'SCORE_NOT_FOUND' })
    }
    res.json(score)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch score', code: 'SCORE_FETCH_ERROR' })
  }
})

router.post('/calculate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { aptitude_quiz_results, dsa_stats, core_quiz_results, communication_session_id, resume_id } = req.body
    // Mock calculation - in production uses GPT-4o
    const aptitude = aptitude_quiz_results?.score || 70
    const dsa = dsa_stats?.score || 65
    const coreSubjects = core_quiz_results?.score || 75
    const communication = communication_session_id ? 80 : 70
    const resumeScore = resume_id ? 85 : 60
    const overall = Math.round(aptitude * 0.2 + dsa * 0.3 + coreSubjects * 0.2 + communication * 0.15 + resumeScore * 0.15)
    
    const score = await prisma.placementScore.create({
      data: {
        userId: req.userId!,
        aptitude,
        dsa,
        coreSubjects,
        communication,
        resumeScore,
        overall,
        companyChances: {
          create: [
            { companyName: 'TCS', chancePercent: Math.min(95, overall + 15) },
            { companyName: 'Infosys', chancePercent: Math.min(95, overall + 10) },
            { companyName: 'Wipro', chancePercent: Math.min(95, overall + 5) },
            { companyName: 'Microsoft', chancePercent: Math.max(5, overall - 10) },
            { companyName: 'Amazon', chancePercent: Math.max(5, overall - 15) },
            { companyName: 'Google', chancePercent: Math.max(5, overall - 25) },
          ]
        }
      },
      include: { companyChances: true }
    })
    res.json(score)
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate score', code: 'SCORE_CALC_ERROR' })
  }
})

export default router
