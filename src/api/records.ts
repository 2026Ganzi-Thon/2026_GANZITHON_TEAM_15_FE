import { api } from './client'

export type DiaryEmotion =
  | 'JOY'
  | 'CALM'
  | 'TIRED'
  | 'ANXIOUS'
  | 'DEPRESSED'
  | 'LONELY'
  | 'ANGRY'
  | 'COMPLICATED'

export type CareType = 'LISTEN' | 'COMFORT' | 'ORGANIZE' | 'SOLVE'
export type CareStatus = 'NONE' | 'IN_PROGRESS' | 'COMPLETED'

export interface DiaryDay {
  date: string
  diaryId: number
  emotion: DiaryEmotion
  emotionLabel: string
}

export interface DiaryMonthResponse {
  month: string
  days: DiaryDay[]
}

export interface DiaryMessage {
  role: 'USER' | 'AI'
  content: string
  createdAt: string
}

export interface DiaryDetailResponse {
  diaryId: number
  createdAt: string
  emotion: DiaryEmotion
  emotionLabel: string
  careType: CareType
  careStatus: CareStatus
  firstMessage: string
  summary: {
    careType: CareType
    text: string
  } | null
  woolEarned: number
  messages: DiaryMessage[]
}

export interface DiaryMonthSummaryResponse {
  month: string
  woolCount: number
  sentence: string | null
}

export const recordsApi = {
  getMonth: (month: string, signal?: AbortSignal) =>
    api.get<DiaryMonthResponse>(`/diaries?month=${encodeURIComponent(month)}`, signal),

  getDetail: (diaryId: number, signal?: AbortSignal) =>
    api.get<DiaryDetailResponse>(`/diaries/${diaryId}`, signal),

  getSummary: (month: string, signal?: AbortSignal) =>
    api.get<DiaryMonthSummaryResponse>(
      `/diaries/summary?month=${encodeURIComponent(month)}`,
      signal,
    ),

  deleteDiary: (diaryId: number) =>
    api.delete<void>(`/diaries/${diaryId}`),

  deleteAll: () => api.delete<void>('/me/records'),
}
