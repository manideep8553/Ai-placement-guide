import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }
})

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' }
})
app.use('/api/', limiter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

import authRoutes from './routes/auth'
import scoreRoutes from './routes/score'
import companyRoutes from './routes/company'
import gapAnalysisRoutes from './routes/gapAnalysis'
import interviewRoutes from './routes/interview'
import codingRoutes from './routes/coding'
import roadmapRoutes from './routes/roadmap'
import resumeRoutes from './routes/resume'

app.use('/api/auth', authRoutes)
app.use('/api/score', scoreRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/gap-analysis', gapAnalysisRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/problems', codingRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/resume', resumeRoutes)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-interview', (sessionId: string) => {
    socket.join(`interview:${sessionId}`)
  })

  socket.on('user_audio_chunk', async (data: { sessionId: string; audioChunk: string }) => {
    const mockTranscript = "I believe my strength is my ability to learn quickly and adapt to new technologies."
    const fillerWords = { umm: Math.floor(Math.random() * 2), ah: Math.floor(Math.random() * 2), like: Math.floor(Math.random() * 2) }
    const wpm = 120 + Math.floor(Math.random() * 30)

    io.to(`interview:${data.sessionId}`).emit('ai_response', {
      transcript: mockTranscript,
      filler_words: fillerWords,
      wpm,
      next_question: "That's great! Can you tell me about a time you faced a challenging project?",
      feedback: { clarity: 8, confidence: 7, structure: 6 }
    })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
