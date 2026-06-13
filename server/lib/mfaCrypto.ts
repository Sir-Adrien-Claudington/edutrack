import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

// ---------------------------------------------------------------------------
// At-rest encryption for TOTP (MFA) secrets.
// ---------------------------------------------------------------------------
// AES-256-GCM. The key is derived from MFA_ENC_KEY if set, otherwise from
// JWT_SECRET — so no new required env var, but a dedicated key can be supplied
// later. Stored values are tagged with a version prefix; anything WITHOUT the
// prefix is treated as a legacy plaintext secret and returned as-is, so
// existing enrolments keep working and re-encrypt on their next setup.
// ---------------------------------------------------------------------------

const PREFIX = 'enc:v1:'
let cachedKey: Buffer | null = null

function key(): Buffer {
  if (cachedKey) return cachedKey
  const material = process.env.MFA_ENC_KEY ?? process.env.JWT_SECRET
  if (!material) throw new Error('MFA_ENC_KEY or JWT_SECRET required to encrypt MFA secrets')
  cachedKey = scryptSync(material, 'edutrack-mfa-secret-v1', 32)
  return cachedKey
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored // legacy plaintext
  const raw = Buffer.from(stored.slice(PREFIX.length), 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const data = raw.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', key(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
