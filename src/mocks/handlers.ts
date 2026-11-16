// 위치·이름 팀 확정 전 제안. 도메인별 핸들러를 모으는 구조는 작업 분담 규칙 기준.

import { authHandlers } from './handlers/auth'
import { diariesHandlers } from './handlers/diaries'
import { sheepHandlers } from './handlers/sheep'

export const handlers = [...authHandlers, ...sheepHandlers, ...diariesHandlers]
