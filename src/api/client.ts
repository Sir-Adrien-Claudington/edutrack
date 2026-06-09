import axios from 'axios'
import { getToken, setToken } from './token'

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') as string

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // send HttpOnly refresh_token cookie on every request
})

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        // Cookie is sent automatically — no body needed
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
        setToken(data.access)
        error.config.headers.Authorization = `Bearer ${data.access}`
        return api.request(error.config)
      } catch (refreshErr: any) {
        setToken(null)
        if (refreshErr?.response?.status === 401 || refreshErr?.response?.status === 403) {
          const isElectron = typeof window !== 'undefined' && (window as any).electron
          window.location.href = isElectron ? '#/login' : '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
