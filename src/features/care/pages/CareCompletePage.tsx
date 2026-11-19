import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { completeCare } from '../../../api/care'
import { getMySheep } from '../../../api/home'
import type { CompleteCareResponse } from '../../../api/types'
import { QueryState } from '../../../components/feedback'
import { FarmInvitation, BackHeader } from '../../../components/navigation'
import { Sheep } from '../../../components/Sheep'
import { Page } from '../../../components/ui'
import { CrisisBanner } from '../../safety/CrisisBanner'
import '../care-complete.css'

const SUMMARY_TITLES: Record<string, string> = {
  LISTEN: '털어놓은 마음',
  COMFORT: '오늘 받은 위로의 말',
  ORGANIZE: '정리된 생각 세 줄',
  SOLVE: '해볼 행동',
}

function getCompletionFromRouteState(value: unknown): CompleteCareResponse | null {
  if (typeof value !== 'object' || value === null || !('completion' in value)) return null
  const completion = value.completion
  if (typeof completion !== 'object' || completion === null) return null
  if (!('summary' in completion) || !('wool' in completion)) return null

  const summary = completion.summary
  const wool = completion.wool
  if (typeof summary !== 'object' || summary === null || typeof wool !== 'object' || wool === null) return null
  if (!('careType' in summary) || !('text' in summary) || !('added' in wool) || !('total' in wool) || !('stage' in wool) || !('stageUp' in wool)) return null
  if (
    typeof summary.careType !== 'string' || typeof summary.text !== 'string' ||
    typeof wool.added !== 'number' || typeof wool.total !== 'number' ||
    typeof wool.stage !== 'number' || typeof wool.stageUp !== 'boolean'
  ) return null

  return completion as CompleteCareResponse
}

export default function CareCompletePage() {
  const { diaryId: diaryIdParam } = useParams()
  const location = useLocation()
  const diaryId = Number(diaryIdParam)
  const validDiaryId = diaryIdParam !== undefined && /^\d+$/.test(diaryIdParam) && Number.isSafeInteger(diaryId) && diaryId > 0
  const routeCompletion = getCompletionFromRouteState(location.state)
  const completionQuery = useQuery({
    queryKey: ['care-completion', diaryId],
    queryFn: () => completeCare(diaryId),
    enabled: validDiaryId && routeCompletion === null,
    retry: false,
    refetchOnMount: 'always',
  })
  const completion = routeCompletion ?? (!completionQuery.isFetching && completionQuery.isSuccess ? completionQuery.data : null)
  const sheepQuery = useQuery({
    queryKey: ['my-sheep', 'care-complete', diaryId],
    queryFn: getMySheep,
    enabled: validDiaryId && completion !== null,
    retry: false,
  })

  if (!validDiaryId) return <Navigate to="/" replace />

  if (!completion) {
    return (
      <Page className="care-complete-page">
        <BackHeader title="마무리" fallback={`/care/${diaryId}/chat`} />
        <QueryState
          pending={completionQuery.isPending || completionQuery.isFetching}
          error={completionQuery.error}
          retry={() => { void completionQuery.refetch() }}
        />
        <Link className="text-link" to="/">내 우리로 돌아가기</Link>
      </Page>
    )
  }

  const sheepStage = sheepQuery.data?.stage ?? completion.wool.stage
  const summaryText = completion.summary.text.trim()
  const summaryTitle = SUMMARY_TITLES[completion.summary.careType]

  return (
    <Page className="care-complete-page">
      <BackHeader title="오늘의 케어" fallback="/" />
      <CrisisBanner />
      <section className="care-complete-hero">
        <h1>털 한 올이 쌓였어요</h1>
        <div className="care-complete-sheep">
          <Sheep stage={sheepStage} size={176} added={completion.wool.added} />
        </div>
        {sheepQuery.data
          ? <p className="care-complete-stage">{sheepQuery.data.stageName} · {sheepStage}단계</p>
          : <p className="care-complete-stage">양 {sheepStage}단계</p>}
        {completion.wool.stageUp && <p className="care-stage-up">양이 한 단계 자랐어요</p>}
      </section>

      <section className="care-wool-result" aria-label="털 적립 결과">
        {completion.wool.added > 0
          ? <p>이번 대화로 털 {completion.wool.added}개가 쌓였어요.</p>
          : <p>이번에는 털이 추가되지 않았어요.</p>}
        <p>누적 털 {completion.wool.total}개</p>
        {sheepQuery.data && <p>다음 단계까지 털 {sheepQuery.data.woolToNextStage}개</p>}
        <QueryState
          pending={sheepQuery.isPending}
          error={sheepQuery.error}
          retry={() => { void sheepQuery.refetch() }}
        />
      </section>

      <section className="care-summary-card">
        {summaryTitle && <h2>{summaryTitle}</h2>}
        {summaryText
          ? <p>{completion.summary.text}</p>
          : <p className="care-summary-empty">오늘 받은 위로의 말이 없어요.</p>}
      </section>

      <div className="care-complete-actions">
        <FarmInvitation diaryId={diaryId} />
        <Link className="care-home-link" to="/">내 우리로 돌아가기</Link>
      </div>
    </Page>
  )
}
