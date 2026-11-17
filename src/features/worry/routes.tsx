import type { RouteObject } from 'react-router-dom'
import NewWorryPage from './NewWorryPage'
import MyWorriesPage from './MyWorriesPage'
import WorryPage from './WorryPage'
export const worryRoutes: RouteObject[] = [
  { path: '/worries/new', element: <NewWorryPage /> },
  { path: '/worries/me', element: <MyWorriesPage /> },
  { path: '/worries/:id', element: <WorryPage /> },
]
