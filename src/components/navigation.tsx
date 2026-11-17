import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Header } from './ui'

export function BackHeader({ title, fallback = '/farm' }: { title: string; fallback?: string }) {
  const navigate = useNavigate()
  return <Header title={title} onBack={() => { if (window.history.state?.idx > 0) navigate(-1); else navigate(fallback) }} />
}
export function BottomNav() {
  return <nav className="bottom-nav" aria-label="하단 메뉴">{[['/', '내 우리', 'imgIcon'], ['/farm', '고민 목장', 'imgIcon1'], ['/me', '나', 'imgIcon2']].map(([to,label,icon]) => <NavLink key={to} to={to} end><img src={`/assets/figma/10-7-${icon}.svg`} width="22" height="22" alt="" />{label}</NavLink>)}</nav>
}
export function FarmInvitation({ diaryId }: { diaryId: number }) {
  return <Link className="invitation" to={`/worries/new?diaryId=${diaryId}`}>이 고민을 목장에도 올려볼까요? ›</Link>
}
