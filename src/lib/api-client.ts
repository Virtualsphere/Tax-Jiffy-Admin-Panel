import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import { authStorage } from '@/auth/auth-storage'

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const isLoginAttempt = error.config?.url?.includes('/auth/login') ?? false
    const onLoginScreen = window.location.pathname.startsWith(ROUTES.login)

    // 401 = session expired/invalid. 403 here always means "not (or no longer) a
    // super admin" — every /api/admin/** route is gated on that, so both cases
    // mean this session shouldn't be in the admin panel at all.
    if ((status === 401 || status === 403) && !isLoginAttempt && !onLoginScreen) {
      authStorage.clear()
      window.location.assign(`${ROUTES.login}?session=expired`)
    }

    return Promise.reject(error)
  },
)
