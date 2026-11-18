// 위치·이름 팀 확정 전 제안. 도메인별 핸들러를 모으는 구조는 작업 분담 규칙 기준.

import { authHandlers } from './handlers/auth'
import { careHandlers } from './handlers/care'
import { diariesHandlers } from './handlers/diaries'
import { sheepHandlers } from './handlers/sheep'
import { reportHandlers } from './handlers/report'
import { frontend2Handlers } from './handlers/frontend2'
import { careStartHandlers } from './handlers/careStart'

export const handlers = [...frontend2Handlers, ...authHandlers, ...sheepHandlers, ...diariesHandlers, ...careHandlers, ...careStartHandlers, ...reportHandlers]
