import { Router } from 'express'
import {
  register,
  login,
  refresh,
  me,
  logout,
  deleteOwnAccount,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)
router.delete('/me', authenticate, deleteOwnAccount)

export default router
