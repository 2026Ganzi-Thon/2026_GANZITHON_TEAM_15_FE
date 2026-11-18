import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { startCare } from '../../../api/care'
import { ApiError } from '../../../api/client'
import type { StartCareRequest } from '../../../api/types'
import { Toast } from '../../../components/feedback'
import { BackHeader } from '../../../components/navigation'
import { Sheep } from '../../../components/Sheep'
import { Button, Page } from '../../../components/ui'
import '../care.css'

const EMOTION_LABELS = {
  JOY: '기쁨',
  CALM: '평온',
  TIRED: '지침',
  ANXIOUS: '불안',
  DEPRESSED: '우울',
  LONELY: '외로움',
  ANGRY: '화남',
  COMPLICATED: '복잡함',
} as const

// HomePage의 감정 라벨과 중복 정의하는 것은 의도적입니다.
const CARE_OPTIONS: { label: string; careType: string }[] = [
  { label: '이야기 들어주기', careType: 'LISTEN' },
  { label: '위로받기', careType: 'COMFORT' },
  { label: '생각 정리하기', careType: 'ORGANIZE' },
  { label: '해결 방법 찾기', careType: 'SOLVE' },
]

// Swagger 예시에서 COMFORT와 LISTEN을 확인했으며 네 값은 API 명세와 ERD 기준입니다.
type CareLocationState = { emotion: keyof typeof EMOTION_LABELS; firstMessage: string }

function isCareLocationState(value: unknown): value is CareLocationState {
  if (typeof value !== 'object' || value === null) return false
  if (!('emotion' in value) || !('firstMessage' in value)) return false
  return typeof value.emotion === 'string'
    && value.emotion in EMOTION_LABELS
    && typeof value.firstMessage === 'string'
}

export default function CareSelectPage() {
  const { diaryId: diaryIdParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state: unknown = location.state
  const diaryId = Number(diaryIdParam)
  const validDiaryId = diaryIdParam !== undefined && /^\d+$/.test(diaryIdParam) && Number.isSafeInteger(diaryId)
  const mutation = useMutation({
    mutationFn: (body: StartCareRequest) => startCare(diaryId, body),
    onSuccess: data => {
      if (!isCareLocationState(state)) return
      navigate(`/care/${diaryId}/chat`, {
        state: { emotion: state.emotion, careType: data.careType, message: data.message },
      })
    },
  })

  if (!validDiaryId || !isCareLocationState(state)) return <Navigate to="/" replace />

  const errorMessage = mutation.error instanceof ApiError
    ? mutation.error.message
    : '잠시 후 다시 시도해 주세요.'

  return (
    <Page className="care-select-page">
      <BackHeader title="오늘의 케어" fallback="/" />
      <div className="care-progress" role="progressbar" aria-label="케어 진행 단계" aria-valuemin={1} aria-valuemax={3} aria-valuenow={2}>
        <span className="care-progress-track"><span /></span>
        <span>2단계 · 돌봄 방식 선택</span>
      </div>
      <section className="care-conversation" aria-label="오늘의 마음 대화">
        <div className="care-user-message" aria-label="선택한 오늘의 마음">
          <span>{EMOTION_LABELS[state.emotion]} · 오늘 마음이에요</span>
        </div>
        <div className="care-sheep-message">
          <Sheep size={64} />
          <p className="care-bubble care-bubble-sheep">{state.firstMessage}</p>
        </div>
      </section>
      <section className="care-choice">
        <div className="care-choice-grid">
          {CARE_OPTIONS.map(option => (
            <Button
              key={option.careType}
              className="care-choice-button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ careType: option.careType })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>
      <form className="care-input-area" onSubmit={event => event.preventDefault()}>
        <input aria-label="자유롭게 하고 싶은 말" placeholder="하고 싶은 말을 적어보세요" />
        <Button type="submit" disabled aria-label="자유 입력 전송 기능 미구현">전송</Button>
      </form>
      {mutation.isError && <Toast message={errorMessage} onClose={() => mutation.reset()} />}
    </Page>
  )
}
