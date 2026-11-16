// 위치·이름은 팀 확정 전 제안, 기능별 routes.tsx를 모아 등록하는 구조(작업 분담 규칙)로 확장 예정

import { createBrowserRouter } from 'react-router-dom'
import App from './App'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
])
