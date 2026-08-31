import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { SubscriptionPlan, SubscriptionPlanRequest } from './subscription-plan.types'

const BASE = '/subscription-plans'

export const subscriptionPlanApi = {
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(BASE)
    return data.data
  },
  create: async (req: SubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const { data } = await apiClient.post<ApiResponse<SubscriptionPlan>>(BASE, req)
    return data.data
  },
  update: async (id: number, req: SubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const { data } = await apiClient.put<ApiResponse<SubscriptionPlan>>(`${BASE}/${id}`, req)
    return data.data
  },
  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`)
  },
}
