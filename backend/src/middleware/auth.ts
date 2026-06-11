import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' })
  }
}
