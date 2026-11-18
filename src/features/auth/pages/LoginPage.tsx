import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { login } from '../../../api/auth'
import type { LoginRequest, LoginResponse } from '../../../api/types'
import './auth.css'

const LOGIN_SUCCESS_PATH = '/'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const redirectPath =
    from &&
    typeof from.pathname === 'string' &&
    from.pathname.startsWith('/') &&
    !from.pathname.startsWith('//')
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : LOGIN_SUCCESS_PATH

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordNotice, setShowPasswordNotice] = useState(false)

  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: () => navigate(redirectPath, { replace: true }),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ email, password })
  }

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : '잠시 후 다시 시도해 주세요.'
    : null

  return (
    <main className="ui-page auth-page">
      <section className="auth-brand">
        <span className="auth-sheep" aria-hidden="true">🐑</span>
        <p className="auth-brand-name">털 한 올</p>
        <p className="auth-brand-copy">마음에 작은 온기를 더하는 곳</p>
      </section>

      <section className="auth-content">
        <div className="auth-heading">
          <h1>다시 만나요!</h1>
          <p>털 한 올에서 기다리고 있었어요.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="auth-forgot">
            <button
              type="button"
              onClick={() => setShowPasswordNotice(true)}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {showPasswordNotice && (
            <p className="auth-notice" role="status">비밀번호 찾기는 준비 중이에요.</p>
          )}

          {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}

          <button className="auth-submit" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="auth-switch">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </section>

      <p className="auth-footer">오늘도 당신의 마음을 응원해요.</p>
    </main>
  )
}

export default LoginPage
