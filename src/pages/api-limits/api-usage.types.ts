export type ApiUsageType = 'GSTR1' | 'GSTR2B' | 'IMS' | 'EINVOICE' | 'EWAYBILL'

export interface ApiUsageSummary {
  companyGstId: number
  gstNumber: string
  companyName: string | null
  apiType: ApiUsageType
  periodKey: string
  /** Calls of this API type this month */
  callCount: number
  /** Calls across all API types this month: the limit applies to this total */
  totalCallCount: number
  effectiveLimit: number
  planDefaultLimit: number | null
  override: number | null
}

export interface GstApiUsageGroup {
  companyGstId: number
  gstNumber: string
  companyName: string | null
  periodKey: string
  totalCallCount: number
  effectiveLimit: number
  planDefaultLimit: number | null
  override: number | null
  usageByType: Record<ApiUsageType, number>
}
