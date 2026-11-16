import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { farmApi, farmNames, type FarmCode } from '../../api/farm'
import { Page, Button, Card } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { BottomSheet } from '../../components/feedback'

export default function NewWorryPage() {
  const [params] = useSearchParams()
  const diaryId = Number(params.get('diaryId'))
  const client = useQueryClient()
  const recommendation = useQuery({ queryKey: ['farm-recommendation', diaryId], queryFn: () => farmApi.recommend(diaryId), enabled: Number.isSafeInteger(diaryId) && diaryId > 0, retry: 1 })
  const [content, setContent] = useState('')
  const [chosen, setChosen] = useState<FarmCode | null>(null)
  const code = chosen ?? recommendation.data?.farmCode ?? 'CAREER'
  const [choosing, setChoosing] = useState(false)
  const mutation = useMutation({ mutationFn: () => farmApi.post(code, content.trim()), onSuccess: () => { void client.invalidateQueries({ queryKey: ['my-worries'] }); void client.invalidateQueries({ queryKey: ['crisis-banner'] }) } })
  const result = mutation.data
  return <Page><BackHeader title="고민 올리기" />
    {result?.status === 'CREATED' ? <><div className="success-hero"><img src="/assets/figma/new-sheep.svg" width="300" height="280" alt="새로 태어난 고민 양" /><h2>고민 양이 태어났어요</h2><p>{content}</p></div><Link className="ui-button" to={`/worries/${result.sheepId}`}>내 고민 보기</Link><Link className="text-link" to="/farm">목장으로</Link></> : <>
    <label className="text-field"><span className="sr-only">고민 내용</span><textarea maxLength={200} value={content} onChange={e => { setContent(e.target.value); mutation.reset() }} disabled={mutation.isPending} placeholder="어떤 고민이 있나요? 편하게 적어 주세요." /><small>{content.length} / 200</small></label>
    <button className="select-row" onClick={() => setChoosing(true)} disabled={mutation.isPending}><span>목장</span><strong>{farmNames[code]} ›</strong></button>
    <p className="muted"><img src="/assets/figma/10-3-imgLock.svg" width="16" height="16" alt="" /> 닉네임으로만 보여요</p>
    {recommendation.isError && <p className="muted">추천 목장을 불러오지 못했어요. 직접 골라 주세요.</p>}
    {result?.status === 'PII_REJECTED' && <p role="alert" className="ui-error">{result.message}</p>}
    {result?.status === 'CRISIS' && <Card><p>{result.crisisHelp.message}</p><Link className="text-link" to="/help/crisis" state={{ returnTo: '/worries/new' }}>도움받을 곳 보기</Link><p className="muted">고민은 게시되지 않았어요.</p></Card>}
    {mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}
    <Button className="report-submit" disabled={!content.trim() || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? '올리는 중…' : '올리기'}</Button>
    {choosing && <BottomSheet title="목장 고르기" onClose={() => setChoosing(false)}>{Object.entries(farmNames).map(([key,label]) => <button className="menu-row" key={key} onClick={() => { setChosen(key as FarmCode); setChoosing(false) }}>{label}{key === code && ' ✓'}</button>)}</BottomSheet>}
    </>}
  </Page>
}
