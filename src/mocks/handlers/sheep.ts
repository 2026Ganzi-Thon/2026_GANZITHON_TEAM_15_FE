// 위치·이름 팀 확정 전 제안, 도메인별 핸들러 파일 구조는 작업 분담 규칙 기준

import { http, HttpResponse } from 'msw'
import type { ApiResponse, MySheepResponse } from '../../api/types'

export const sheepHandlers = [
  http.get(/\/my-sheep$/, () =>
    HttpResponse.json<ApiResponse<MySheepResponse>>({
      success: true,
      data: {
        stage: 3,
        stageName: '포근한 양',
        woolCount: 7,
        stageStartAt: 6,
        nextStageAt: 9,
        woolToNextStage: 2,
        yarnCount: 4,
        equippedItems: ['SCARF'],
      },
    }),
  ),
]
