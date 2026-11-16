import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { OtpEvent, OtpUsageSummary } from './otp-usage.types'

const BASE = '/admin/otp-usage'

export const otpUsageApi = {
  /** @param period yyyy-MM */
  getSummary: async (period: string): Promise<OtpUsageSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<OtpUsageSummary[]>>(BASE, { params: { period } })
    return data.data
  },
  getEvents: async (companyGstId: number, period: string): Promise<OtpEvent[]> => {
    const { data } = await apiClient.get<ApiResponse<OtpEvent[]>>(`${BASE}/by-gst/${companyGstId}/events`, {
      params: { period },
    })
    return data.data
  },
}
