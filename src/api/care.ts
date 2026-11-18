import { api } from './client'
import { streamSse, type StreamSseOptions } from './sse'
import type { CareMessageRequest, CompleteCareResponse, StartCareRequest, StartCareResponse } from './types'

export function startCare(diaryId: number, body: StartCareRequest): Promise<StartCareResponse> {
  return api.post<StartCareResponse>(`/diaries/${diaryId}/care`, body)
}

export function sendCareMessage(
  diaryId: number,
  body: CareMessageRequest,
  options: Omit<StreamSseOptions, 'method' | 'body'> = {},
): Promise<void> {
  return streamSse(`/diaries/${diaryId}/care/messages`, {
    ...options,
    method: 'POST',
    body,
  })
}

export function completeCare(diaryId: number): Promise<CompleteCareResponse> {
  return api.post<CompleteCareResponse>(`/diaries/${diaryId}/care/complete`)
}
