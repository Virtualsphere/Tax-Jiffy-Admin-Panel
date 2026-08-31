import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { UserLastActive } from './activity.types'

export const activityApi = {
  getLastActive: async (): Promise<UserLastActive[]> => {
    const { data } = await apiClient.get<ApiResponse<UserLastActive[]>>('/admin/presence/last-active')
    return data.data
  },
}
