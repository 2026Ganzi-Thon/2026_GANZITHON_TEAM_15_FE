// 인증 토큰 저장소 (API 명세: accessToken JWT 24시간, Bearer 헤더로 전송, 리프레시 토큰 없음)
// 저장 위치(localStorage)는 팀 확정이 아닌 제안값입니다. 바꾸려면 이 파일만 수정하세요.

const TOKEN_KEY = 'accessToken'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // 저장 실패(사생활 보호 모드 등)는 무시: 새로고침 시 다시 로그인하게 됨
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // 무시
  }
}