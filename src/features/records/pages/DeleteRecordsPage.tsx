import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { recordsApi } from '../../../api/records'
import { Page, Card, Button, Header } from '../../../components/ui'

export default function DeleteRecordsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmed, setConfirmed] = useState(false)

  const mutation = useMutation({
    mutationFn: () => recordsApi.deleteAll(),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      navigate('/me', { replace: true })
    },
  })

  const handleDelete = () => {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    if (window.confirm('정말 모든 기록을 삭제할까요? 삭제한 기록은 복구할 수 없습니다.')) {
      mutation.mutate()
    }
  }

  return (
    <Page>
      <Header title="기록 전체 삭제" onBack={() => navigate(-1)} />
      <Card>
        <h2>모든 기록을 삭제할까요?</h2>
        <p>삭제하면 지금까지 작성한 감정 기록과 대화 기록을 모두 삭제합니다.</p>
        <p className="ui-error">삭제한 기록은 복구할 수 없어요.</p>
      </Card>

      {mutation.isError && <p className="ui-error">{mutation.error.message}</p>}

      <Button
        className="report-submit"
        disabled={mutation.isPending}
        onClick={handleDelete}
      >
        {mutation.isPending ? '삭제 중…' : confirmed ? '전체 기록 삭제 확인' : '기록 삭제하기'}
      </Button>
    </Page>
  )
}
