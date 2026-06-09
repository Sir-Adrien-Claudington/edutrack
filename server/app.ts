import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loginLimiter, registerLimiter, apiLimiter } from './middleware/rateLimiter.js'
import authRoutes from './routes/auth.js'
import classroomRoutes from './routes/classrooms.js'
import assignmentRoutes from './routes/assignments.js'
import submissionRoutes from './routes/submissions.js'
import analyticsRoutes from './routes/analytics.js'
import messageRoutes from './routes/messages.js'
import exportRoutes from './routes/export.js'
import gradeBoundaryRoutes from './routes/gradeBoundary.js'
import gradeTrackerRoutes from './routes/gradeTracker.js'
import termRoutes from './routes/terms.js'
import externalGradeRoutes from './routes/externalGrades.js'
import unitRoutes from './routes/units.js'
import understandingLevelRoutes from './routes/understandingLevels.js'
import adminRoutes from './routes/admin.js'
import notificationRoutes from './routes/notifications.js'
import gradeGoalRoutes from './routes/gradeGoals.js'
import rubricRoutes from './routes/rubrics.js'
import templateRoutes from './routes/templates.js'
import lessonPlanRoutes from './routes/lessonPlans.js'
import studentRoutes from './routes/students.js'
import announcementRoutes from './routes/announcements.js'
import googleRoutes from './routes/google.routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:4000']
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true)
      else callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  app.use(cookieParser())
  app.use(express.json({ limit: '1mb' }))

  app.use(apiLimiter)
  app.use('/api/auth/login', loginLimiter)
  app.use('/api/auth/register', registerLimiter)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV ?? 'development' })
  })

  const APP_VERSION = process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.npm_package_version ?? 'dev'
  app.get('/api/version', (_req, res) => { res.json({ version: APP_VERSION }) })

  app.use('/api/auth', authRoutes)
  app.use('/api/classrooms', classroomRoutes)
  app.use('/api/assignments', assignmentRoutes)
  app.use('/api/submissions', submissionRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/export', exportRoutes)
  app.use('/api/grade-boundaries', gradeBoundaryRoutes)
  app.use('/api/grade-tracker', gradeTrackerRoutes)
  app.use('/api/terms', termRoutes)
  app.use('/api/external-grades', externalGradeRoutes)
  app.use('/api/units', unitRoutes)
  app.use('/api/understanding-levels', understandingLevelRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/grade-goals', gradeGoalRoutes)
  app.use('/api/rubrics', rubricRoutes)
  app.use('/api/templates', templateRoutes)
  app.use('/api/lesson-plans', lessonPlanRoutes)
  app.use('/api/students', studentRoutes)
  app.use('/api/announcements', announcementRoutes)
  app.use('/api/google', googleRoutes)

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '../dist')))
    app.get('*path', (_req, res) => { res.sendFile(join(__dirname, '../dist/index.html')) })
  }

  Sentry.setupExpressErrorHandler(app)

  app.use((err: any, _req: any, res: any, next: any) => {
    if (err.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request too large (max 1MB)' })
      return
    }
    next(err)
  })

  return app
}
