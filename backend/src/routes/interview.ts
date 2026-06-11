import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/session/start', authenticate, async (req: AuthRequest, res: Response) => {
  const { type, company } = req.body
  const session = await prisma.interviewSession.create({
    data: {
      userId: req.userId!,
      type: type || 'HR',
      company: company || null,
      duration: 0,
    }
  })
  const firstQuestion = type === 'HR' 
    ? "Tell me about yourself and why you're interested in this role."
    : type === 'MANAGER'
    ? "Describe your leadership style and how you handle team conflicts."
    : "Can you explain the difference between SQL and NoSQL databases?"
  
  res.json({ sessionId: session.id, first_question: firstQuestion })
})

router.post('/session/:id/end', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.interviewSession.update({
      where: { id: String(req.params.id) },
      data: {
        duration: req.body.duration || 0,
        overallScore: Math.floor(Math.random() * 30) + 60,
        fillerCount: Math.floor(Math.random() * 10),
        fillerDetail: { umm: Math.floor(Math.random() * 5), ah: Math.floor(Math.random() * 3), like: Math.floor(Math.random() * 4) },
        wpm: 120 + Math.floor(Math.random() * 40),
        feedback: {
          confidence: Math.floor(Math.random() * 30) + 60,
          keywordCoverage: Math.floor(Math.random() * 40) + 50,
          paceAnalysis: Array.from({ length: 8 }, (_, i) => ({ segment: i + 1, wpm: 100 + Math.floor(Math.random() * 60) })),
          improvements: [
            'Work on providing more structured answers using the STAR method',
            'Reduce filler words like "umm" and "like"',
            'Include more specific metrics and examples in your responses',
            'Practice speaking at a consistent pace of 120-150 wpm',
            'Prepare more concise answers for behavioral questions',
          ]
        }
      }
    })
    res.json(session)
  } catch {
    res.status(500).json({ error: 'Failed to end session', code: 'SESSION_END_ERROR' })
  }
})

router.get('/session/:id/report', async (req: Request, res: Response) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: String(req.params.id) },
      include: { interviewMessages: true }
    })
    if (!session) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' })
    res.json(session)
  } catch {
    res.status(500).json({ error: 'Failed to fetch report', code: 'REPORT_FETCH_ERROR' })
  }
})

export default router
