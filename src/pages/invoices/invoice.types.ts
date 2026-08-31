export interface SubscriptionPurchase {
  id: number
  gstNumber: string
  companyId: number | null
  companyName: string | null
  subscriptionPlanId: number | null
  planNameSnapshot: string | null
  planAmountSnapshot: number | null
  transactionType: 'PURCHASE' | 'UPGRADE'
  startDate: string | null
  endDate: string | null
  isPaymentDone: boolean
  createdDate: string
  createdBy: number | null
}
