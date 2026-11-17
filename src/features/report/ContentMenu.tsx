import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi, type ContentTarget } from '../../api/me'
import { BottomSheet } from '../../components/feedback'
import { Button } from '../../components/ui'
export function ContentMenu({ target, content }: { target: ContentTarget; content: string }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const navigate = useNavigate()
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: () => meApi.block(target), onSuccess: () => { void client.invalidateQueries(); navigate('/farm', { replace: true }) } })
  return <><button className="icon-button" aria-label="더보기" onClick={() => setOpen(true)}><img src="/assets/figma/10-9-img1.svg" width="24" height="24" alt="" /></button>{open && <BottomSheet title={confirm ? '이 목동을 차단할까요?' : '더보기'} onClose={() => { if (!mutation.isPending) { setOpen(false); setConfirm(false) } }}>
    {confirm ? <><p>차단하면 서로의 양이 목장에서 보이지 않아요.</p><Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? '차단하는 중…' : '차단하기'}</Button></> : <><button className="menu-row" onClick={() => navigate(`/reports/${target.targetType}/${target.targetId}`, { state: { content } })}>신고하기</button><button className="menu-row" onClick={() => setConfirm(true)}>이 목동 차단하기</button></>}
    {mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}
  </BottomSheet>}</>
}
