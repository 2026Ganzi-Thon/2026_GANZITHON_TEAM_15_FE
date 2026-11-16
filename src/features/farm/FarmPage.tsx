import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { farmApi, type FarmCode } from '../../api/farm'
import { Page, Card, Button } from '../../components/ui'
import { BottomNav } from '../../components/navigation'
import { Sheep } from '../../components/Sheep'
import { EmptyState, QueryState } from '../../components/feedback'
import { CrisisBanner } from '../safety/CrisisBanner'

export default function FarmPage() {
  const [code, setCode] = useState<FarmCode | 'all'>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const query = useInfiniteQuery({ queryKey: ['farm', code], initialPageParam: 0, queryFn: ({ pageParam, signal }) => farmApi.list(code, pageParam, signal), getNextPageParam: last => last.hasNext ? last.page + 1 : undefined, retry: 1 })
  const sheep = query.data?.pages.flatMap(p => p.sheep) ?? []
  const current = sheep.find(s => s.sheepId === selected) ?? sheep[0]
  return <Page><div className="row"><h1 className="page-title">고민 목장</h1><div className="row"><Link to="/worries/new">올리기</Link><Link to="/worries/me">내 고민</Link></div></div>
    <CrisisBanner />
    <div className="tabs" aria-label="목장 주제">{([['all','전체'],['CAREER','진로'],['RELATIONSHIP','관계'],['BURNOUT','번아웃'],['SELF','나']] as const).map(([value,label]) => <button className={code === value ? 'active' : ''} aria-pressed={code === value} key={value} onClick={() => { setCode(value); setSelected(null) }}>{label}</button>)}</div>
    <QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} />
    {!query.isPending && !query.error && !sheep.length && <EmptyState title="이 목장에는 아직 고민 양이 없어요" action="첫 고민 올리기" to="/worries/new" />}
    {sheep.length > 0 && <><div className="pasture" aria-label="고민 양 선택">{sheep.map((s, i) => <button key={s.sheepId} className={`pasture-sheep ${current?.sheepId === s.sheepId ? 'selected' : ''}`} aria-label={`${s.nickname}의 고민: ${s.content}`} aria-pressed={current?.sheepId === s.sheepId} onClick={() => setSelected(s.sheepId)} style={{ animationDelay: `${i * 0.12}s` }}><Sheep stage={s.stage} size={current?.sheepId === s.sheepId ? 110 : 72} /></button>)}</div>
      {current && <Card><p>{current.content}</p><div className="row card-footer"><small>{current.nickname} · {new Date(current.createdAt).toLocaleDateString('ko-KR')}</small><Link className="ui-button compact" to={`/worries/${current.sheepId}`}>{current.alreadySent ? '보낸 고민 보기' : '조언하기'}</Link></div></Card>}
      {query.hasNextPage && <Button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? '불러오는 중…' : '다른 양 더 보기'}</Button>}</>}
    <BottomNav />
  </Page>
}
