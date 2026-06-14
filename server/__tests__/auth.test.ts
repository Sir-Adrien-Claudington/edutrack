import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import type { Express } from 'express'

const JWT_SECRET = 'test-jwt-secret-abcdefghijklmnop'
const JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefghijklm'

process.env.JWT_SECRET = JWT_SECRET
process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET
process.env.NODE_ENV = 'test'

vi.mock('../prisma/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$12$hashed'),
    compare: vi.fn(),
  },
}))

import { createApp } from '../app.js'
import { prisma } from '../prisma/client.js'
import bcrypt from 'bcryptjs'

const mockUser = prisma.user as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}
const mockBcrypt = bcrypt as { hash: ReturnType<typeof vi.fn>; compare: ReturnType<typeof vi.fn> }

const FAKE_USER = {
  id: 'user-001',
  email: 'teacher@test.com',
  name: 'Test Teacher',
  role: 'TEACHER',
  passwordHash: '$2b$12$hashed',
  suspended: false,
  tokenVersion: 0,
  googleCalendarLinked: false,
  googleAccessToken: null,
  googleRefreshToken: null,
  googleTokenExpiry: null,
  username: null,
  createdAt: new Date(),
  lastLoginAt: null,
}

function makeAccessToken(payload: { id: string; role: string; email: string; tv?: number }) {
  return jwt.sign({ tv: 0, ...payload }, JWT_SECRET, { expiresIn: '15m' })
}

function makeRefreshToken(payload: { id: string; tv?: number }) {
  return jwt.sign({ tv: 0, ...payload }, JWT_REFRESH_SECRET, { expiresIn: '30d' })
}

let app: Express

beforeAll(() => {
  app = createApp()
})

beforeEach(() => {
  vi.clearAllMocks()
  mockBcrypt.compare.mockResolvedValue(false)
})

describe('POST /api/auth/register', () => {
  it('creates a user and returns access token + refresh cookie', async () => {
    mockUser.findUnique.mockResolvedValue(null)
    mockUser.create.mockResolvedValue({
      ...FAKE_USER,
      email: 'new@test.com',
      name: 'New User',
      role: 'STUDENT',
    })
    mockUser.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'Password1!', name: 'New User', role: 'STUDENT' })

    expect(res.status).toBe(201)
    expect(res.body.access).toBeDefined()
    expect(res.body.refresh).toBeUndefined()
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=/)
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i)
  })

  it('returns 409 when email is already taken', async () => {
    mockUser.findUnique.mockResolvedValue(FAKE_USER)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'teacher@test.com', password: 'Password1!', name: 'Dup', role: 'TEACHER' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already/i)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@test.com' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns access token + refresh cookie on valid credentials', async () => {
    mockUser.findUnique.mockResolvedValue(FAKE_USER)
    mockBcrypt.compare.mockResolvedValue(true)
    mockUser.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'Password1!' })

    expect(res.status).toBe(200)
    expect(res.body.access).toBeDefined()
    expect(res.body.refresh).toBeUndefined()
    expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=/)
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i)
  })

  it('also returns the refresh token in the body for the Electron client', async () => {
    mockUser.findUnique.mockResolvedValue(FAKE_USER)
    mockBcrypt.compare.mockResolvedValue(true)
    mockUser.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Client', 'electron')
      .send({ email: 'teacher@test.com', password: 'Password1!' })

    expect(res.status).toBe(200)
    expect(res.body.access).toBeDefined()
    expect(res.body.refresh).toBeDefined() // desktop persists this
  })

  it('returns 401 on wrong password', async () => {
    mockUser.findUnique.mockResolvedValue(FAKE_USER)
    mockBcrypt.compare.mockResolvedValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('returns 401 when user does not exist', async () => {
    mockUser.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'Password1!' })

    expect(res.status).toBe(401)
  })

  it('returns 403 when account is suspended', async () => {
    mockUser.findUnique.mockResolvedValue({ ...FAKE_USER, suspended: true })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'Password1!' })

    expect(res.status).toBe(403)
  })
})

describe('POST /api/auth/refresh', () => {
  it('returns 400 when no refresh cookie is provided', async () => {
    const res = await request(app).post('/api/auth/refresh')
    expect(res.status).toBe(400)
  })

  it('issues a new access token when refresh cookie is valid', async () => {
    const refreshToken = makeRefreshToken({ id: FAKE_USER.id })
    mockUser.findUnique.mockResolvedValue(FAKE_USER)
    mockUser.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${refreshToken}`)

    expect(res.status).toBe(200)
    expect(res.body.access).toBeDefined()
    expect(res.body.refresh).toBeUndefined()
  })

  it('accepts a body refresh token and returns one for the Electron client', async () => {
    const refreshToken = makeRefreshToken({ id: FAKE_USER.id })
    mockUser.findUnique.mockResolvedValue(FAKE_USER)
    mockUser.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('X-Client', 'electron')
      .send({ refresh: refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.access).toBeDefined()
    expect(res.body.refresh).toBeDefined()
  })

  it('returns 401 when refresh token is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refresh_token=bad.token.value')

    expect(res.status).toBe(401)
  })
})

describe('Authentication middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.token')

    expect(res.status).toBe(401)
  })
})

describe('RBAC: role-based access control', () => {
  it('rejects STUDENT token on admin-only route (403)', async () => {
    const token = makeAccessToken({ id: 'student-001', role: 'STUDENT', email: 'student@test.com' })

    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('rejects unauthenticated request on admin route (401)', async () => {
    const res = await request(app).get('/api/admin/users')
    expect(res.status).toBe(401)
  })
})
