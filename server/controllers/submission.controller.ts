import { Response } from 'express'
import { prisma } from '../prisma/client.js'
import { AuthRequest } from '../middleware/auth.js'
import { gradeSubmission } from '../services/grading.service.js'
import { generateStudentFeedback } from '../services/ai.service.js'
import { getStudentProgress } from '../services/analytics.service.js'
import { createNotification } from './notification.controller.js'
import { checkPlagiarism } from './plagiarism.controller.js'
import { logger } from '../lib/logger.js'

export async function submitAssignment(req: AuthRequest, res: Response) {
  const { assignmentId, answers } = req.body
  if (!assignmentId || !answers) {
    res.status(400).json({ error: 'assignmentId and answers are required' })
    return
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: true,
      rubric: { include: { criteria: { orderBy: { order: 'asc' } } } },
      classroom: { select: { teacherId: true } },
    },
  })
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' })
    return
  }

  // Access control (IDOR guard): only a student enrolled in this assignment's
  // class may submit, and only while the assignment is published. Checked
  // before any resubmission state is read.
  const enrolled = await prisma.enrollment.findUnique({
    where: {
      studentId_classroomId: { studentId: req.user!.id, classroomId: assignment.classroomId },
    },
  })
  if (!enrolled) {
    res.status(403).json({ error: 'You are not enrolled in the class for this assignment.' })
    return
  }
  if (assignment.status !== 'PUBLISHED') {
    res.status(403).json({ error: 'This assignment is not open for submissions.' })
    return
  }

  // A student may have a previous submission. Decide whether this is a first
  // submission or an allowed resubmission.
  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: req.user!.id },
  })
  const isResubmission = !!existing
  if (existing) {
    if (!assignment.resubmissionsAllowed) {
      res.status(409).json({ error: 'Resubmissions are not allowed for this assignment.' })
      return
    }
    if (existing.resubmissionCount >= assignment.maxResubmissions) {
      res.status(409).json({
        error: `You have reached the maximum of ${assignment.maxResubmissions} resubmission(s).`,
      })
      return
    }
  }

  const { gradedAnswers, totalScore } = gradeSubmission(assignment.questions, answers)

  const answerData = gradedAnswers.map((a) => ({
    questionId: a.questionId,
    responseText: a.responseText,
    isCorrect: a.isCorrect,
    pointsAwarded: a.pointsAwarded,
  }))

  let submission
  if (existing) {
    // deleteMany + update must be atomic — if update fails, old answers are already gone
    submission = await prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({ where: { submissionId: existing.id } })
      return tx.submission.update({
        where: { id: existing.id },
        data: {
          totalScore,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          resubmissionCount: existing.resubmissionCount + 1,
          answers: { create: answerData },
        },
        include: { answers: true },
      })
    })
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: req.user!.id,
        totalScore,
        status: 'SUBMITTED',
        answers: { create: answerData },
      },
      include: { answers: true },
    })
  }

  res.status(201).json(submission)

  // Notify the teacher that a student submitted (or resubmitted).
  if (assignment.classroom?.teacherId) {
    const student = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    })
    createNotification(
      assignment.classroom.teacherId,
      'SUBMISSION',
      isResubmission ? 'A student resubmitted work' : 'New submission received',
      `${student?.name ?? 'A student'} ${isResubmission ? 'resubmitted' : 'submitted'} "${assignment.title}".`,
      `/teacher/submission/${submission.id}`
    ).catch((e: Error) =>
      logger.error({ err: e.message }, '[notification] teacher submission alert failed')
    )
  }

  // Notify student their assignment was graded (for auto-graded submissions)
  if (totalScore !== null) {
    createNotification(
      req.user!.id,
      'GRADED',
      'Your assignment was graded',
      `Your submission for "${assignment.title}" has been graded.`,
      `/student/submission/${submission.id}`
    ).catch((e: Error) =>
      logger.error({ err: e.message }, '[notification] student graded alert failed')
    )
  }

  // Fire plagiarism check async (fire and forget)
  checkPlagiarism(submission.id)

  try {
    const student = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    })
    const progress = await getStudentProgress(req.user!.id)
    const weakTags = progress.weakAreas.map((w) => w.tag)
    const aiSuggestion = await generateStudentFeedback({
      firstName: student!.name.split(' ')[0],
      assignmentTitle: assignment.title,
      score: totalScore,
      totalPoints: assignment.totalPoints,
      weakTags,
      trend: progress.trend,
      rubricCriteria: (assignment as any).rubric?.criteria ?? undefined,
    })
    await prisma.feedback.upsert({
      where: { submissionId: submission.id },
      create: { submissionId: submission.id, aiSuggestion },
      update: { aiSuggestion },
    })
  } catch (err) {
    // Log message only — Anthropic SDK errors include Authorization header (API key)
    logger.error({ err: (err as any)?.message ?? String(err) }, 'AI feedback generation failed')
  }
}

export async function getSubmission(req: AuthRequest, res: Response) {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: {
      answers: { include: { question: true } },
      feedback: true,
      student: { select: { id: true, name: true, email: true } },
      assignment: { include: { classroom: { select: { teacherId: true } } } },
    },
  })
  if (!submission) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  // Students may only read their own submission.
  if (req.user!.role === 'STUDENT' && submission.studentId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  // Teachers may only read submissions in their own classrooms.
  if (req.user!.role === 'TEACHER' && submission.assignment.classroom.teacherId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  res.json(submission)
}

export async function getAssignmentSubmissions(req: AuthRequest, res: Response) {
  const { assignmentId } = req.params
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { classroom: true },
  })
  if (!assignment || assignment.classroom.teacherId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: { student: { select: { id: true, name: true, email: true } }, feedback: true },
    orderBy: { submittedAt: 'desc' },
  })
  res.json(submissions)
}

export async function getMySubmissions(req: AuthRequest, res: Response) {
  const submissions = await prisma.submission.findMany({
    where: { studentId: req.user!.id },
    include: { assignment: { select: { title: true, totalPoints: true } }, feedback: true },
    orderBy: { submittedAt: 'desc' },
  })
  res.json(submissions)
}

export async function teacherGrade(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { grades, teacherNote } = req.body

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      assignment: { select: { title: true, classroom: { select: { teacherId: true } } } },
    },
  })
  if (!submission) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (submission.assignment.classroom.teacherId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const totalScore = await prisma.$transaction(async (tx) => {
    if (Array.isArray(grades)) {
      await Promise.all(
        (grades as { answerId: string; pointsAwarded: number }[]).map((g) =>
          tx.answer.update({
            where: { id: g.answerId },
            data: { pointsAwarded: Math.max(0, Number(g.pointsAwarded)) },
          })
        )
      )
    }

    const answers = await tx.answer.findMany({
      where: { submissionId: id },
      include: { question: { select: { points: true } } },
    })
    const totalPoints = answers.reduce((s, a) => s + a.question.points, 0)
    const earned = answers.reduce((s, a) => s + (a.pointsAwarded ?? 0), 0)
    const score = totalPoints > 0 ? (earned / totalPoints) * 100 : 0

    await tx.submission.update({ where: { id }, data: { totalScore: score, status: 'GRADED' } })

    if (teacherNote !== undefined) {
      await tx.feedback.upsert({
        where: { submissionId: id },
        create: { submissionId: id, teacherNote: String(teacherNote) },
        update: { teacherNote: String(teacherNote) },
      })
    }

    return score
  })

  createNotification(
    submission.studentId,
    'GRADED',
    'Your assignment was graded',
    `Your submission for "${submission.assignment.title}" has been graded. Score: ${totalScore.toFixed(0)}%`,
    `/student/submission/${id}`
  ).catch((e: Error) =>
    logger.error({ err: e.message }, '[notification] teacher grade alert failed')
  )

  res.json({ ok: true, totalScore })
}

export async function dismissPlagiarism(req: AuthRequest, res: Response) {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { assignment: { include: { classroom: true } } },
  })
  if (!submission) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (req.user!.role === 'TEACHER' && submission.assignment.classroom.teacherId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  await prisma.submission.update({
    where: { id: req.params.id },
    data: { plagiarismFlag: false, plagiarismReport: null },
  })
  res.json({ ok: true })
}
