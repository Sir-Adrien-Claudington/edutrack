import jwt from 'jsonwebtoken'

export function generateTokens(user: {
  id: string
  role: string
  email?: string | null
  tokenVersion?: number
}) {
  const tv = user.tokenVersion ?? 0
  const access = jwt.sign(
    { id: user.id, role: user.role, email: user.email ?? '', tv },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
  const refresh = jwt.sign({ id: user.id, tv }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '30d',
  })
  return { access, refresh }
}
