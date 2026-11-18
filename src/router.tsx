import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import AuthRedirectHandler from './components/AuthRedirectHandler'
import { authRoutes } from './features/auth/routes'
import { homeRoutes } from './features/home/routes'
import { farmRoutes } from './features/farm/routes'
import { worryRoutes } from './features/worry/routes'
import { meRoutes } from './features/me/routes'
import { safetyRoutes } from './features/safety/routes'
import { NotificationListener } from './features/wool/NotificationListener'
import { reportRoutes } from './features/report/routes'
import { careRoutes } from './features/care/routes'
import RecordsPage from './features/records/pages/RecordsPage'
import RecordDetailPage from './features/records/pages/RecordDetailPage'
import DressPage from './features/dress/DressPage'
import DeleteRecordsPage from './features/records/pages/DeleteRecordsPage'
import AccountPage from './features/me/AccountPage'

export const router = createBrowserRouter([
  {
    element: (
      <>
        <Outlet />
        <NotificationListener />
        <AuthRedirectHandler />
      </>
    ),
    children: [
      ...authRoutes,
      ...safetyRoutes,
      {
        element: <RequireAuth />,
        children: [
          ...homeRoutes,
          ...reportRoutes,
          ...farmRoutes,
          ...worryRoutes,
          ...careRoutes,
          { path: '/records', element: <RecordsPage /> },
          { path: '/records/:diaryId', element: <RecordDetailPage /> },
          ...meRoutes,
          { path: '/dress', element: <DressPage /> },
          { path: '/me/records/delete', element: <DeleteRecordsPage /> },
          { path: '/me/account', element: <AccountPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
