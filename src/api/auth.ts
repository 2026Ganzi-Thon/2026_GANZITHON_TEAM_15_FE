import { api } from './client'
import { setToken } from './token'
import type { LoginRequest, LoginResponse } from './types'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', body)
  setToken(data.accessToken)
  return data
}
