export interface AdminGstSummary {
  id: number
  gstNumber: string
  companyId: number | null
  companyName: string | null
  subscriptionPlanId: number | null
  subscriptionPlanName: string | null
  planAmount: number | null
  planUserCount: number | null
  planTransactionCount: number | null
  isPaymentDone: boolean
  startDate: string | null
  endDate: string | null
  isActive: boolean
  activeUserCount: number
  pageAccessCount: number
}
