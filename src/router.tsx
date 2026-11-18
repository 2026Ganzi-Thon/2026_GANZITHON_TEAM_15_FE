import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import IntegrationPage from './components/IntegrationPage'
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
          ...meRoutes,
          ...['/dress', '/me/records/delete', '/me/account'].map(path => ({
            path,
            element: <IntegrationPage />,
          })),
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
