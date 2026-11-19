import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { recordsApi } from '../../../api/records'
import { QueryState } from '../../../components/feedback'
import { BackHeader, BottomNav } from '../../../components/navigation'
import { Button, Card, Page } from '../../../components/ui'
import './records.css'

const CARE_LABELS: Record<string, string> = {
  LISTEN: '그저 들어주기',
  COMFORT: '위로받기',
  ORGANIZE: '생각 정리하기',
  SOLVE: '해결 방법 찾기',
}

const EMOTION_SYMBOLS: Record<string, string> = {
  JOY: '☀️',
  CALM: '🌿',
  TIRED: '🌙',
  ANXIOUS: '☁️',
  DEPRESSED: '🌧️',
  LONELY: '🍂',
  ANGRY: '🔥',
  COMPLICATED: '🌀',
}

function RecordDetailPage() {
  const { diaryId: diaryIdParam } = useParams()
  const diaryId = Number(diaryIdParam)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['record-detail', diaryId],
    queryFn: ({ signal }) => recordsApi.getDetail(diaryId, signal),
    enabled: Number.isSafeInteger(diaryId) && diaryId > 0,
  })

  const deleteMutation = useMutation({
    mutationFn: () => recordsApi.deleteDiary(diaryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['records'] })
      await queryClient.invalidateQueries({ queryKey: ['records-summary'] })
      navigate('/records', { replace: true })
    },
    onError: () => {
      setDeleteError('기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.')
    },
  })

  if (!Number.isSafeInteger(diaryId) || diaryId <= 0) {
    return (
      <Page className="records-page">
        <BackHeader title="기록 상세" fallback="/records" />
        <Card>올바르지 않은 기록 주소예요.</Card>
      </Page>
    )
  }

  const detail = detailQuery.data

  return (
    <Page className="records-page">
      <BackHeader title="기록 상세" fallback="/records" />

      <QueryState
        pending={detailQuery.isPending}
        error={detailQuery.error}
        retry={() => { void detailQuery.refetch() }}
      />

      {detail && (
        <>
          <Card className="record-detail-emotion">
            <span className="record-detail-symbol">
              {EMOTION_SYMBOLS[detail.emotion] ?? '🐑'}
            </span>
            <p className="muted">
              {new Date(detail.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <h2>{detail.emotionLabel}</h2>
          </Card>

          <section className="record-detail-section">
            <h2>오늘의 돌봄</h2>
            <Card>
              <p>{CARE_LABELS[detail.careType] ?? '돌봄 기록'}</p>
              <p className="muted">
                {detail.careStatus === 'COMPLETED'
                  ? '돌봄을 마쳤어요.'
                  : detail.careStatus === 'IN_PROGRESS'
                    ? '진행 중이던 돌봄이에요.'
                    : '돌봄을 시작하지 않은 기록이에요.'}
              </p>
            </Card>
          </section>

          <section className="record-detail-section">
            <h2>나눈 이야기</h2>
            <div className="record-detail-messages">
              {detail.messages.length === 0 ? (
                <Card>
                  <p>{detail.firstMessage}</p>
                </Card>
              ) : (
                detail.messages.map((message, index) => (
                  <div
                    className={`record-message ${message.role === 'USER' ? 'user' : 'ai'}`}
                    key={`${message.createdAt}-${index}`}
                  >
                    <span className="record-message-role">
                      {message.role === 'USER' ? '나' : '마음 친구'}
                    </span>
                    <p>{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {detail.summary && (
            <section className="record-detail-section">
              <h2>마음 정리</h2>
              <Card>
                <p>{detail.summary.text}</p>
              </Card>
            </section>
          )}

          <Card className="record-detail-wool">
            <span>오늘 모은 털</span>
            {typeof detail.woolEarned === 'number' && Number.isFinite(detail.woolEarned) && (
              <strong>{detail.woolEarned}올</strong>
            )}
          </Card>

          <section className="record-delete-section">
            {deleteError && <p role="alert" className="ui-error">{deleteError}</p>}
            <Button
              type="button"
              className="record-delete-button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm('이 기록을 삭제할까요?\n삭제한 기록은 복구할 수 없어요.')) {
                  setDeleteError(null)
                  deleteMutation.mutate()
                }
              }}
            >
              {deleteMutation.isPending ? '삭제 중…' : '이 기록 삭제하기'}
            </Button>
          </section>
        </>
      )}

      <BottomNav />
    </Page>
  )
}

export default RecordDetailPage
