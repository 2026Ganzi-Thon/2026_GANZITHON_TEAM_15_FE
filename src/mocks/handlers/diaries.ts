import { http, HttpResponse } from 'msw'
import type { ApiResponse, CreateDiaryRequest, CreateDiaryResponse } from '../../api/types'

export const diariesHandlers = [
  // 일기 생성
  http.post('*/diaries', async ({ request }) => {
    const body = await request.json() as CreateDiaryRequest
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

  // 월별 기록 목록
  http.get('*/diaries', ({ request }) => {
    const url = new URL(request.url)
    const month = url.searchParams.get('month') ?? '2026-11'

    return HttpResponse.json({
      success: true,
      data: {
        month,
        days: [{
          date: `${month}-05`,
          diaryId: 101,
          emotion: 'TIRED',
          emotionLabel: '지침',
        }],
      },
    })
  }),

  // 월별 기록 요약
  http.get('*/diaries/summary', ({ request }) => {
    const url = new URL(request.url)
    const month = url.searchParams.get('month') ?? '2026-11'

    return HttpResponse.json({
      success: true,
      data: {
        month,
        woolCount: 7,
        sentence: '이번 달에도 마음을 돌보는 시간을 가졌어요.',
      },
    })
  }),

  // 기록 상세
  http.get('*/diaries/:diaryId', ({ params }) => {
    const diaryId = Number(params.diaryId)

    return HttpResponse.json({
      success: true,
      data: {
        diaryId,
        createdAt: '2026-11-05T21:30:00',
        emotion: 'TIRED',
        emotionLabel: '지침',
        careType: 'COMFORT',
        careStatus: 'COMPLETED',
        firstMessage: '많이 지쳤구나. 오늘은 어떤 돌봄이 필요해요?',
        summary: {
          careType: 'COMFORT',
          text: '오늘 하루를 버텨낸 것만으로도 충분히 의미 있어요.',
        },
        woolEarned: 1,
        messages: [
          {
            role: 'USER',
            content: '오늘은 유난히 지치고 힘들었어.',
            createdAt: '2026-11-05T21:30:00',
          },
          {
            role: 'AI',
            content: '많이 지쳤겠어요. 오늘 하루를 버텨낸 것도 의미 있는 일이에요.',
            createdAt: '2026-11-05T21:31:00',
          },
        ],
      },
    })
  }),

  // 개별 기록 삭제
  http.delete('*/diaries/:diaryId', () => {
    return HttpResponse.json({
      success: true,
      data: null,
    })
  }),
]
