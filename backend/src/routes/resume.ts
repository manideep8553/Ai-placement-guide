import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const router = Router()

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded', code: 'NO_FILE' })
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        fileName: req.file.originalname,
        fileUrl: `mock://uploads/${req.file.originalname}`,
      }
    })
    res.json({ id: resume.id, fileName: resume.fileName })
  } catch {
    res.status(500).json({ error: 'Upload failed', code: 'UPLOAD_ERROR' })
  }
})

router.post('/:id/analyze', async (req: Request, res: Response) => {
  const analysis = {
    atsScore: 74,
    sectionScores: { summary: 70, skills: 80, experience: 65, projects: 78, education: 85 },
    missingKeywords: ['Kubernetes', 'Docker', 'AWS', 'System Design', 'Microservices', 'Redis', 'CI/CD', 'GraphQL', 'TypeScript', 'Agile', 'Unit Testing', 'RESTful APIs'],
    actionVerbScore: 68,
    specificSuggestions: [
      { section: 'Summary', bullet: 'Write a compelling professional summary that highlights your key achievements', suggestion: 'Add a 2-3 line summary quantifying your impact, e.g., "Full-stack developer with 3+ years of experience building scalable web applications..."' },
      { section: 'Experience', bullet: 'Led development of a customer-facing web application', suggestion: 'Add metrics: "Led development of customer-facing web app serving 50K+ users, reducing load time by 40%"' },
      { section: 'Skills', bullet: 'Proficient in JavaScript and Python', suggestion: 'Categorize skills by proficiency level and add relevant tools/technologies' },
      { section: 'Projects', bullet: 'Built a real-time chat application', suggestion: 'Mention specific technologies used (WebSocket, Redis) and quantify users' },
      { section: 'Education', bullet: 'Built a real-time chat application', suggestion: 'Add relevant coursework and GPA if above 8.0' },
    ]
  }
  
  await prisma.resume.update({
    where: { id: String(req.params.id) },
    data: {
      atsScore: analysis.atsScore,
      sectionScores: analysis.sectionScores,
      keywordsMissing: analysis.missingKeywords,
      suggestions: analysis.specificSuggestions,
    }
  })

  res.json(analysis)
})

router.get('/:id/feedback', async (req: Request, res: Response) => {
  const resume = await prisma.resume.findUnique({ where: { id: String(req.params.id) } })
  if (!resume) return res.status(404).json({ error: 'Resume not found', code: 'NOT_FOUND' })
  res.json(resume)
})

router.post('/:id/rewrite-bullet', async (req: Request, res: Response) => {
  const { bullet_text, role } = req.body
  const improved = `Led cross-functional team to deliver scalable ${role || 'software'} solutions, improving system performance by 40% and reducing deployment time by 60% through implementation of CI/CD pipelines and microservices architecture.`
  res.json({ original: bullet_text, improved, role })
})

export default router
