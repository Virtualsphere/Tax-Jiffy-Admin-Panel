import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { ApiUsageSummary } from './api-usage.types'

const BASE = '/admin/api-usage'

export const apiUsageApi = {
  getAll: async (): Promise<ApiUsageSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<ApiUsageSummary[]>>(BASE)
    return data.data
  },
  getByGst: async (companyGstId: number): Promise<ApiUsageSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<ApiUsageSummary[]>>(`${BASE}/by-gst/${companyGstId}`)
    return data.data
  },
  setOverride: async (companyGstId: number, apiCallLimitOverride: number | null): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`${BASE}/by-gst/${companyGstId}/override`, { apiCallLimitOverride })
  },
}
