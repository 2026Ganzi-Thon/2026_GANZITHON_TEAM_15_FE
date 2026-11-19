import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../../api/token'

export default function OnboardingStartGate() {
  if (!getToken()) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
