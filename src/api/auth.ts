import { api } from './client'
import { setToken } from './token'
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from './types'

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
