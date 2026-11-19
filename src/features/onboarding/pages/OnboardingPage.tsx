import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getToken } from '../../../api/token'
import { Sheep } from '../../../components/Sheep'
import { Button, Page } from '../../../components/ui'
import '../onboarding.css'

const SLIDES = [
  ['마음을 이야기하면', '털 한 올이 쌓여요'],
  ['고민은 목장에 올려요', '양이 되어 닿아요'],
  ['다른 목동의 한마디가', '털이 돼요'],
] as const

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [slideIndex, setSlideIndex] = useState(0)

  if (getToken()) return <Navigate to="/" replace />

  const finishOnboarding = () => {
    navigate('/login', { replace: true })
  }

  const isLastSlide = slideIndex === SLIDES.length - 1

  return (
    <Page className="onboarding-page">
      <p className="onboarding-brand">털 한 올</p>
      <div className="onboarding-illustration">
        <Sheep size={200} />
      </div>
      <div className="onboarding-copy" aria-live="polite">
        <h1>
          <span>{SLIDES[slideIndex][0]}</span>
          <span>{SLIDES[slideIndex][1]}</span>
        </h1>
      </div>
      <div className="onboarding-progress" aria-label={`${slideIndex + 1} / ${SLIDES.length}`}>
        {SLIDES.map((_, index) => (
          <span className={index === slideIndex ? 'active' : ''} key={index} />
        ))}
      </div>
      <div className="onboarding-actions">
        {isLastSlide ? (
          <Button type="button" onClick={finishOnboarding}>시작하기</Button>
        ) : (
          <>
            <Button type="button" onClick={() => setSlideIndex(index => index + 1)}>다음</Button>
            <button className="onboarding-skip" type="button" onClick={finishOnboarding}>건너뛰기</button>
          </>
        )}
      </div>
    </Page>
  )
}
