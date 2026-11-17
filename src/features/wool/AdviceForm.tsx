import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { farmApi, type SheepDetail } from '../../api/farm'
import { Button, Card } from '../../components/ui'
import { Sheep } from '../../components/Sheep'

export function AdviceForm({ sheep }: { sheep: SheepDetail }) {
  const [content, setContent] = useState('')
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: (sendAsIs: boolean) => farmApi.send(sheep.sheepId, content.trim(), sendAsIs), onSuccess: result => { if (result.status === 'SENT') { void client.invalidateQueries({ queryKey: ['farm'] }); void client.invalidateQueries({ queryKey: ['my-sheep'] }) } } })
  const result = mutation.data
  if (result?.status === 'SENT') return <><div className="success-hero"><div className="yarn-circle"><img src="/assets/figma/43-247-img.svg" width="84" height="84" alt="털실" /></div><h2>한 올 보냈어요</h2><p>털실 {result.yarnAdded}개를 받았어요</p></div><Link className="ui-button" to="/farm">목장으로</Link><Link className="text-link" to="/dress">내 양 꾸미러 가기</Link></>
  return <><Card className="row"><Sheep stage={sheep.stage} size={66} /><p className="grow">{sheep.content}</p></Card>
    {!sheep.canSendWool ? <p role="status">{sheep.alreadySent ? '이미 따뜻한 한 올을 보냈어요.' : '지금은 이 양에게 조언을 보낼 수 없어요.'}</p> : <>
    <label className="text-field advice-field"><span className="sr-only">조언 내용</span><textarea value={content} maxLength={100} disabled={mutation.isPending} onChange={e => { setContent(e.target.value); mutation.reset() }} placeholder="따뜻한 마음을 전해 주세요." /><small>{content.length} / 100</small></label>
    {result?.status === 'SUGGEST' && <Card className="suggestion"><strong>{result.message}</strong>{result.suggestion && <><p>{result.suggestion}</p><button className="text-link" onClick={() => { setContent(result.suggestion!.slice(0,100)); mutation.reset() }}>이 문장으로 바꾸기</button></>}<button className="text-link" disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>그대로 보내기</button></Card>}
    {result?.status === 'BLOCKED' && <p className="ui-error" role="alert">{result.message}</p>}
    {['오늘 정말 고생 많았어요','응원할게요','혼자가 아니에요'].map(text => <button key={text} className="menu-row" disabled={mutation.isPending || `${content} ${text}`.trim().length > 100} onClick={() => { setContent(`${content} ${text}`.trim()); mutation.reset() }}>{text}<img src="/assets/figma/10-9-img3.svg" width="18" height="18" alt="추가" /></button>)}
    {mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}
    <Button className="report-submit" disabled={!content.trim() || mutation.isPending} onClick={() => mutation.mutate(false)}>{mutation.isPending ? '보내는 중…' : '털 한 올 보내기'}</Button></>}
  </>
}
