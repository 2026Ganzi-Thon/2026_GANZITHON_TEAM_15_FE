import type { RouteObject } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export const authRoutes: RouteObject[] = [
  // 경로 팀 확정 전 제안
  {
    path: '/login',
    element: <LoginPage />,
  },
  // 경로 팀 확정 전 제안
  {
    path: '/signup',
    element: <SignupPage />,
  },
]
