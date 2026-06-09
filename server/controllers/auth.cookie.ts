import type { Response } from 'express'

const IS_PROD = process.env.NODE_ENV === 'production'

export function setRefreshCookie(res: Response, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/api/auth',
  })
}
