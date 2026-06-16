import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getPlacementTwin } from '../services/placementTwinService'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const twin = await getPlacementTwin(req.userId!)
    res.json(twin)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to compute placement twin', code: 'TWIN_ERROR' })
  }
})

export default router
