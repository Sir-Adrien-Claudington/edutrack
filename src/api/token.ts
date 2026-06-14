// Token storage. On the web the access token is kept in memory only (most
// secure against XSS) and the session survives via the HttpOnly refresh
// cookie. In the Electron desktop app that cookie is unreliable (SameSite=None
// from a file:// origin), so there we persist both tokens to localStorage so
// the session survives an app restart.

const isElectron =
  typeof window !== 'undefined' && !!(window as unknown as { electron?: unknown }).electron

const ACCESS_KEY = 'et_access'
const REFRESH_KEY = 'et_refresh'

let _token: string | null = isElectron ? localStorage.getItem(ACCESS_KEY) : null
let _refresh: string | null = isElectron ? localStorage.getItem(REFRESH_KEY) : null

export const getToken = () => _token
export const setToken = (t: string | null) => {
  _token = t
  if (!isElectron) return
  if (t) localStorage.setItem(ACCESS_KEY, t)
  else localStorage.removeItem(ACCESS_KEY)
}

export const getRefresh = () => _refresh
export const setRefresh = (t: string | null) => {
  _refresh = t
  if (!isElectron) return
  if (t) localStorage.setItem(REFRESH_KEY, t)
  else localStorage.removeItem(REFRESH_KEY)
}
