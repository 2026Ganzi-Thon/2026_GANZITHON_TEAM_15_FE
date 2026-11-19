import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../../api/token'
import { hasSeenOnboarding } from './onboardingStorage'

export default function OnboardingStartGate() {
  if (!getToken() && !hasSeenOnboarding()) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
