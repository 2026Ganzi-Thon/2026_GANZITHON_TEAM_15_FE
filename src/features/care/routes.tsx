import type { RouteObject } from 'react-router-dom'
import CareChatPage from './pages/CareChatPage'
import CareCompletePage from './pages/CareCompletePage'
import CareSelectPage from './pages/CareSelectPage'

export const careRoutes: RouteObject[] = [
  // 경로 팀 확정 전 제안
  {
    path: '/care/:diaryId/complete',
    element: <CareCompletePage />,
  },
  {
    path: '/care/:diaryId/chat',
    element: <CareChatPage />,
  },
  // 경로 팀 확정 전 제안
  {
    path: '/care/:diaryId',
    element: <CareSelectPage />,
  },
]
