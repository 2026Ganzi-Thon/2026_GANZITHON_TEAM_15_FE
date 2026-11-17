import type { RouteObject } from 'react-router-dom'
import MePage from './MePage'
import NicknamePage from './NicknamePage'
import BlocksPage from './BlocksPage'
export const meRoutes: RouteObject[] = [{ path: '/me', element: <MePage /> }, { path: '/me/nickname', element: <NicknamePage /> }, { path: '/me/blocks', element: <BlocksPage /> }]
