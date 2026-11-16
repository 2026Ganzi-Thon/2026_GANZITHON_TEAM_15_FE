// 위치·이름 팀 확정 전 제안. 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준.

import { http, HttpResponse } from 'msw'
import type { ApiResponse, LoginResponse } from '../../api/types'

const loginResponse: ApiResponse<LoginResponse> = {
  success: true,
  data: {
    userId: 1,
    nickname: '다정한 목동',
    // 가짜 문자열이며 실제 JWT가 아닙니다.
    accessToken: 'mock-access-token',
    expiresInSeconds: 86400,
  },
}

export const authHandlers = [
  http.post(/\/auth\/login$/, () => HttpResponse.json(loginResponse)),
]
