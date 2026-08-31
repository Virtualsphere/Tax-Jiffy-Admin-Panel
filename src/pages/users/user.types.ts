export interface AdminUserGstSummary {
  companyGstId: number
  gstNumber: string
  isPaymentDone: boolean
  subscriptionPlanName: string | null
  isActive: boolean
}

export interface AdminUserSummary {
  id: number
  userName: string
  userEmail: string
  mobile: string | null
  companyId: number | null
  companyName: string | null
  isActive: boolean
  isSuperAdmin: boolean
  createdDate: string
  gstMemberships: AdminUserGstSummary[]
}
