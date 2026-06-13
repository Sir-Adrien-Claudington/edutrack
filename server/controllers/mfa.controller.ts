import { Response } from 'express'
import { createRequire } from 'module'
import QRCode from 'qrcode'
const { authenticator } = createRequire(import.meta.url)('otplib') as {
  authenticator: typeof import('otplib').authenticator
}
import type { AuthRequest } from '../middleware/auth.js'
import { prisma } from '../prisma/client.js'
import { logger } from '../lib/logger.js'
import { setRefreshCookie } from './auth.cookie.js'
import { generateTokens } from '../lib/tokens.js'
import { encryptSecret, decryptSecret } from '../lib/mfaCrypto.js'

// GET /api/auth/mfa/setup — generate TOTP secret and QR code, save (disabled) secret to DB
export async function setupMfa(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  if (user.mfaEnabled) {
    res.status(409).json({ error: 'MFA is already enabled' })
    return
  }

  const secret = authenticator.generateSecret()
  const identifier = user.email ?? user.username ?? user.id
  const otpauthUrl = authenticator.keyuri(identifier, 'EduTrack', secret)
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

  // Store the pending secret encrypted at rest (disabled until confirmed)
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: encryptSecret(secret), mfaEnabled: false },
  })

  res.json({ secret, qrCodeDataUrl, otpauthUrl })
}

// POST /api/auth/mfa/confirm { code } — verify TOTP code and enable MFA
export async function confirmMfa(req: AuthRequest, res: Response) {
  const { code } = req.body
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'TOTP code required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user || !user.mfaSecret) {
    res.status(400).json({ error: 'MFA setup not started' })
    return
  }
  if (user.mfaEnabled) {
    res.status(409).json({ error: 'MFA already enabled' })
    return
  }

  const valid = authenticator.verify({ token: code, secret: decryptSecret(user.mfaSecret) })
  if (!valid) {
    res.status(400).json({ error: 'Invalid TOTP code' })
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true } })
  res.json({ ok: true })
}

// DELETE /api/auth/mfa/disable { code } — verify and disable MFA
export async function disableMfa(req: AuthRequest, res: Response) {
  const { code } = req.body
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'TOTP code required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    res.status(400).json({ error: 'MFA is not enabled' })
    return
  }

  const valid = authenticator.verify({ token: code, secret: decryptSecret(user.mfaSecret) })
  if (!valid) {
    res.status(400).json({ error: 'Invalid TOTP code' })
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { mfaSecret: null, mfaEnabled: false } })
  res.json({ ok: true })
}

// POST /api/auth/mfa/verify { mfaToken, code } — exchange temp token + TOTP code for full session
export async function verifyMfa(req: AuthRequest, res: Response) {
  const { mfaToken, code } = req.body
  if (!mfaToken || !code) {
    res.status(400).json({ error: 'mfaToken and code required' })
    return
  }

  let payload: { id: string; scope?: string }
  try {
    payload = jwt.verify(mfaToken, process.env.JWT_SECRET!) as { id: string; scope?: string }
  } catch {
    res.status(401).json({ error: 'Invalid or expired MFA token' })
    return
  }

  if (payload.scope !== 'mfa') {
    res.status(401).json({ error: 'Invalid token scope' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    res.status(401).json({ error: 'MFA not configured for this account' })
    return
  }
  if (user.suspended) {
    res.status(403).json({ error: 'Account suspended' })
    return
  }

  const valid = authenticator.verify({ token: String(code), secret: decryptSecret(user.mfaSecret) })
  if (!valid) {
    logger.warn({ userId: user.id }, 'MFA verify: invalid TOTP code')
    res.status(401).json({ error: 'Invalid TOTP code' })
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const tokens = generateTokens(user)
  setRefreshCookie(res, tokens.refresh)
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    access: tokens.access,
  })
}
