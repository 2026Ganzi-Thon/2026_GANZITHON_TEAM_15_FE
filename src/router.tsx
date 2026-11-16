// 위치·이름은 팀 확정 전 제안, 기능별 routes.tsx를 모아 등록하는 구조(작업 분담 규칙)로 확장 예정

import { createBrowserRouter, Outlet } from 'react-router-dom'
import IntegrationPage from './components/IntegrationPage'
import { farmRoutes } from './features/farm/routes'
import { worryRoutes } from './features/worry/routes'
import { meRoutes } from './features/me/routes'
import { safetyRoutes } from './features/safety/routes'
import { NotificationListener } from './features/wool/NotificationListener'
import { reportRoutes } from './features/report/routes'

export const router = createBrowserRouter([{ element: <><Outlet /><NotificationListener /></>, children: [
  ...reportRoutes, ...farmRoutes, ...worryRoutes, ...meRoutes, ...safetyRoutes,
  ...['/', '/dress', '/me/records/delete', '/me/account'].map(path => ({ path, element: <IntegrationPage /> })),
  { path: '*', element: <IntegrationPage /> },
] }])
