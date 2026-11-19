import type { RouteObject } from 'react-router-dom'
import OnboardingPage from './pages/OnboardingPage'

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
]
