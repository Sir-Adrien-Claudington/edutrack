// Decouples the API client from the auth store (avoids a circular import).
// The store registers a handler; the client fires it when the session can no
// longer be refreshed. The handler clears auth state so React Router redirects
// to /login via SPA navigation — NOT a full page reload. A hard reload here
// previously caused a refresh loop on the login page that tripped the API rate
// limiter ("Too many requests, please slow down").

let handler: (() => void) | null = null

export const setAuthExpiredHandler = (h: (() => void) | null) => {
  handler = h
}

export const fireAuthExpired = () => {
  handler?.()
}
