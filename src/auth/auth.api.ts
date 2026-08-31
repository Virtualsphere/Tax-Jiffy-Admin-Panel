import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { AdminAuthSession, LoginCredentials } from './auth.types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AdminAuthSession> => {
    const { data } = await apiClient.post<ApiResponse<AdminAuthSession>>('/auth/login', credentials)
    return data.data
  },
}
