import { api } from './client'
import { setToken } from './token'
import type { LoginRequest, LoginResponse, NicknameAvailabilityResponse, SignupRequest, SignupResponse } from './types'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', body)
  setToken(data.accessToken)
  return data
}

export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const data = await api.post<SignupResponse>('/auth/signup', body)
  setToken(data.accessToken)
  return data
}

export function checkNickname(
  nickname: string,
  signal?: AbortSignal,
): Promise<NicknameAvailabilityResponse> {
  const path = `/auth/nickname/availability?nickname=${encodeURIComponent(nickname)}`
  return api.get<NicknameAvailabilityResponse>(path, signal)
}
