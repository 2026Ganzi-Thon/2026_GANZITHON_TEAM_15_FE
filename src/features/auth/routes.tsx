import type { RouteObject } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

export const authRoutes: RouteObject[] = [
  // 경로 팀 확정 전 제안
  {
    path: '/login',
    element: <LoginPage />,
  },
]
