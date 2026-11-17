import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { meApi } from '../../api/me'
import { Page, Button } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { QueryState } from '../../components/feedback'
export default function NicknamePage() {
  const client = useQueryClient()
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['me'], queryFn: ({ signal }) => meApi.get(signal), retry: 1 })
  const [draft, setDraft] = useState<string | null>(null)
  const nickname = draft ?? query.data?.nickname ?? ''
  const valid = nickname.length >= 2 && nickname.length <= 10 && /^[가-힣a-zA-Z0-9]+(?: [가-힣a-zA-Z0-9]+)*$/.test(nickname)
  const mutation = useMutation({ mutationFn: () => meApi.nickname(nickname), onSuccess: data => { client.setQueryData(['me'], data); navigate('/me', { replace: true }) } })
  return <Page><BackHeader title="닉네임 바꾸기" fallback="/me" /><QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} /><label className="nickname-label">닉네임<div className="nickname-field"><input aria-describedby="nickname-help" value={nickname} maxLength={10} disabled={query.isPending || mutation.isPending} onChange={e => setDraft(e.target.value)} /><small>{nickname.length} / 10</small></div></label><p id="nickname-help" className="muted">2~10자의 한글·영문·숫자와 한 칸 띄어쓰기를 사용할 수 있어요. 실명은 쓰지 마세요.</p>{mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}<Button className="report-submit" disabled={!valid || !query.data || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? '저장하는 중…' : '저장'}</Button></Page>
}
