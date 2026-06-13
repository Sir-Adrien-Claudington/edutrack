import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import type { Express } from 'express'

const JWT_SECRET = 'test-jwt-secret-abcdefghijklmnop'
const JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefghijklm'

process.env.JWT_SECRET = JWT_SECRET
process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET
process.env.NODE_ENV = 'test'

// Mock only the models touched on the access-control paths under test.
vi.mock('../prisma/client.js', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    assignment: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn(), findFirst: vi.fn() },
    submission: { findFirst: vi.fn(), create: vi.fn() },
    parentContact: { create: vi.fn() },
  },
}))

import { createApp } from '../app.js'
import { prisma } from '../prisma/client.js'

const db = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> }
  assignment: { findUnique: ReturnType<typeof vi.fn> }
  enrollment: { findUnique: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> }
  submission: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> }
  parentContact: { create: ReturnType<typeof vi.fn> }
}

// Tokens without `tv` skip the tokenVersion DB lookup in authenticate().
const studentToken = jwt.sign({ id: 'student-A', role: 'STUDENT', email: 'a@test.co' }, JWT_SECRET)
const teacherToken = jwt.sign({ id: 'teacher-1', role: 'TEACHER', email: 't@test.co' }, JWT_SECRET)

let app: Express

beforeAll(() => {
  app = createApp()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('IDOR — assignment submission', () => {
  it('blocks a student submitting to a class they are not enrolled in (403)', async () => {
    db.assignment.findUnique.mockResolvedValue({
      id: 'asg-1',
      classroomId: 'class-OTHER',
      status: 'PUBLISHED',
      questions: [],
      rubric: null,
      resubmissionsAllowed: false,
      maxResubmissions: 0,
      classroom: { teacherId: 'teacher-X' },
    })
    db.enrollment.findUnique.mockResolvedValue(null) // not enrolled

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        assignmentId: 'asg-1',
        answers: [{ questionId: 'q1', responseText: 'the mantle flows' }],
      })

    expect(res.status).toBe(403)
    expect(db.submission.create).not.toHaveBeenCalled()
  })

  it('blocks submission to an unpublished (DRAFT) assignment even if enrolled (403)', async () => {
    db.assignment.findUnique.mockResolvedValue({
      id: 'asg-2',
      classroomId: 'class-MINE',
      status: 'DRAFT',
      questions: [],
      rubric: null,
      resubmissionsAllowed: false,
      maxResubmissions: 0,
      classroom: { teacherId: 'teacher-X' },
    })
    db.enrollment.findUnique.mockResolvedValue({
      studentId: 'student-A',
      classroomId: 'class-MINE',
    })

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ assignmentId: 'asg-2', answers: [{ questionId: 'q1', responseText: 'answer' }] })

    expect(res.status).toBe(403)
    expect(db.submission.create).not.toHaveBeenCalled()
  })
})

describe('IDOR — parent contact', () => {
  it('blocks a teacher logging a contact for a student not in their classroom (403)', async () => {
    db.enrollment.findFirst.mockResolvedValue(null) // student not in teacher's class

    const res = await request(app)
      .post('/api/students/student-OTHER/contacts')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ type: 'phone', summary: 'spoke with parent' })

    expect(res.status).toBe(403)
    expect(db.parentContact.create).not.toHaveBeenCalled()
  })
})
