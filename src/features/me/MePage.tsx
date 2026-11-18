import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { clearToken } from '../../api/token'
import { meApi } from '../../api/me'
import { Page, Card } from '../../components/ui'
import { BottomNav } from '../../components/navigation'
import { Sheep } from '../../components/Sheep'
import { QueryState } from '../../components/feedback'
import { PushSettings } from '../wool/PushSettings'
export default function MePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    clearToken()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const query = useQuery({ queryKey: ['me'], queryFn: ({ signal }) => meApi.get(signal), retry: 1 })
  const sheep = useQuery({ queryKey: ['my-sheep'], queryFn: ({ signal }) => meApi.sheep(signal), retry: 1 })
  return <Page><h1 className="page-title">나</h1><QueryState pending={query.isPending || sheep.isPending} error={query.error ?? sheep.error} retry={() => { void query.refetch(); void sheep.refetch() }} />{query.data && <Card className="row"><Sheep stage={sheep.data?.stage} size={72} /><div className="grow"><strong>{query.data.nickname}</strong><small>털실 {sheep.data?.yarnCount ?? '—'}</small></div><Link className="ui-button compact" to="/dress">꾸미기</Link></Card>}
    <div>{[['/me/nickname','닉네임 바꾸기'],['/help/crisis','힘들 때 도움받을 곳'],['/me/blocks','차단한 목동 관리'],['/worries/me','내 고민·보관함'],['/me/records/delete','기록 전체 삭제'],['/me/account','회원 탈퇴']].map(([to,label]) => <Link className="menu-row" key={to} to={to}>{label}<img src="/assets/figma/18-103-img1.svg" width="20" height="20" alt="" /></Link>)}</div>
    <button className="menu-row" type="button" onClick={handleLogout}>
      로그아웃
    </button>
    <PushSettings /><BottomNav /></Page>
}
