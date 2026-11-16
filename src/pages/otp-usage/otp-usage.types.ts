export type GstSessionStatus = 'NONE' | 'OTP_SENT' | 'ACTIVE' | 'EXPIRED'

export interface OtpUsageSummary {
  companyGstId: number
  gstNumber: string
  companyName: string | null
  periodKey: string
  otpRequests: number
  failedRequests: number
  verifications: number
  failedVerifications: number
  lastOtpAt: string | null
  sessionStatus: GstSessionStatus
  sessionExpiresAt: string | null
}

export interface OtpEvent {
  id: number
  createdAt: string
  action: 'REQUEST' | 'VERIFY'
  success: boolean
  message: string | null
  userId: number | null
  userName: string | null
  userEmail: string | null
}
