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

// 도메인 타입 (Swagger 기준)
// optional 여부 미확인, 응답 필드는 Swagger에 표시된 그대로 필수로 표기
// emotion, careType: Swagger는 예시만 확인, 전체 값 미확정
// nextStageAt: Swagger는 number로 표시, Notion API 명세는 5단계에서 null이라고 기재, 어긋남 확인 필요

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  userId: number
  nickname: string
  accessToken: string
  expiresInSeconds: number
}

export interface SignupRequest {
  email: string
  password: string
  nickname: string
  agreed: boolean
}

export interface SignupResponse {
  userId: number
  nickname: string
  sheepStage: number
  sheepWoolCount: number
  accessToken: string
  expiresInSeconds: number
}

// Notion API 명세와 팀 테스트 결과 기준이며, Swagger 대조 전입니다.
export interface NicknameAvailabilityResponse {
  available: boolean
  reason?: 'LENGTH' | 'CHARACTERS' | 'DUPLICATE' | 'NOT_ALLOWED'
  message?: string
}

export interface MeResponse {
  userId: number
  nickname: string
}

export interface CreateDiaryRequest {
  emotion: string
}

export interface CreateDiaryResponse {
  diaryId: number
  firstMessage: string
}

export interface StartCareRequest {
  careType: string
}

export interface StartCareResponse {
  diaryId: number
  careType: string
  message: string
}

export interface CareMessageRequest {
  content: string
}

export interface CompleteCareResponse {
  summary: {
    careType: string
    text: string
  }
  wool: {
    added: number
    total: number
    stage: number
    stageUp: boolean
  }
}

export interface MySheepResponse {
  stage: number
  stageName: string
  woolCount: number
  stageStartAt: number
  nextStageAt: number | null
  woolToNextStage: number
  yarnCount: number
  equippedItems: string[]
}
