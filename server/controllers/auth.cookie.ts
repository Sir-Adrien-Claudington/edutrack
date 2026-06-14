import type { Request, Response } from 'express'

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

// The Electron desktop app (which sends `X-Client: electron`) can't rely on the
// HttpOnly refresh cookie, so it also receives the refresh token in the body to
// persist locally. The web app never gets it in the body (cookie only).
export function bodyRefresh(req: Request, refresh: string): { refresh?: string } {
  return req.headers['x-client'] === 'electron' ? { refresh } : {}
}

type SessionUser = { id: string; email: string | null; name: string; role: string }

// Establishes a full session: sets the refresh cookie and writes the standard
// session payload. Every endpoint that logs a user in (register, login, MFA
// verify) goes through here so the cookie + response shape stay in one place.
export function sendSession(
  req: Request,
  res: Response,
  user: SessionUser,
  tokens: { access: string; refresh: string },
  status = 200
) {
  setRefreshCookie(res, tokens.refresh)
  res.status(status).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    access: tokens.access,
    ...bodyRefresh(req, tokens.refresh),
  })
}
