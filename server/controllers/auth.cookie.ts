import type { Response } from 'express'

const IS_PROD = process.env.NODE_ENV === 'production'

export function setRefreshCookie(res: Response, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    // SameSite=None required for Electron cross-origin requests to Railway backend.
    // CSRF protection is provided by Bearer token on all state-changing endpoints —
    // the refresh cookie is only used for token rotation at /api/auth/refresh.
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
