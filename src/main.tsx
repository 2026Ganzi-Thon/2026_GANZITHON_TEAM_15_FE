import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import './components/ui.css'
import './styles/app.css'
import { router } from './router'

// 기본 옵션(재시도, 에러 토스트)은 팀 확인 후 설정 예정
const queryClient = new QueryClient()

function renderApp(): void {
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </QueryClientProvider>,
  )
}

if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mocks/browser').then(({ worker }) => worker.start({ quiet: true })).then(renderApp)
} else {
  renderApp()
}
