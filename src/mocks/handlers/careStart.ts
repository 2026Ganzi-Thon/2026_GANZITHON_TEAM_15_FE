// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http, HttpResponse } from 'msw'
import type { ApiResponse, StartCareRequest, StartCareResponse } from '../../api/types'

export const careTypesByDiary = new Map<number, string>()

export const careStartHandlers = [
  http.post(/\/diaries\/(\d+)\/care$/, async ({ request }) => {
    const diaryId = Number(new URL(request.url).pathname.match(/\/diaries\/(\d+)\/care$/)?.[1])
    const body = await request.json() as StartCareRequest
    careTypesByDiary.set(diaryId, body.careType)
    const messages: Record<string, string> = {
      COMFORT: '오늘 하루는 어땠어요? 편하게 들려줘요.',
      LISTEN: '오늘은 제가 들을게요. 어떤 일이 있었어요?',
      ORGANIZE: '마음에 걸리는 걸 하나만 골라볼까요?',
      SOLVE: '지금 가장 풀고 싶은 게 뭐예요?',
    }

    // API 명세의 케어 방식별 시작 문구를 사용하는 목업 응답입니다.
    const response: ApiResponse<StartCareResponse> = {
      success: true,
      data: { diaryId, careType: body.careType, message: messages[body.careType] ?? '' },
    }

    return HttpResponse.json(response, { status: 201 })
  }),
]
