import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../api/client'

export default function AuthRedirectHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate('/login', {
        replace: true,
        state: { from: location },
      })
    })

    return () => setUnauthorizedHandler(null)
  }, [navigate, location])

  return null
}