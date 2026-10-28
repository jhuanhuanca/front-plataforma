import axios from 'axios'
import { reportApiFailure } from '../lib/apiFailure'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const deviceId = localStorage.getItem('device-id')
  if (deviceId) {
    config.headers['X-Device-Fingerprint'] = deviceId
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && (error.response?.status ?? 0) >= 500) {
      const header = error.response?.headers?.['x-request-id']
      const meta = error.response?.data?.meta?.request_id
      const requestId = typeof header === 'string' && header !== ''
        ? header
        : typeof meta === 'string' ? meta : ''
      reportApiFailure(requestId)
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const authAttempt = url.includes('/auth/login') || url.includes('/auth/register')

      if (!authAttempt) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_nick')
        localStorage.removeItem('auth_user_id')
        localStorage.removeItem('auth_avatar')
        localStorage.removeItem('auth_cover')
      }

      if (!authAttempt && window.location.pathname !== '/ingresar') {
        window.location.assign('/ingresar')
      }
    }

    return Promise.reject(error)
  },
)
