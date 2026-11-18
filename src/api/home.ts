import { api } from './client'
import { meApi } from './me'
import type { CreateDiaryRequest, CreateDiaryResponse, MeResponse, MySheepResponse } from './types'

export function getMySheep(): Promise<MySheepResponse> {
  return meApi.sheep()
}

export function getMe(): Promise<MeResponse> {
  return meApi.get()
}

export function createDiary(body: CreateDiaryRequest): Promise<CreateDiaryResponse> {
  return api.post<CreateDiaryResponse>('/diaries', body)
}
