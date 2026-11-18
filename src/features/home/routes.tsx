import type { RouteObject } from 'react-router-dom'
import HomePage from './pages/HomePage'

export const homeRoutes: RouteObject[] = [
  // 경로 팀 확정 전 제안
  {
    path: '/',
    element: <HomePage />,
  },
]
