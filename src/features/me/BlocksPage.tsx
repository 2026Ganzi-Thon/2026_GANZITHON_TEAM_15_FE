import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meApi, type Block } from '../../api/me'
import { Page, Button } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { BottomSheet, EmptyState, QueryState } from '../../components/feedback'
export default function BlocksPage() {
  const client = useQueryClient()
  const [selected, setSelected] = useState<Block | null>(null)
  const query = useQuery({ queryKey: ['blocks'], queryFn: ({ signal }) => meApi.blocks(signal), retry: 1 })
  const mutation = useMutation({ mutationFn: (id: number) => meApi.unblock(id), onSuccess: () => { setSelected(null); void client.invalidateQueries({ queryKey: ['blocks'] }); void client.invalidateQueries({ queryKey: ['farm'] }) } })
  return <Page><BackHeader title="차단한 목동" fallback="/me" /><QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} />{query.data?.length === 0 && <EmptyState title="차단한 목동이 없어요" />}{query.data?.map(block => <div className="menu-row" key={block.blockId}><div>{block.nickname}<small>{new Date(block.blockedAt).toLocaleDateString('ko-KR')} 차단</small></div><button className="text-link" onClick={() => { setSelected(block); mutation.reset() }}>해제</button></div>)}{selected && <BottomSheet title="차단을 해제할까요?" onClose={() => { if (!mutation.isPending) setSelected(null) }}><p>{selected.nickname}의 양이 다시 목장에 보여요.</p><Button disabled={mutation.isPending} onClick={() => mutation.mutate(selected.blockId)}>해제하기</Button>{mutation.error && <p role="alert" className="ui-error">{mutation.error.message}</p>}</BottomSheet>}</Page>
}
