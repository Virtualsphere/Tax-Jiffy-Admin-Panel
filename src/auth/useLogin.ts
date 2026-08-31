import { useMutation } from '@tanstack/react-query'
import { authApi } from './auth.api'
import { authStorage } from './auth-storage'
import type { AdminAuthSession, LoginCredentials } from './auth.types'

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AdminAuthSession> => {
      const session = await authApi.login(credentials)

      // Belt-and-suspenders: the backend already 403s every /api/admin/** call for
      // a non-super-admin, but failing here avoids a confusing "logged in, every
      // page 403s" state — nothing gets persisted for a rejected session.
      if (session.isSuperAdmin !== true) {
        throw new Error('This panel is only available to super admins.')
      }

      authStorage.setToken(session.token)
      authStorage.setUser({
        userId: session.userId,
        userName: session.userName,
        email: session.email,
        isSuperAdmin: session.isSuperAdmin,
      })

      return session
    },
  })
}
