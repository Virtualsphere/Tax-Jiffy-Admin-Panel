export interface SubscriptionPlan {
  id: number
  name: string
  userCount: number
  transactionCount: number
  planAmount: number
  isActive: boolean
}

export interface SubscriptionPlanRequest {
  name: string
  userCount: number
  transactionCount: number
  planAmount: number
}
