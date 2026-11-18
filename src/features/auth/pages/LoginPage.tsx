import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { login } from '../../../api/auth'
import type { LoginRequest, LoginResponse } from '../../../api/types'

// 경로 팀 확정 전 제안
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
  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: () => {
      navigate(redirectPath, { replace: true })
    },
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
    <main>
      <h1>털 한 올</h1>
      <form onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {/* 비밀번호 찾기는 명세에 대응 API 없음, 가입 화면은 #6에서 연결 */}
        <p>비밀번호를 잊었어요</p>
        <button type="submit" disabled={mutation.isPending}>
          로그인
        </button>
        {errorMessage && <p role="alert">{errorMessage}</p>}
      </form>
      <p>
        계정이 없어요 <Link to="/signup">가입하기</Link>
      </p>
    </main>
  )
}

export default LoginPage
