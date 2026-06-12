import { Router, Request, Response } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../index'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  college: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.number().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' })
    }
    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        college: data.college,
        branch: data.branch,
        graduationYear: data.graduationYear,
        profile: { create: {} }
      },
      select: { id: true, email: true, name: true, college: true, branch: true, graduationYear: true }
    })
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.status(201).json({ user, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: err.issues })
    }
    res.status(500).json({ error: 'Registration failed', code: 'REGISTRATION_ERROR' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) {
      return res.status(401).json({ error: 'Email not found', code: 'EMAIL_NOT_FOUND' })
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' })
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
    const { passwordHash: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: err.issues })
    }
    res.status(500).json({ error: 'Login failed', code: 'LOGIN_ERROR' })
  }
})

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' })
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, name: true } })
    if (!user) {
      return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' })
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' })
    res.json({ user, token })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' })
  }
})

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

export default router
