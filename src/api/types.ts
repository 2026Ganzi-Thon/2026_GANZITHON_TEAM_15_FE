// API 공통 응답 형식 (API 명세 '공통 규칙' 기준)

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiErrorBody {
  code: string
  message: string
}

export interface ApiFailure {
  success: false
  error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// API 명세 '오류 코드 (구현됨)' 표에 있는 코드만 정리 (A 영역)
export const ERROR_CODES = {
  COMMON_400: 'COMMON_400',
  COMMON_401: 'COMMON_401',
  COMMON_404: 'COMMON_404',
  COMMON_409: 'COMMON_409',
  COMMON_429: 'COMMON_429',
  COMMON_500: 'COMMON_500',
  ACCOUNT_PASSWORD_TOO_SHORT: 'ACCOUNT_PASSWORD_TOO_SHORT',
  ACCOUNT_LOGIN_FAILED: 'ACCOUNT_LOGIN_FAILED',
  ACCOUNT_EMAIL_DUPLICATED: 'ACCOUNT_EMAIL_DUPLICATED',
  ACCOUNT_NICKNAME_UNAVAILABLE: 'ACCOUNT_NICKNAME_UNAVAILABLE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SHEEP_YARN_NOT_ENOUGH: 'SHEEP_YARN_NOT_ENOUGH',
  SHEEP_ITEM_NOT_OWNED: 'SHEEP_ITEM_NOT_OWNED',
} as const

export type KnownErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]