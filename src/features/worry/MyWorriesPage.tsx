import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { farmApi } from '../../api/farm'
import { Page } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { EmptyState, QueryState } from '../../components/feedback'
import { Sheep } from '../../components/Sheep'
export default function MyWorriesPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') === 'graduated' ? 'graduated' : 'active'
  const query = useQuery({ queryKey: ['my-worries', status], queryFn: ({ signal }) => farmApi.mine(status, signal), retry: 1 })
  return <Page><BackHeader title="내 고민" /><div className="tabs">{(['active','graduated'] as const).map(value => <button key={value} className={status === value ? 'active' : ''} aria-pressed={status === value} onClick={() => setParams({ status: value })}>{value === 'active' ? '진행 중' : '보관함'} {status === value ? query.data?.sheep.length : ''}</button>)}</div>
    <QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} />
    {query.data?.sheep.length === 0 && <EmptyState title={status === 'active' ? '아직 올린 고민이 없어요' : '아직 보관한 고민이 없어요'} />}
    {query.data?.sheep.map(s => <div className="worry-row" key={s.sheepId}><Sheep stage={s.stage} size={56} /><div className="grow">{s.hidden ? <p>{s.content}</p> : <Link to={`/worries/${s.sheepId}`} state={{ newWoolCount: s.newWoolCount }}>{s.content}</Link>}<small>{s.hidden ? '신고로 숨겨진 고민이에요' : status === 'graduated' ? `${s.graduatedAt ? new Date(s.graduatedAt).toLocaleDateString('ko-KR') : ''} 졸업` : s.newWoolCount ? `새 털 ${s.newWoolCount}올 도착` : '털을 기다리는 중'}</small></div></div>)}
    <Link className="ui-button report-submit" to="/worries/new">새 고민 올리기</Link>
  </Page>
}
