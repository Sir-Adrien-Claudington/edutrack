import { create } from 'zustand'
import api from '../api/client'
import { setToken, setRefresh } from '../api/token'
import { setAuthExpiredHandler } from '../api/authEvents'

interface User {
  id: string
  email: string
  name: string
  role: 'TEACHER' | 'STUDENT' | 'ADMIN'
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithUsername: (username: string, classCode: string) => Promise<void>
  register: (email: string, password: string, name: string, role: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.access)
    setRefresh(data.refresh ?? null)
    set({ user: data.user })
  },

  loginWithUsername: async (username, classCode) => {
    const { data } = await api.post('/auth/login', { username, classCode })
    setToken(data.access)
    setRefresh(data.refresh ?? null)
    set({ user: data.user })
  },

  register: async (email, password, name, role) => {
    const { data } = await api.post('/auth/register', { email, password, name, role })
    setToken(data.access)
    setRefresh(data.refresh ?? null)
    set({ user: data.user })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Proceed with client-side logout even if server call fails
    }
    setToken(null)
    setRefresh(null)
    set({ user: null })
  },

  loadUser: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, loading: false })
    } catch {
      // Refresh interceptor handles 401 automatically. If it also fails,
      // the user is not authenticated — leave user: null.
      setToken(null)
      set({ loading: false })
    }
  },
}))

// When the API client can't refresh an expired session, drop the user so
// ProtectedRoute redirects to /login (SPA, no reload — avoids the refresh loop).
setAuthExpiredHandler(() => {
  useAuthStore.setState({ user: null, loading: false })
})
