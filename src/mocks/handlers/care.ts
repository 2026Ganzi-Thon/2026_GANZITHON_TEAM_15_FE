// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http, HttpResponse } from 'msw'
import type { ApiFailure, ApiResponse, CareMessageRequest, CompleteCareResponse } from '../../api/types'
import { careTypesByDiary } from './careStart'

const encoder = new TextEncoder()
const wireframeExample = '다들 잘하는데 나만 제자리인 것 같아서 지쳤어요.'
const wireframeReplies: Record<string, string> = {
  COMFORT: '그렇게 느껴지면 마음이 더 좁아지죠. 그런데 오늘 하루를 끝까지 버텨낸 것도 분명히 앞으로 나아간 거예요.',
  LISTEN: '많이 지쳤겠어요. 그 마음, 더 들려줄래요?',
  ORGANIZE: '정리해 볼게요.\n걸리는 것 · 나만 제자리인 느낌\n바꿀 수 있는 것 · 오늘 할 일 하나',
  SOLVE: '작은 것부터 해볼까요?\n① 오늘 한 가지 끝내기\n② 내일 할 일 하나 정하기\n③ 쉬는 시간 정하기',
}

const messageCounts = new Map<number, number>()
const completedCare = new Map<number, CompleteCareResponse>()

export const careHandlers = [
  http.post(/\/diaries\/(\d+)\/care\/messages$/, async ({ request }) => {
    const diaryId = Number(new URL(request.url).pathname.match(/\/diaries\/(\d+)\/care\/messages$/)?.[1])
    const body = await request.json() as CareMessageRequest
    if (completedCare.has(diaryId)) {
      const failure: ApiFailure = {
        success: false,
        error: { code: 'COMMON_409', message: '이미 마무리한 대화예요.' },
      }
      return HttpResponse.json(failure, { status: 409 })
    }
    const previousCount = messageCounts.get(diaryId) ?? 0
    if (previousCount >= 10) {
      const failure: ApiFailure = {
        success: false,
        error: { code: 'COMMON_409', message: '대화 횟수 한도에 도달했어요.' },
      }
      return HttpResponse.json(failure, { status: 409 })
    }

    const userMessageCount = previousCount + 1
    messageCounts.set(diaryId, userMessageCount)
    const progress = `event:progress\ndata:${JSON.stringify({
      userMessageCount,
      ready: userMessageCount >= 3,
      maxUserMessages: 10,
      limitReached: userMessageCount >= 10,
    })}\n\n`
    // 이 고정 데모 답변은 와이어프레임의 예시 입력과 정확히 일치할 때만 보냅니다.
    // MSW는 사용자 내용을 이해하는 AI가 아니며, 그 외 입력에는 delta를 만들지 않습니다.
    const reply = body.content === wireframeExample
      ? wireframeReplies[careTypesByDiary.get(diaryId) ?? 'LISTEN']
      : undefined
    const responseFrames = [
      progress,
      ...(reply ? [`event:delta\ndata:${JSON.stringify({ text: reply })}\n\n`] : []),
      'event:done\ndata:{}\n\n',
    ]
    let frameIndex = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let canceled = false

    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (timer !== undefined || canceled || frameIndex >= responseFrames.length) return

        timer = setTimeout(() => {
          timer = undefined
          if (canceled || controller.desiredSize === null) {
            return
          }

          const frame = responseFrames[frameIndex]
          frameIndex += 1
          controller.enqueue(encoder.encode(frame))
          if (frameIndex === responseFrames.length) controller.close()
        }, 300)
      },
      cancel() {
        canceled = true
        if (timer !== undefined) {
          clearTimeout(timer)
          timer = undefined
        }
      },
    })

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
    })
  }),
  http.post(/\/diaries\/(\d+)\/care\/complete$/, ({ request }) => {
    const diaryId = Number(new URL(request.url).pathname.match(/\/diaries\/(\d+)\/care\/complete$/)?.[1])
    const priorCompletion = completedCare.get(diaryId)
    if (priorCompletion) {
      const response: ApiResponse<CompleteCareResponse> = {
        success: true,
        data: { ...priorCompletion, wool: { ...priorCompletion.wool, added: 0 } },
      }
      return HttpResponse.json(response)
    }

    if ((messageCounts.get(diaryId) ?? 0) < 3) {
      const failure: ApiFailure = {
        success: false,
        error: { code: 'COMMON_409', message: '대화를 3회 나눈 뒤 마무리할 수 있어요.' },
      }
      return HttpResponse.json(failure, { status: 409 })
    }

    // 목업용 고정 요약 예시이며 실제 사용자별 AI 응답이 아닙니다.
    const completion: CompleteCareResponse = {
      summary: {
        careType: careTypesByDiary.get(diaryId) ?? 'LISTEN',
        text: '작년 발표가 떠올라도 오늘의 당신까지 정해진 것은 아니에요.',
      },
      wool: { added: 1, total: 7, stage: 3, stageUp: false },
    }
    completedCare.set(diaryId, completion)

    const response: ApiResponse<CompleteCareResponse> = { success: true, data: completion }
    return HttpResponse.json(response)
  }),
]
