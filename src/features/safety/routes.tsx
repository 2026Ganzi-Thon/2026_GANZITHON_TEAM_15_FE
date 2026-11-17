import type { RouteObject } from 'react-router-dom'
import CrisisPage from './CrisisPage'
export const safetyRoutes: RouteObject[] = [{ path: '/help/crisis', element: <CrisisPage /> }]
