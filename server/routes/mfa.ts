import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { setupMfa, confirmMfa, disableMfa, verifyMfa } from '../controllers/mfa.controller.js'

const router = Router()

router.get('/setup', authenticate, setupMfa)
router.post('/confirm', authenticate, confirmMfa)
router.delete('/disable', authenticate, disableMfa)
router.post('/verify', verifyMfa)

export default router
