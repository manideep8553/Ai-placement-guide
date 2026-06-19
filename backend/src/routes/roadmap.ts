import { Router, Response } from 'express'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const model = process.env.OPENAI_ROADMAP_MODEL || 'gpt-5.5'
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey && !apiKey.includes('placeholder') ? new OpenAI({ apiKey }) : null

const roadmapSchema = z.object({
  summary: z.string(),
  weeks: z.array(z.object({
    weekNumber: z.number().int().positive(),
    phase: z.enum(['Foundation', 'Core DSA', 'Advanced', 'Mock']),
    topic: z.string(),
    estimatedHours: z.number().positive(),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['article', 'video', 'practice']),
    })).max(5),
  })).min(4).max(24),
})

type ContextData = {
  user: {
    name: string
    college: string | null
    branch: string | null
    graduationYear: number | null
    profile: { currentLevel: string | null; targetCompany: string | null; bio: string | null } | null
  } | null
  gapAnalysis: {
    strengths: string[]
    weakAreas: string[]
    missingSkills: string[]
    targetRole: string | null
  } | null
  score: {
    aptitude: number
    dsa: number
    coreSubjects: number
    communication: number
    resumeScore: number
    overall: number
  } | null
}

async function getUserContext(userId: string): Promise<ContextData> {
  const [user, gapAnalysis, score] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        college: true,
        branch: true,
        graduationYear: true,
        profile: { select: { currentLevel: true, targetCompany: true, bio: true } },
      },
    }),
    prisma.gapAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { strengths: true, weakAreas: true, missingSkills: true, targetRole: true },
    }),
    prisma.placementScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      select: {
        aptitude: true,
        dsa: true,
        coreSubjects: true,
        communication: true,
        resumeScore: true,
        overall: true,
      },
    }),
  ])
  return { user, gapAnalysis, score }
}

function contextPrompt(context: ContextData) {
  return JSON.stringify(context, null, 2)
}

function requireOpenAI(res: Response) {
  if (openai) return true
  res.status(503).json({
    error: 'The roadmap AI service is not configured. Set OPENAI_API_KEY on the backend.',
    code: 'AI_NOT_CONFIGURED',
  })
  return false
}

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireOpenAI(res)) return

    const {
      target_company,
      current_level,
      daily_hours,
      target_date,
      goal,
      skills = [],
      conversation_id,
    } = req.body as {
      target_company?: string
      current_level?: string
      daily_hours?: number
      target_date?: string
      goal?: string
      skills?: string[]
      conversation_id?: string
    }

    const targetCompany = target_company?.trim() || 'Amazon'
    const currentLevel = current_level?.trim() || 'Intermediate'
    const dailyHours = Math.min(12, Math.max(1, Number(daily_hours) || 4))
    const startDate = new Date()
    const requestedEndDate = target_date ? new Date(target_date) : new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
    const endDate = Number.isNaN(requestedEndDate.getTime()) || requestedEndDate <= startDate
      ? new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
      : requestedEndDate
    const totalWeeks = Math.min(24, Math.max(4, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))))
    const normalizedSkills = skills.map(skill => skill.trim()).filter(Boolean).slice(0, 30)
    const userContext = await getUserContext(req.userId!)

    if (conversation_id) {
      const ownedConversation = await prisma.roadmapConversation.findFirst({
        where: { id: conversation_id, userId: req.userId! },
        select: { id: true },
      })
      if (!ownedConversation) {
        return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' })
      }
    }

    const generationRequest = [
      `Create a concrete ${totalWeeks}-week placement preparation roadmap.`,
      `Goal: ${goal?.trim() || `Become interview-ready for ${targetCompany}`}`,
      `Target company: ${targetCompany}`,
      `Current level: ${currentLevel}`,
      `Known skills: ${normalizedSkills.join(', ') || 'Not provided'}`,
      `Available study time: ${dailyHours} hours per day`,
      `Target date: ${endDate.toISOString().slice(0, 10)}`,
      `Existing user signals: ${contextPrompt(userContext)}`,
      'Make each week specific, achievable, and ordered by prerequisites.',
      'Use stable, reputable resource URLs only. Prefer official documentation, LeetCode, GeeksforGeeks, or well-known educational sources.',
      'Keep each week within the available weekly hours and include practice and review.',
    ].join('\n')

    const response = await openai!.responses.parse({
      model,
      instructions: 'You are an expert technical placement coach. Generate personalized, realistic learning roadmaps as structured data.',
      input: generationRequest,
      text: { format: zodTextFormat(roadmapSchema, 'learning_roadmap') },
      max_output_tokens: 5000,
    })

    const generated = response.output_parsed
    if (!generated) {
      return res.status(502).json({ error: 'The AI did not return a valid roadmap.', code: 'INVALID_AI_RESPONSE' })
    }

    const result = await prisma.$transaction(async tx => {
      const roadmap = await tx.roadmap.create({
        data: {
          userId: req.userId!,
          targetCompany,
          currentLevel,
          dailyHours,
          startDate,
          endDate,
          weeks: {
            create: generated.weeks.map((week, index) => ({
              weekNumber: index + 1,
              phase: week.phase,
              topic: week.topic,
              resourceCount: week.resources.length,
              estimatedHours: Math.min(week.estimatedHours, dailyHours * 7),
              resources: week.resources,
            })),
          },
        },
        include: { weeks: { orderBy: { weekNumber: 'asc' } } },
      })

      const conversation = conversation_id
        ? await tx.roadmapConversation.update({
            where: { id: conversation_id },
            data: {
              roadmapId: roadmap.id,
              goal: goal?.trim() || null,
              skills: normalizedSkills,
              targetCompany,
            },
          })
        : await tx.roadmapConversation.create({
            data: {
              userId: req.userId!,
              roadmapId: roadmap.id,
              title: `${targetCompany} roadmap`,
              goal: goal?.trim() || null,
              skills: normalizedSkills,
              targetCompany,
            },
          })

      await tx.roadmapMessage.createMany({
        data: [
          {
            conversationId: conversation.id,
            role: 'USER',
            content: generationRequest,
          },
          {
            conversationId: conversation.id,
            role: 'ASSISTANT',
            content: generated.summary,
            model,
          },
        ],
      })

      return { roadmap, conversationId: conversation.id, summary: generated.summary }
    })

    res.json(result)
  } catch (error) {
    console.error('Roadmap generation failed:', error)
    res.status(502).json({
      error: 'Unable to generate the roadmap right now. Check the AI service configuration and try again.',
      code: 'ROADMAP_GENERATION_ERROR',
    })
  }
})

router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  const conversations = await prisma.roadmapConversation.findMany({
    where: { userId: req.userId! },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  res.json(conversations)
})

router.post('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  const title = typeof req.body.title === 'string' && req.body.title.trim()
    ? req.body.title.trim().slice(0, 80)
    : 'Roadmap coaching'
  const conversation = await prisma.roadmapConversation.create({
    data: {
      userId: req.userId!,
      title,
      roadmapId: typeof req.body.roadmapId === 'string' ? req.body.roadmapId : null,
    },
    include: { messages: true },
  })
  res.status(201).json(conversation)
})

router.get('/conversations/:conversationId', authenticate, async (req: AuthRequest, res: Response) => {
  const conversation = await prisma.roadmapConversation.findFirst({
    where: { id: String(req.params.conversationId), userId: req.userId! },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      roadmap: { include: { weeks: { orderBy: { weekNumber: 'asc' } } } },
    },
  })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' })
  res.json(conversation)
})

router.post('/conversations/:conversationId/messages/stream', authenticate, async (req: AuthRequest, res: Response) => {
  const conversationId = String(req.params.conversationId)
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
  if (!content) return res.status(400).json({ error: 'Message is required', code: 'VALIDATION_ERROR' })
  if (!requireOpenAI(res)) return

  const conversation = await prisma.roadmapConversation.findFirst({
    where: { id: conversationId, userId: req.userId! },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 30 },
      roadmap: { include: { weeks: { orderBy: { weekNumber: 'asc' } } } },
    },
  })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' })

  const userMessage = await prisma.roadmapMessage.create({
    data: { conversationId, role: 'USER', content },
  })
  await prisma.roadmapConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  res.write(`event: meta\ndata: ${JSON.stringify({ userMessage })}\n\n`)

  let assistantContent = ''
  try {
    const userContext = await getUserContext(req.userId!)
    const roadmapContext = conversation.roadmap
      ? JSON.stringify({
          targetCompany: conversation.roadmap.targetCompany,
          currentLevel: conversation.roadmap.currentLevel,
          dailyHours: conversation.roadmap.dailyHours,
          endDate: conversation.roadmap.endDate,
          weeks: conversation.roadmap.weeks.map(week => ({
            week: week.weekNumber,
            phase: week.phase,
            topic: week.topic,
            completed: week.completed,
          })),
        })
      : 'No roadmap has been generated in this conversation yet.'

    const stream = await openai!.responses.create({
      model,
      instructions: [
        'You are PrepCoach, a concise and practical learning-roadmap coach.',
        'Use the saved conversation, user profile signals, skills, goals, target company, and current roadmap.',
        'Answer the latest message directly. Give concrete next actions, schedules, and tradeoffs.',
        'Do not claim that you changed the saved roadmap. If the user asks for structural changes, explain the changes and tell them to regenerate the roadmap with the updated inputs.',
        `User context: ${contextPrompt(userContext)}`,
        `Conversation goal: ${conversation.goal || 'Not specified'}`,
        `Known skills: ${conversation.skills.join(', ') || 'Not specified'}`,
        `Saved roadmap: ${roadmapContext}`,
      ].join('\n'),
      input: [
        ...conversation.messages.map(message => ({
          role: message.role === 'ASSISTANT' ? 'assistant' as const : 'user' as const,
          content: message.content,
        })),
        { role: 'user' as const, content },
      ],
      max_output_tokens: 1800,
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        assistantContent += event.delta
        res.write(`event: delta\ndata: ${JSON.stringify({ delta: event.delta })}\n\n`)
      } else if (event.type === 'error') {
        throw new Error(event.message)
      }
    }

    const assistantMessage = await prisma.roadmapMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: assistantContent,
        model,
      },
    })
    await prisma.roadmapConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
    res.write(`event: done\ndata: ${JSON.stringify({ message: assistantMessage })}\n\n`)
    res.end()
  } catch (error) {
    console.error('Roadmap chat failed:', error)
    if (assistantContent) {
      await prisma.roadmapMessage.create({
        data: { conversationId, role: 'ASSISTANT', content: assistantContent, model },
      })
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'The AI response was interrupted. Please try again.' })}\n\n`)
    res.end()
  }
})

router.get('/active', authenticate, async (req: AuthRequest, res: Response) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { weeks: { orderBy: { weekNumber: 'asc' } } },
  })
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found', code: 'NOT_FOUND' })
  res.json(roadmap)
})

router.patch('/week/:weekId/complete', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.roadmapWeek.findFirst({
    where: { id: String(req.params.weekId), roadmap: { userId: req.userId! } },
    select: { id: true, roadmapId: true },
  })
  if (!existing) return res.status(404).json({ error: 'Roadmap week not found', code: 'NOT_FOUND' })

  const week = await prisma.roadmapWeek.update({
    where: { id: existing.id },
    data: { completed: req.body.completed ?? true },
  })
  const counts = await prisma.roadmapWeek.groupBy({
    by: ['completed'],
    where: { roadmapId: existing.roadmapId },
    _count: true,
  })
  const total = counts.reduce((sum, item) => sum + item._count, 0)
  const completed = counts.find(item => item.completed)?._count || 0
  await prisma.roadmap.update({
    where: { id: existing.roadmapId },
    data: { overallProgress: total ? Math.round((completed / total) * 100) : 0 },
  })
  res.json(week)
})

export default router
