import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { safetyApi } from '../../api/safety'
export function CrisisBanner() {
  const location = useLocation()
  const query = useQuery({ queryKey: ['crisis-banner'], queryFn: async ({ signal }) => {
    const data = await safetyApi.banner(signal)
    return { ...data, active: data.active && (!data.crisisBannerUntil || Date.parse(data.crisisBannerUntil) > Date.now()) }
  }, refetchInterval: 60000, retry: false })
  const banner = query.data
  if (!banner?.active) return null
  return <Link className="crisis-banner" to="/help/crisis" state={{ returnTo: location.pathname + location.search }}>혼자 견디지 않아도 괜찮아요. 도움받을 곳 ›</Link>
}
