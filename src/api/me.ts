import { api } from './client'
import type { MeResponse, MySheepResponse } from './types'
export interface Block { blockId: number; nickname: string; blockedAt: string }
export type ContentTarget = { targetType: 'WORRY_SHEEP' | 'WOOL'; targetId: number }
export const meApi = {
  get: (signal?: AbortSignal) => api.get<MeResponse>('/users/me', signal),
  sheep: (signal?: AbortSignal) => api.get<MySheepResponse>('/my-sheep', signal),
  nickname: (nickname: string) => api.put<MeResponse>('/users/me/nickname', { nickname }),
  blocks: (signal?: AbortSignal) => api.get<Block[]>('/blocks', signal),
  block: (target: ContentTarget) => api.post<Block>('/blocks', target),
  unblock: (id: number) => api.delete(`/blocks/${id}`),
  deleteAccount: () => api.delete<void>('/me'),
}
