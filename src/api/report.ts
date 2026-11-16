import { api } from './client'

export type ReportReason = 'ABUSIVE' | 'PERSONAL_INFO' | 'SPAM' | 'LOOKS_DANGEROUS' | 'ETC'
export interface ReportRequest {
  targetType: 'WORRY_SHEEP' | 'WOOL'
  targetId: number
  reason: ReportReason
  blockUser: boolean
}
export interface ReportResponse { reportId: number; hidden: boolean; blocked: boolean }

export async function submitReport(body: ReportRequest): Promise<ReportResponse> {
  return api.post<ReportResponse>('/reports', body)
}
