import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { checkNickname, signup } from '../../../api/auth'
import { ERROR_CODES } from '../../../api/types'
import type { SignupRequest, SignupResponse } from '../../../api/types'
import './auth.css'

const SIGNUP_SUCCESS_PATH = '/'

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const redirectPath =
    from &&
    typeof from.pathname === 'string' &&
    from.pathname.startsWith('/') &&
    !from.pathname.startsWith('//')
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : SIGNUP_SUCCESS_PATH

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState<{ nickname: string; message: string } | null>(null)

  const mutation = useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
    onSuccess: () => navigate(redirectPath, { replace: true }),
  })

  useEffect(() => {
    const candidate = nickname.trim()
    if (candidate.length < 2) return

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void checkNickname(candidate, controller.signal)
        .then(result => {
          if (!controller.signal.aborted) {
            setAvailabilityMessage(
              !result.available && result.message
                ? { nickname: candidate, message: result.message }
                : null,
            )
          }
        })
        .catch(() => {
          // 참고용 확인 실패는 조용히 무시하고 가입 제출을 허용합니다.
        })
    }, 500)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [nickname])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ nickname: nickname.trim(), email, password, agreed })
  }

  const apiError = mutation.isError && mutation.error instanceof ApiError
    ? mutation.error
    : null

  const nicknameError = apiError?.code === ERROR_CODES.ACCOUNT_NICKNAME_UNAVAILABLE
    ? apiError.message
    : null
  const currentAvailabilityMessage = availabilityMessage?.nickname === nickname.trim()
    ? availabilityMessage.message
    : null

  const formError = mutation.isError
    ? apiError && apiError.code !== ERROR_CODES.ACCOUNT_NICKNAME_UNAVAILABLE
      ? apiError.message
      : apiError
        ? null
        : '잠시 후 다시 시도해 주세요.'
    : null

  return (
    <main className="ui-page auth-page auth-signup-page">
      <section className="auth-brand auth-brand-compact">
        <span className="auth-sheep" aria-hidden="true">🐑</span>
        <p className="auth-brand-name">털 한 올</p>
      </section>

      <section className="auth-content">
        <div className="auth-heading">
          <h1>처음 오셨나요?</h1>
          <p>나만의 양과 함께 마음을 돌봐요.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value)
                setAvailabilityMessage(null)
                mutation.reset()
              }}
              placeholder="사용할 닉네임을 입력해 주세요"
              minLength={2}
              maxLength={10}
              autoComplete="nickname"
              required
            />
          </label>

          <div className="auth-nickname-meta">
            <span>목장에서는 이 이름만 보여요. 실명은 쓰지 마세요.</span>
            <span className="auth-counter">{nickname.length} / 10</span>
          </div>

          {(nicknameError || currentAvailabilityMessage) && (
            <p className="auth-error" role="alert">{nicknameError ?? currentAvailabilityMessage}</p>
          )}

          <label className="auth-field">
            <span>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해 주세요"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상 입력해 주세요"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="auth-agreement">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              required
            />
            <span>이용약관과 “AI 케어는 전문 상담을 대신하지 않아요”에 동의해요.</span>
          </label>

          {formError && <p className="auth-error" role="alert">{formError}</p>}

          <button className="auth-submit" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '가입 중...' : '내 양 만나기'}
          </button>
        </form>

        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </section>

      <p className="auth-footer">당신의 마음을 위한 작은 목장이 열렸어요.</p>
    </main>
  )
}

export default SignupPage
