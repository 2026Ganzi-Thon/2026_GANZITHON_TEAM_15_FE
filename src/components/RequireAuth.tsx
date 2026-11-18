import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken } from '../api/token'

export default function RequireAuth() {
  const location = useLocation()

  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
