import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { createDiary, getMe, getMySheep } from '../../../api/home'
import type { CreateDiaryRequest, CreateDiaryResponse, MeResponse, MySheepResponse } from '../../../api/types'
import { BottomNav } from '../../../components/navigation'
import { QueryState, Toast } from '../../../components/feedback'
import { Page } from '../../../components/ui'
import { Sheep } from '../../../components/Sheep'
import { CrisisBanner } from '../../safety/CrisisBanner'
import '../home.css'

// Swagger는 TIRED 예시만 확인. 값 목록은 Notion API 명세·ERD 기준.
const EMOTIONS = [
  { label: '기쁨', value: 'JOY' },
  { label: '평온', value: 'CALM' },
  { label: '지침', value: 'TIRED' },
  { label: '불안', value: 'ANXIOUS' },
  { label: '우울', value: 'DEPRESSED' },
  { label: '외로움', value: 'LONELY' },
  { label: '화남', value: 'ANGRY' },
  { label: '복잡함', value: 'COMPLICATED' },
] as const

// 경로 팀 확정 전 제안
const CARE_PATH = '/care/'
// 경로 팀 확정 전 제안
const RECORDS_PATH = '/records'

function HomePage() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const sheepQuery = useQuery<MySheepResponse, Error>({
    queryKey: ['my-sheep'],
    queryFn: () => getMySheep(),
  })
  const meQuery = useQuery<MeResponse, Error>({
    queryKey: ['me'],
    queryFn: () => getMe(),
  })
  const diaryMutation = useMutation<CreateDiaryResponse, Error, CreateDiaryRequest>({
    mutationFn: createDiary,
    onSuccess: (data, variables) => {
      navigate(`${CARE_PATH}${data.diaryId}`, {
        state: { emotion: variables.emotion, firstMessage: data.firstMessage },
      })
    },
    onError: (error) => {
      setToastMessage(error instanceof ApiError ? error.message : '잠시 후 다시 시도해 주세요.')
    },
  })

  const queryError = sheepQuery.error ?? meQuery.error
  const queryPending = sheepQuery.isPending || meQuery.isPending

  return (
    <Page className="home-page">
      <header className="home-header">
        <p>{meQuery.data?.nickname}</p>
        <Link className="home-records-link" to={RECORDS_PATH} aria-label="기록 보기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" />
          </svg>
        </Link>
      </header>
      <CrisisBanner />
      <QueryState
        pending={queryPending}
        error={queryError}
        retry={() => {
          void sheepQuery.refetch()
          void meQuery.refetch()
        }}
      />
      {sheepQuery.data && meQuery.data && (
        <>
          <section className="home-sheep">
            <Sheep stage={sheepQuery.data.stage} size={180} />
            <p>{sheepQuery.data.stageName} · {sheepQuery.data.stage}단계</p>
          </section>
          <section className="home-emotion-section" aria-labelledby="home-emotion-title">
            <h1 id="home-emotion-title">오늘 마음은 어때요?</h1>
            <div className="home-emotions">
              {EMOTIONS.map(({ label, value }) => (
                <button
                  className="home-emotion-button"
                  key={value}
                  type="button"
                  disabled={diaryMutation.isPending}
                  onClick={() => diaryMutation.mutate({ emotion: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      <BottomNav />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </Page>
  )
}

export default HomePage
