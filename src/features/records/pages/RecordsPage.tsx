import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { recordsApi, type DiaryDay } from '../../../api/records'
import { QueryState } from '../../../components/feedback'
import { BackHeader, BottomNav } from '../../../components/navigation'
import { Card, Page } from '../../../components/ui'
import './records.css'

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

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function getMonthString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function moveMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split('-').map(Number)
  return getMonthString(new Date(year, monthNumber - 1 + amount, 1))
}

function RecordsPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => getMonthString(new Date()))

  const monthQuery = useQuery({
    queryKey: ['records', month],
    queryFn: ({ signal }) => recordsApi.getMonth(month, signal),
  })

  const summaryQuery = useQuery({
    queryKey: ['records-summary', month],
    queryFn: ({ signal }) => recordsApi.getSummary(month, signal),
  })

  const [year, monthNumber] = month.split('-').map(Number)
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay()
  const lastDate = new Date(year, monthNumber, 0).getDate()
  const days = monthQuery.data?.days ?? []
  const dayMap = new Map(days.map((day: DiaryDay) => [day.date.slice(0, 10), day]))
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ]

  return (
    <Page className="records-page">
      <BackHeader title="마음 기록" fallback="/" />

      <section className="records-month">
        <button
          type="button"
          className="records-month-arrow"
          aria-label="이전 달"
          onClick={() => setMonth((value) => moveMonth(value, -1))}
        >
          ‹
        </button>
        <h2>{year}년 {monthNumber}월</h2>
        <button
          type="button"
          className="records-month-arrow"
          aria-label="다음 달"
          disabled={month >= getMonthString(new Date())}
          onClick={() => setMonth((value) => moveMonth(value, 1))}
        >
          ›
        </button>
      </section>

      <QueryState
        pending={monthQuery.isPending}
        error={monthQuery.error}
        retry={() => { void monthQuery.refetch() }}
      />

      {monthQuery.data && (
        <>
          <Card className="records-calendar">
            <div className="records-weekdays">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <div className="records-calendar-grid">
              {calendarCells.map((date, index) => {
                if (date === null) {
                  return <span className="records-calendar-empty" key={`empty-${index}`} />
                }

                const key = `${month}-${String(date).padStart(2, '0')}`
                const diary = dayMap.get(key)

                return (
                  <button
                    type="button"
                    key={key}
                    className={`records-day ${diary ? 'has-record' : ''}`}
                    disabled={!diary}
                    aria-label={diary ? `${date}일, ${diary.emotionLabel} 기록 보기` : `${date}일`}
                    onClick={() => diary && navigate(`/records/${diary.diaryId}`)}
                  >
                    <span>{date}</span>
                    {diary && <span className="records-emotion">{EMOTION_SYMBOLS[diary.emotion] ?? '🐑'}</span>}
                  </button>
                )
              })}
            </div>
          </Card>

          <section className="records-summary-section">
            <h2>이번 달 돌아보기</h2>
            {summaryQuery.isPending ? (
              <p className="muted">이번 달을 돌아보는 중이에요.</p>
            ) : summaryQuery.error ? (
              <p className="muted">월별 돌아보기를 불러오지 못했어요.</p>
            ) : summaryQuery.data ? (
              <Card>
                <p>이번 달 털 <strong>{summaryQuery.data.woolCount}올</strong>을 모았어요</p>
                {summaryQuery.data.sentence && <p className="records-summary-sentence">{summaryQuery.data.sentence}</p>}
                {!summaryQuery.data.sentence && <p className="muted">기록이 조금 더 쌓이면 이달의 문장을 만날 수 있어요.</p>}
              </Card>
            ) : null}
          </section>

          <section className="records-list-section">
            <h2>날짜별 기록</h2>
            {days.length === 0 ? (
              <Card className="records-empty">
                <p>아직 이 달의 기록이 없어요.</p>
                <p className="muted">오늘의 마음을 기록해 보세요.</p>
              </Card>
            ) : (
              [...days]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((day) => (
                  <button
                    type="button"
                    className="records-list-item"
                    key={day.diaryId}
                    onClick={() => navigate(`/records/${day.diaryId}`)}
                  >
                    <span className="records-list-emotion">{EMOTION_SYMBOLS[day.emotion] ?? '🐑'}</span>
                    <span className="records-list-copy">
                      <strong>{day.date.slice(5).replace('-', '.')}</strong>
                      <small>{day.emotionLabel}</small>
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))
            )}
          </section>
        </>
      )}

      <BottomNav />
    </Page>
  )
}

export default RecordsPage
