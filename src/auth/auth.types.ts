export interface LoginCredentials {
  email: string
  password: string
}

/** Mirrors the backend's LoginResponse (user/dto/LoginResponse.java). */
export interface AdminAuthSession {
  token: string
  userId: number
  userName: string
  email: string
  isSuperAdmin: boolean | null
}

/** What's persisted to localStorage — the session minus the token, which has its own key. */
export type AdminUser = Omit<AdminAuthSession, 'token'>
