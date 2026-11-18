import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { completeCare, sendCareMessage } from '../../../api/care'
import { ApiError } from '../../../api/client'
import type { CompleteCareResponse } from '../../../api/types'
import type { SseEventMap, SseEventName } from '../../../api/sse'
import { Sheep } from '../../../components/Sheep'
import { BackHeader } from '../../../components/navigation'
import { Button, Page } from '../../../components/ui'
import '../care-chat.css'

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

const CARE_MODES = {
  COMFORT: {
    label: '위로받기',
    greeting: '오늘 하루는 어땠어요? 편하게 들려줘요.',
    placeholder: '더 이야기해도 좋아요',
  },
  LISTEN: {
    label: '이야기 들어주기',
    greeting: '오늘은 제가 들을게요. 어떤 일이 있었어요?',
    placeholder: '편하게 말해요',
  },
  ORGANIZE: {
    label: '생각 정리하기',
    greeting: '마음에 걸리는 걸 하나만 골라볼까요?',
    placeholder: '생각을 적어요',
  },
  SOLVE: {
    label: '해결 방법 찾기',
    greeting: '지금 가장 풀고 싶은 게 뭐예요?',
    placeholder: '해 볼 만한 걸 골라요',
  },
} as const

type CareType = keyof typeof CARE_MODES
type ChatLocationState = {
  emotion: keyof typeof EMOTION_LABELS | null
  careType: CareType
  message: string
}
type ChatMessage = { id: number; role: 'user' | 'assistant'; content: string }
type ChatError = { code: string | null; message: string }
type ProgressState = { userMessageCount: number; ready: boolean; maxUserMessages: number; limitReached: boolean }
type CrisisState = SseEventMap['crisis']

function getChatLocationState(value: unknown): ChatLocationState | null {
  if (value === null || value === undefined) {
    return { emotion: null, careType: 'LISTEN', message: CARE_MODES.LISTEN.greeting }
  }
  if (typeof value !== 'object') return null

  const emotion = 'emotion' in value ? value.emotion : null
  if (emotion !== null && (typeof emotion !== 'string' || !(emotion in EMOTION_LABELS))) return null

  const careType = 'careType' in value ? value.careType : 'LISTEN'
  if (typeof careType !== 'string' || !(careType in CARE_MODES)) return null

  const message = 'message' in value ? value.message : CARE_MODES[careType as CareType].greeting
  if (typeof message !== 'string') return null

  return {
    emotion: emotion as keyof typeof EMOTION_LABELS | null,
    careType: careType as CareType,
    message,
  }
}

export default function CareChatPage() {
  const { diaryId: diaryIdParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const routeState: unknown = location.state
  const diaryId = Number(diaryIdParam)
  const validDiaryId = diaryIdParam !== undefined && /^\d+$/.test(diaryIdParam) && Number.isSafeInteger(diaryId)
  const state = getChatLocationState(routeState)
  const mode = state ? CARE_MODES[state.careType] : null
  const nextMessageId = useRef(2)
  const controller = useRef<AbortController | null>(null)
  const completionLock = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialState = getChatLocationState(routeState)
    if (!initialState) return []
    const greeting = CARE_MODES[initialState.careType].greeting
    if (!initialState.message || initialState.message === greeting) {
      return [{ id: 0, role: 'assistant', content: greeting }]
    }
    return [
      { id: 0, role: 'assistant', content: initialState.message },
      { id: 1, role: 'assistant', content: greeting },
    ]
  })
  const [progress, setProgress] = useState<ProgressState>({
    userMessageCount: 0,
    ready: false,
    maxUserMessages: 10,
    limitReached: false,
  })
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [awaitingResponse, setAwaitingResponse] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)
  const [crisis, setCrisis] = useState<CrisisState | null>(null)
  const completionMutation = useMutation<CompleteCareResponse, Error>({
    mutationFn: () => completeCare(diaryId),
    onSuccess: completion => navigate(`/care/${diaryId}/complete`, { state: { completion } }),
    onError: () => { completionLock.current = false },
  })

  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [messages, isSending, error, noticeMessage, crisis])

  if (!validDiaryId || !state || !mode) return <Navigate to="/" replace />

  const updateAssistantMessage = (id: number, content: string, replace = false) => {
    setMessages(current => {
      const index = current.findIndex(message => message.id === id)
      if (index === -1) return [...current, { id, role: 'assistant', content }]
      return current.map(message => message.id === id
        ? { ...message, content: replace ? content : message.content + content }
        : message)
    })
  }

  const handleEvent = <K extends SseEventName>(name: K, data: SseEventMap[K], responseId: number) => {
    switch (name) {
      case 'progress':
        setProgress(data as SseEventMap['progress'])
        break
      case 'delta':
        setAwaitingResponse(false)
        updateAssistantMessage(responseId, (data as SseEventMap['delta']).text)
        break
      case 'crisis':
        setAwaitingResponse(false)
        setCrisis(data as SseEventMap['crisis'])
        break
      case 'notice':
        setNoticeMessage((data as SseEventMap['notice']).message)
        break
      case 'reset':
        setAwaitingResponse(true)
        updateAssistantMessage(responseId, '', true)
        break
      case 'replace':
        setAwaitingResponse(false)
        updateAssistantMessage(responseId, (data as SseEventMap['replace']).text, true)
        break
      case 'error':
        setAwaitingResponse(false)
        setError({
          code: (data as SseEventMap['error']).code,
          message: (data as SseEventMap['error']).message,
        })
        break
      case 'done':
        setAwaitingResponse(false)
        break
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = inputRef.current?.value.trim() ?? ''
    if (!content || isSending || progress.limitReached) return

    const responseId = nextMessageId.current++
    const userMessageId = nextMessageId.current++
    const requestController = new AbortController()
    controller.current = requestController
    setMessages(current => [...current,
      { id: userMessageId, role: 'user', content },
      { id: responseId, role: 'assistant', content: '' },
    ])
    setError(null)
    setNoticeMessage(null)
    setAwaitingResponse(true)
    setIsSending(true)
    if (inputRef.current) inputRef.current.value = ''

    try {
      await sendCareMessage(diaryId, { content }, {
        signal: requestController.signal,
        onEvent: (name, data) => handleEvent(name, data, responseId),
        onHttpError: requestError => {
          setAwaitingResponse(false)
          setError({ code: requestError.code, message: requestError.message })
        },
        onNetworkError: networkError => {
          setAwaitingResponse(false)
          setError({
            code: networkError instanceof ApiError ? networkError.code : null,
            message: networkError.message || '네트워크 연결을 확인해 주세요.',
          })
        },
      })
    } finally {
      if (!requestController.signal.aborted) {
        setIsSending(false)
        setAwaitingResponse(false)
      }
      if (controller.current === requestController) controller.current = null
    }
  }

  const handleContinue = () => setCrisis(null)
  const canComplete = progress.ready && progress.userMessageCount >= 3

  const handleComplete = () => {
    if (!canComplete || isSending || completionMutation.isPending || completionLock.current) return
    completionLock.current = true
    completionMutation.mutate()
  }

  return (
    <Page className="care-chat-page">
      <BackHeader title="오늘의 케어" fallback={`/care/${diaryId}`} />
      <header className="care-chat-context">
        <span>{mode.label}</span>
        {state.emotion && <span>{EMOTION_LABELS[state.emotion]} 마음</span>}
      </header>
      <section className="care-chat-progress" aria-label="대화 진행 상황">
        <div className="care-chat-progress-copy">
          <span>대화 {progress.userMessageCount} / {progress.maxUserMessages}</span>
          {progress.ready && <span className="care-ready-label">정리할 준비가 되었어요</span>}
          {progress.limitReached && <span className="care-limit-label">대화 횟수 한도에 도달했어요</span>}
        </div>
        <div className="care-chat-progress-track" role="progressbar" aria-label="메시지 횟수" aria-valuemin={0} aria-valuemax={progress.maxUserMessages} aria-valuenow={Math.min(progress.userMessageCount, progress.maxUserMessages)}>
          <span style={{ width: `${Math.min(progress.userMessageCount / progress.maxUserMessages, 1) * 100}%` }} />
        </div>
      </section>
      <div className="care-chat-messages" ref={conversationRef} aria-live="polite">
        {messages.map(message => (
          (!message.content && !awaitingResponse) ? null : <div className={`care-chat-message care-chat-message-${message.role}`} key={message.id}>
            {message.role === 'assistant' && <Sheep size={42} />}
            <p>{message.content || (awaitingResponse && message.role === 'assistant' ? <span className="care-streaming-indicator">답변을 생각하고 있어요…</span> : null)}</p>
          </div>
        ))}
        {noticeMessage && <p className="care-chat-notice" role="status">{noticeMessage}</p>}
        {crisis && (
          <aside className="care-crisis-notice" role="alert">
            <p>{crisis.message}</p>
            <div>
              {crisis.actions.includes('call') && (
                <Link to="/help/crisis" state={{ returnTo: location.pathname + location.search }}>도움받을 곳 보기</Link>
              )}
              {crisis.actions.includes('continue') && (
                <Button type="button" onClick={handleContinue}>대화 계속하기</Button>
              )}
            </div>
          </aside>
        )}
        {error && <p className="care-chat-error" role="alert" data-error-code={error.code ?? undefined}>{error.message}</p>}
      </div>
      <form className="care-chat-composer" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          aria-label="메시지 입력"
          placeholder={mode.placeholder}
          rows={1}
          disabled={isSending || progress.limitReached}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <Button type="submit" disabled={isSending || progress.limitReached}>전송</Button>
      </form>
      <section className="care-chat-finish">
        {!canComplete && <p>대화를 3회 나누면 마무리할 수 있어요.</p>}
        <Button type="button" disabled={!canComplete || isSending || completionMutation.isPending} onClick={handleComplete}>
          {completionMutation.isPending ? '마무리하는 중…' : '털 한 올 쌓고 마무리하기'}
        </Button>
        {completionMutation.error && (
          <p className="care-chat-error" role="alert">
            {completionMutation.error instanceof ApiError
              ? completionMutation.error.message
              : '잠시 후 다시 시도해 주세요.'}
          </p>
        )}
      </section>
    </Page>
  )
}
