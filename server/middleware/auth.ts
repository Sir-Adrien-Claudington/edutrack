import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../lib/logger.js'

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      role: string
      email: string
      tv?: number
    }
    // Check tokenVersion to support force-logout. Fail CLOSED: if the version
    // can't be verified (e.g. transient DB error) reject rather than honour a
    // token that may have been force-logged-out.
    if (payload.tv !== undefined) {
      let dbTokenVersion: number | undefined
      try {
        const { prisma } = await import('../prisma/client.js')
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: { tokenVersion: true } as any,
        })
        dbTokenVersion = user ? (user as any).tokenVersion : undefined
      } catch (err) {
        logger.error(
          { err: (err as any)?.message ?? String(err) },
          'tokenVersion verification failed'
        )
        res.status(401).json({ error: 'Session validation failed' })
        return
      }
      if (dbTokenVersion !== undefined && dbTokenVersion !== payload.tv) {
        res.status(401).json({ error: 'Session expired' })
        return
      }
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}
