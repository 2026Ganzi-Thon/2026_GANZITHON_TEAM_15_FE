// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http } from 'msw'

const encoder = new TextEncoder()
const frames = [
  'event:progress\ndata:{"userMessageCount":1,"ready":false,"maxUserMessages":10,"limitReached":false}\n\n',
  // 실제 AI 응답이 아닌 목업 고정 문구입니다.
  'event:delta\ndata:{"text":"내일 발표라니 마음이 얼마나 조급할지 느껴져요."}\n\n',
  'event:delta\ndata:{"text":"오늘은 어떤 점이 가장 마음에 걸리나요?"}\n\n',
  'event:done\ndata:{}\n\n',
]

export const careHandlers = [
  http.post(/\/diaries\/\d+\/care\/messages$/, () => {
    let frameIndex = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let canceled = false

    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (timer !== undefined || canceled || frameIndex >= frames.length) return

        timer = setTimeout(() => {
          if (canceled || controller.desiredSize === null) return

          controller.enqueue(encoder.encode(frames[frameIndex]))
          frameIndex += 1
          if (frameIndex === frames.length) controller.close()
          timer = undefined
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
]
