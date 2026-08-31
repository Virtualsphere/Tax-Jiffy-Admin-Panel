import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { AdminGstSummary } from './gst.types'

const BASE = '/admin/gst'

export const gstApi = {
  getAll: async (): Promise<AdminGstSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<AdminGstSummary[]>>(BASE)
    return data.data
  },
  getById: async (id: number): Promise<AdminGstSummary> => {
    const { data } = await apiClient.get<ApiResponse<AdminGstSummary>>(`${BASE}/${id}`)
    return data.data
  },
}

export interface RoleMappingRow {
  id: number
  roleId: number
  roleName: string
  companyId: number
  companyName: string
  companyGstId: number
  gstNumber: string
  pageNumber: string
  screenNumber: string
  add: boolean
  edit: boolean
  view: boolean
  delete: boolean
  createdDate: string
}

export const roleMappingApi = {
  getByCompanyGst: async (companyGstId: number): Promise<RoleMappingRow[]> => {
    const { data } = await apiClient.get<ApiResponse<RoleMappingRow[]>>(`/role-mapping/by-company-gst/${companyGstId}`)
    return data.data
  },
}
