import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { signup } from '../../../api/auth'
import { ERROR_CODES } from '../../../api/types'
import type { SignupRequest, SignupResponse } from '../../../api/types'

// 경로 팀 확정 전 제안
const SIGNUP_SUCCESS_PATH = '/'

function SignupPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const mutation = useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
    onSuccess: () => {
      navigate(SIGNUP_SUCCESS_PATH)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ nickname, email, password, agreed })
  }

  const apiError = mutation.isError && mutation.error instanceof ApiError
    ? mutation.error
    : null
  const nicknameError = apiError?.code === ERROR_CODES.ACCOUNT_NICKNAME_UNAVAILABLE
    ? apiError.message
    : null
  const formError = mutation.isError
    ? apiError && apiError.code !== ERROR_CODES.ACCOUNT_NICKNAME_UNAVAILABLE
      ? apiError.message
      : apiError
        ? null
        : '잠시 후 다시 시도해 주세요.'
    : null

  return (
    <main>
      <h1>가입하기</h1>
      <form onSubmit={handleSubmit}>
        <label>
          닉네임
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={10}
            required
          />
        </label>
        <p>{nickname.length} / 10</p>
        <p>목장에서는 이 이름만 보여요. 실명은 쓰지 마세요.</p>
        {nicknameError && <p role="alert">{nicknameError}</p>}
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
        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            required
          />
          이용약관과 “AI 케어는 전문 상담을 대신하지 않아요”에 동의해요
        </label>
        <button type="submit" disabled={mutation.isPending}>
          내 양 만나기
        </button>
        {formError && <p role="alert">{formError}</p>}
      </form>
      <p>
        이미 계정이 있어요 <Link to="/login">로그인</Link>
      </p>
    </main>
  )
}

export default SignupPage
