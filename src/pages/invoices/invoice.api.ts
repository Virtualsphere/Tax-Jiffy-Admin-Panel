import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { SubscriptionPurchase } from './invoice.types'

const BASE = '/admin/subscription-purchases'

export const invoiceApi = {
  getAll: async (): Promise<SubscriptionPurchase[]> => {
    const { data } = await apiClient.get<ApiResponse<SubscriptionPurchase[]>>(BASE)
    return data.data
  },
  getByGst: async (companyGstId: number): Promise<SubscriptionPurchase[]> => {
    const { data } = await apiClient.get<ApiResponse<SubscriptionPurchase[]>>(`${BASE}/by-gst/${companyGstId}`)
    return data.data
  },
}
