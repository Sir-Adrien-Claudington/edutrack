import { describe, it, expect, beforeAll } from 'vitest'

process.env.JWT_SECRET = 'test-jwt-secret-for-mfa-crypto-aaaa'
delete process.env.MFA_ENC_KEY

let encryptSecret: (s: string) => string
let decryptSecret: (s: string) => string

beforeAll(async () => {
  const mod = await import('../lib/mfaCrypto.js')
  encryptSecret = mod.encryptSecret
  decryptSecret = mod.decryptSecret
})

describe('mfaCrypto', () => {
  it('round-trips a TOTP secret', () => {
    const secret = 'JBSWY3DPEHPK3PXP'
    const enc = encryptSecret(secret)
    expect(enc).toMatch(/^enc:v1:/)
    expect(enc).not.toContain(secret)
    expect(decryptSecret(enc)).toBe(secret)
  })

  it('produces a different ciphertext each time (random IV)', () => {
    const secret = 'JBSWY3DPEHPK3PXP'
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret))
    expect(decryptSecret(encryptSecret(secret))).toBe(secret)
  })

  it('passes through legacy plaintext secrets unchanged', () => {
    // existing enrolments stored the raw secret before encryption was added
    expect(decryptSecret('JBSWY3DPEHPK3PXP')).toBe('JBSWY3DPEHPK3PXP')
  })

  it('rejects a tampered ciphertext (GCM auth tag)', () => {
    const enc = encryptSecret('JBSWY3DPEHPK3PXP')
    // Flip one base64 char in the payload to a guaranteed-different value so the
    // decoded bytes always change and GCM authentication always fails.
    const i = enc.length - 6
    const repl = enc[i] === 'A' ? 'B' : 'A'
    const tampered = enc.slice(0, i) + repl + enc.slice(i + 1)
    expect(() => decryptSecret(tampered)).toThrow()
  })
})
