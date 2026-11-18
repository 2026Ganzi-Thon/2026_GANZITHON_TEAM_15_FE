import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { meApi } from '../../api/me'
import { clearToken } from '../../api/token'
import { Page, Card, Button, Header } from '../../components/ui'

export default function AccountPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmed, setConfirmed] = useState(false)

  const mutation = useMutation({
    mutationFn: () => meApi.deleteAccount(),
    onSuccess: () => {
      clearToken()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })

  const handleDelete = () => {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    if (window.confirm('정말 탈퇴할까요? 탈퇴 후에는 계정을 복구할 수 없습니다.')) {
      mutation.mutate()
    }
  }

  return (
    <Page>
      <Header title="회원 탈퇴" onBack={() => navigate(-1)} />
      <Card>
        <h2>털 한 올을 떠나시겠어요?</h2>
        <p>회원 탈퇴 시 계정과 서비스 이용 정보가 삭제될 수 있습니다.</p>
        <p className="ui-error">탈퇴 후에는 계정을 복구할 수 없어요.</p>
      </Card>

      {mutation.isError && <p className="ui-error">{mutation.error.message}</p>}

      <Button
        className="report-submit"
        disabled={mutation.isPending}
        onClick={handleDelete}
      >
        {mutation.isPending ? '탈퇴 처리 중…' : confirmed ? '탈퇴 최종 확인' : '회원 탈퇴하기'}
      </Button>
    </Page>
  )
}
