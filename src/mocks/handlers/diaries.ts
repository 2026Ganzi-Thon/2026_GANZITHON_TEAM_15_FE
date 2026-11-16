// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http, HttpResponse } from 'msw'
import type { ApiResponse, CreateDiaryResponse } from '../../api/types'

export const diariesHandlers = [
  http.post(/\/diaries$/, () =>
    // 목업은 요청 본문의 emotion을 읽지 않고 TIRED 예시 문구를 고정으로 반환합니다.
    HttpResponse.json<ApiResponse<CreateDiaryResponse>>(
      {
        success: true,
        data: {
          diaryId: 101,
          firstMessage: '많이 지쳤구나. 오늘은 어떤 돌봄이 필요해요?',
        },
      },
      { status: 201 },
    ),
  ),
]
