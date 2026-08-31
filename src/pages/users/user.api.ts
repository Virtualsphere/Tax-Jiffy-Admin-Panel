import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { AdminUserSummary } from './user.types'

export const adminUserApi = {
  getAll: async (): Promise<AdminUserSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<AdminUserSummary[]>>('/admin/users')
    return data.data
  },
}
