const ONBOARDING_SEEN_KEY = 'onboardingSeen'

export function hasSeenOnboarding(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

export function markOnboardingSeen(): void {
  try {
    window.localStorage.setItem(ONBOARDING_SEEN_KEY, 'true')
  } catch {
    // 저장할 수 없는 환경에서도 로그인으로 진행합니다.
  }
}
