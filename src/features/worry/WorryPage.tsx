import { useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { farmApi, type WoolItem } from '../../api/farm'
import { Page, Button } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { Sheep } from '../../components/Sheep'
import { BottomSheet, QueryState, EmptyState } from '../../components/feedback'
import { ContentMenu } from '../report/ContentMenu'
import { AdviceForm } from '../wool/AdviceForm'

function ReceivedWool({ wool, sheepId }: { wool: WoolItem; sheepId: number }) {
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: () => farmApi.thank(wool.woolId), onSuccess: () => client.invalidateQueries({ queryKey: ['worry', sheepId] }) })
  return <div className="received-wool"><div className="grow"><p>{wool.content}</p><small>{wool.senderNickname} · {new Date(wool.createdAt).toLocaleDateString('ko-KR')}</small>{mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}</div><button className="icon-button" disabled={wool.thanked || mutation.isPending || mutation.isSuccess} aria-label={wool.thanked || mutation.isSuccess ? '고마워요 보냄' : '고마워요 보내기'} onClick={() => mutation.mutate()}>{wool.thanked || mutation.isSuccess ? '♥' : <img src="/assets/figma/10-11-img3.svg" width="24" height="24" alt="" />}</button><ContentMenu target={{ targetType: 'WOOL', targetId: wool.woolId }} content={wool.content} /></div>
}
export default function WorryPage() {
  const { id } = useParams()
  const sheepId = Number(id)
  const location = useLocation()
  const [confirm, setConfirm] = useState(false)
  const client = useQueryClient()
  const valid = Number.isSafeInteger(sheepId) && sheepId > 0
  const query = useQuery({ queryKey: ['worry', sheepId], queryFn: ({ signal }) => farmApi.detail(sheepId, signal), enabled: valid, retry: 1 })
  const mutation = useMutation({ mutationFn: () => farmApi.graduate(sheepId), onSuccess: () => { setConfirm(false); void client.invalidateQueries({ queryKey: ['worry', sheepId] }); void client.invalidateQueries({ queryKey: ['my-worries'] }) } })
  const sheep = query.data
  return <Page><div className="row"><BackHeader title={sheep?.mine ? '내 고민' : '조언하기'} />{sheep && !sheep.mine && <ContentMenu target={{ targetType: 'WORRY_SHEEP', targetId: sheepId }} content={sheep.content} />}</div>
    {!valid ? <EmptyState title="고민을 찾을 수 없어요" action="목장으로" to="/farm" /> : <QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} />}
    {sheep && (sheep.mine ? <><div className="sheep-hero"><Sheep stage={sheep.stage} size={204} added={Number(location.state?.newWoolCount) || 0} /></div><h2 className="center">{sheep.wools?.length ? '털이 풍성해졌어요' : '따뜻한 한 올을 기다려요'}</h2><p>{sheep.content}</p>
    {(sheep.wools ?? []).map(wool => <ReceivedWool key={wool.woolId} wool={wool} sheepId={sheepId} />)}
    {sheep.status.toLowerCase() !== 'graduated' && <Button className="report-submit" onClick={() => setConfirm(true)}>보관함으로 보내기</Button>}
    <Link className="text-link" to="/worries/me">내 고민 목록으로</Link>
    {confirm && <BottomSheet title="고민 양을 졸업시킬까요?" onClose={() => { if (!mutation.isPending) setConfirm(false) }}><p>보관함에서 받은 마음을 다시 볼 수 있어요. 졸업한 양은 새 조언을 받지 않아요.</p><Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>졸업시키기</Button>{mutation.error && <p role="alert">{mutation.error.message}</p>}</BottomSheet>}
    </> : <AdviceForm sheep={sheep} />)}
  </Page>
}
