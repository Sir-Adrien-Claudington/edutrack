import * as Sentry from '@sentry/node'
import dotenv from 'dotenv'
import { prisma } from './prisma/client.js'
import { createCalendarEvent } from './services/google.service.js'
import { createApp } from './app.js'
import { logger } from './lib/logger.js'

dotenv.config()
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}`, override: true })

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: 0.1,
  enabled: !!process.env.SENTRY_DSN,
})

if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ANTHROPIC_API_KEY', 'CORS_ORIGIN', 'FRONTEND_URL']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    logger.error({ missing }, 'Missing required production env vars')
    process.exit(1)
  }
  logger.info('Production environment validated')
}

const app = createApp()
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running')
  startReminderScheduler()
})

export default app


function startReminderScheduler() {
  runDailyReminders()
  runDataRetentionPurge()
  setInterval(runDailyReminders, 24 * 60 * 60 * 1000)
  setInterval(runDataRetentionPurge, 24 * 60 * 60 * 1000)
}

async function runDataRetentionPurge() {
  try {
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    const [notifs, auditLogs, messages] = await Promise.all([
      prisma.notification.deleteMany({ where: { createdAt: { lt: ninetyDaysAgo } } }),
      prisma.auditLog.deleteMany({ where: { createdAt: { lt: oneYearAgo } } }),
      prisma.message.deleteMany({ where: { createdAt: { lt: oneYearAgo } } }),
    ])

    if (notifs.count || auditLogs.count || messages.count) {
      logger.info({ notifs: notifs.count, auditLogs: auditLogs.count, messages: messages.count }, 'Data retention purge complete')
    }
  } catch (err: any) {
    logger.error({ err: err?.message }, 'Data retention purge failed')
  }
}

async function runDailyReminders() {
  try {
    const now = new Date()
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const upcoming = await prisma.assignment.findMany({
      where: { status: 'PUBLISHED', dueDate: { gte: now, lte: in48h } },
      include: { classroom: { include: { enrollments: { select: { studentId: true } } } } },
    })

    for (const assignment of upcoming) {
      for (const { studentId } of assignment.classroom.enrollments) {
        const already = await prisma.notification.findFirst({
          where: { userId: studentId, type: 'ASSIGNMENT_REMINDER', message: { contains: assignment.id } },
        })
        if (already) continue
        await prisma.notification.create({
          data: {
            userId: studentId,
            type: 'ASSIGNMENT_REMINDER',
            title: `Due soon: ${assignment.title}`,
            message: `[${assignment.id}] "${assignment.title}" is due ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'soon'}.`,
            link: `/student/assignment/${assignment.id}`,
          },
        })
        prisma.user.findUnique({
          where: { id: studentId },
          select: { googleCalendarLinked: true, googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true },
        }).then(student => {
          if (student?.googleCalendarLinked && student.googleAccessToken && student.googleRefreshToken && assignment.dueDate) {
            createCalendarEvent(
              studentId, student.googleAccessToken, student.googleRefreshToken, student.googleTokenExpiry,
              { title: `${assignment.title} — due soon`, dueDate: new Date(assignment.dueDate) },
            ).catch(() => {})
          }
        }).catch(() => {})
      }
    }

    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const justOverdue = await prisma.assignment.findMany({
      where: { status: 'PUBLISHED', dueDate: { gte: dayAgo, lt: now } },
      include: {
        classroom: { select: { teacherId: true, enrollments: { select: { studentId: true } } } },
        submissions: { select: { studentId: true } },
      },
    })

    for (const assignment of justOverdue) {
      const submittedIds = new Set(assignment.submissions.map(s => s.studentId))
      const missingCount = assignment.classroom.enrollments.filter(e => !submittedIds.has(e.studentId)).length
      if (missingCount === 0) continue
      const already = await prisma.notification.findFirst({
        where: { userId: assignment.classroom.teacherId, type: 'LATE_SUBMISSIONS', title: assignment.id },
      })
      if (already) continue
      await prisma.notification.create({
        data: {
          userId: assignment.classroom.teacherId,
          type: 'LATE_SUBMISSIONS',
          title: assignment.id,
          message: `"${assignment.title}" is past due with ${missingCount} missing submission${missingCount === 1 ? '' : 's'}.`,
        },
      })
    }
  } catch (err: unknown) {
    logger.warn({ err: err instanceof Error ? err.message : String(err) }, 'Scheduler run failed')
  }
}
