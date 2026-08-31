export type ApiUsageType = 'EINVOICE' | 'EWAYBILL' | 'IMS'

export interface ApiUsageSummary {
  companyGstId: number
  gstNumber: string
  companyName: string | null
  apiType: ApiUsageType
  periodKey: string
  callCount: number
  effectiveLimit: number
  planDefaultLimit: number | null
  override: number | null
}

export interface GstApiUsageGroup {
  companyGstId: number
  gstNumber: string
  companyName: string | null
  periodKey: string
  effectiveLimit: number
  planDefaultLimit: number | null
  override: number | null
  usageByType: Record<ApiUsageType, number>
}
