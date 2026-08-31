import type { AdminUser } from './auth.types'

const TOKEN_KEY = 'admin_access_token'
const USER_KEY = 'admin_auth_user'

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),

  getUser: (): AdminUser | null => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AdminUser
    } catch {
      return null
    }
  },
  setUser: (user: AdminUser): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),

  isSuperAdmin: (): boolean => authStorage.getUser()?.isSuperAdmin === true,

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
