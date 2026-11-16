import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '../../api/me'
import { Button, Card, Header, Page } from '../../components/ui'
import { submitReport, type ReportReason } from '../../api/report'

const reasons: { value: ReportReason; label: string; help?: string }[] = [
  { value: 'ABUSIVE', label: '악성 표현이에요' },
  { value: 'PERSONAL_INFO', label: '개인정보가 들어 있어요' },
  { value: 'SPAM', label: '홍보·스팸이에요' },
  { value: 'LOOKS_DANGEROUS', label: '글쓴이가 위험해 보여요', help: '상담 안내를 전해 드려요' },
  { value: 'ETC', label: '기타' },
]

export default function ReportPage() {
  const navigate = useNavigate()
  const { worryId, targetId, targetType = 'WORRY_SHEEP' } = useParams()
  const id = targetId ?? worryId ?? ''
  const location = useLocation()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: submitReport, onSuccess: () => client.invalidateQueries({ queryKey: ['farm'] }) })
  const block = useMutation({ mutationFn: () => meApi.block({ targetType: targetType as 'WOOL' | 'WORRY_SHEEP', targetId: Number(id) }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['farm'] }); void client.invalidateQueries({ queryKey: ['blocks'] }) } })
  const content = typeof location.state?.content === 'string' ? location.state.content : null
  const validId = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0 && ['WORRY_SHEEP','WOOL'].includes(targetType)
  const back = () => navigate('/farm', { replace: true })

  return <Page>
    <Header title="신고하기" onBack={back} />
    {mutation.isSuccess ? <><h2>신고했어요</h2><p>신고가 접수되었어요. 확인한 뒤 조치할게요.</p><Card><p>이 목동을 차단하면 서로의 양이 보이지 않아요.</p><Button disabled={block.isPending || block.isSuccess} onClick={() => block.mutate()}>{block.isSuccess ? '차단했어요' : block.isPending ? '차단하는 중…' : '이 목동 차단하기'}</Button></Card>{block.error && <p role="alert" className="ui-error">{block.error.message}</p>}<Button className="report-submit" onClick={back}>확인</Button></> : <>
      <h2>어떤 점이 걱정되나요?</h2>
      {content && <Card><small>신고할 글</small>{content}</Card>}
      {!validId && <p role="alert" className="ui-error">신고할 고민을 확인할 수 없어요. 이전 화면에서 다시 선택해 주세요.</p>}
      <fieldset className="report-reasons"><legend>신고 사유 선택</legend>{reasons.map(item => <label className="report-reason" key={item.value}>
        <span>{item.label}{item.help && <small>{item.help}</small>}</span>
        <input type="radio" name="reason" value={item.value} checked={reason === item.value} disabled={mutation.isPending} onChange={() => setReason(item.value)} />
      </label>)}</fieldset>
      {mutation.isError && <p role="alert" className="ui-error">{mutation.error.message}</p>}
      <Button className="report-submit" disabled={!reason || !validId || mutation.isPending} onClick={() => { if (reason && validId) mutation.mutate({ targetType: targetType as 'WORRY_SHEEP' | 'WOOL', targetId: Number(id), reason, blockUser: false }) }}>{mutation.isPending ? '신고하는 중…' : '신고하기'}</Button>
    </>}
  </Page>
}

