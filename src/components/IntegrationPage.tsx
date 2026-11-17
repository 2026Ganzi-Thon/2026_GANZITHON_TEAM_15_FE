import { Link, useLocation } from 'react-router-dom'
import { Page } from './ui'
import { BottomNav } from './navigation'

// Temporary integration landing until frontend 1 supplies these routes.
export default function IntegrationPage() {
  const location = useLocation()
  return <Page><h1 className="page-title">털 한 올</h1><p>이 화면은 프론트 1 기능과 연결될 예정이에요.</p><p className="muted">현재 경로: {location.pathname}</p><Link className="ui-button" to="/farm">고민 목장 둘러보기</Link><Link className="text-link" to="/me">나</Link><BottomNav /></Page>
}
