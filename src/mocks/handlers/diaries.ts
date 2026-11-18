// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http, HttpResponse } from 'msw'
import type { ApiResponse, CreateDiaryRequest, CreateDiaryResponse } from '../../api/types'

export const diariesHandlers = [
  http.post(/\/diaries$/, async ({ request }) => {
    const body = await request.json() as CreateDiaryRequest
    // TIRED 문구만 와이어프레임 예시이며, 다른 감정의 별도 문구는 계약에 없어 공통 안내를 사용합니다.
    const firstMessage = body.emotion === 'TIRED'
      ? '많이 지쳤구나. 오늘은 어떤 돌봄이 필요해요?'
      : '오늘은 어떤 돌봄이 필요해요?'

    return HttpResponse.json<ApiResponse<CreateDiaryResponse>>(
      {
        success: true,
        data: {
          diaryId: 101,
          firstMessage,
        },
      },
      { status: 201 },
    )
  }),
]
