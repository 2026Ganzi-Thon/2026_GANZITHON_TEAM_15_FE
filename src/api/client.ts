// API 공통 클라이언트 (API 명세 '공통 규칙' 기준)
// - 성공: { success: true, data } → data만 반환
// - 실패: { success: false, error: { code, message } } → ApiError를 던짐
// 요청 본문·토큰·응답 내용은 console.log로 남기지 않습니다(컨벤션).

import { clearToken, getToken } from './token'
import { ERROR_CODES, type ApiResponse } from './types'

// 백엔드 주소는 아직 미확정입니다. .env.local의 VITE_API_BASE_URL로 지정합니다.
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 토큰 만료·위조(COMMON_401) 시 호출될 함수. 인증 가드(#8)에서 등록합니다.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

export function handleUnauthorized(): void {
  clearToken()
  onUnauthorized?.()
}

export function buildUrl(path: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path)) return path
  if (!BASE_URL) return path

  const baseUrl = BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface RequestOptions {
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { ...authHeaders() }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.')
  }

  let json: ApiResponse<T> | null = null
  try {
    json = (await response.json()) as ApiResponse<T>
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    if (options.signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError')
    }
    // 본문이 JSON이 아니면 json은 null로 유지됩니다.
  }

  if (json && json.success) {
    return json.data
  }

  if (json && !json.success) {
    if (json.error.code === ERROR_CODES.COMMON_401) {
      handleUnauthorized()
    }
    throw new ApiError(response.status, json.error.code, json.error.message)
  }

  // 응답 본문이 약속된 형식이 아닌 경우
  throw new ApiError(response.status, 'UNKNOWN', '잠시 후 다시 시도해 주세요.')
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, { signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>('POST', path, { body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>('PUT', path, { body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>('DELETE', path, { signal }),
}
