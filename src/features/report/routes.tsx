import type { RouteObject } from 'react-router-dom'
import ReportPage from './ReportPage'

export const reportRoutes: RouteObject[] = [{ path: '/worries/:worryId/report', element: <ReportPage /> }, { path: '/reports/:targetType/:targetId', element: <ReportPage /> }]
