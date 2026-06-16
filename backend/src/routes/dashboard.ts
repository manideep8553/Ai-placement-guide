import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getDashboard } from '../services/dashboardService'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getDashboard(req.userId!)
    res.json(data)
  } catch (err: any) {
    console.error('Dashboard error:', err)
    const status = err.status || 500
    res.status(status).json({
      error: err.message || 'Failed to fetch dashboard',
      code: err.code || 'DASHBOARD_ERROR',
    })
  }
})

export default router
