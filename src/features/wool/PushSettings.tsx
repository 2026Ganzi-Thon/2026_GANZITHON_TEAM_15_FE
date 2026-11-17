import { useState } from 'react'
import { api, authHeaders, buildUrl } from '../../api/client'
import { Button } from '../../components/ui'

export function PushSettings() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext
  async function enable() {
    setBusy(true); setMessage('')
    try {
      const key = await api.get<{ enabled: boolean; publicKey: string | null }>('/push/vapid-public-key')
      if (!key.enabled || !key.publicKey) { setMessage('지금은 앱 안에서 털 도착을 알려 드려요.'); return }
      if (await Notification.requestPermission() !== 'granted') { setMessage('브라우저 알림 권한이 허용되지 않았어요. 사이트 설정에서 변경할 수 있어요.'); return }
      const registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/push/' })
      if (!registration.active) await new Promise<void>((resolve, reject) => {
        const worker = registration.installing ?? registration.waiting
        if (!worker) { reject(new Error('알림을 준비하지 못했어요.')); return }
        worker.addEventListener('statechange', () => { if (worker.state === 'activated') resolve(); if (worker.state === 'redundant') reject(new Error('알림을 준비하지 못했어요.')) })
      })
      const base64 = key.publicKey.replace(/-/g, '+').replace(/_/g, '/')
      const bytes = Uint8Array.from(atob(base64 + '='.repeat((4 - base64.length % 4) % 4)), c => c.charCodeAt(0))
      const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes })
      const result = await api.post<{ pushEnabled: boolean }>('/push/subscriptions', subscription.toJSON())
      setMessage(result.pushEnabled ? '이 브라우저에서 털 도착 알림을 받아요.' : '구독을 저장했어요. 서버 알림이 켜지면 받아볼 수 있어요.')
    } catch (error) { setMessage(error instanceof Error ? error.message : '알림 설정을 저장하지 못했어요.') }
    finally { setBusy(false) }
  }
  async function disable() {
    setBusy(true); setMessage('')
    try {
      const registration = await navigator.serviceWorker.getRegistration('/push/')
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        const response = await fetch(buildUrl('/push/subscriptions'), { method: 'DELETE', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: subscription.endpoint }) })
        if (!response.ok) throw new Error('알림 해지를 저장하지 못했어요. 다시 시도해 주세요.')
        await subscription.unsubscribe()
      }
      setMessage('이 브라우저의 푸시 알림을 껐어요.')
    } catch (error) { setMessage(error instanceof Error ? error.message : '알림 해지에 실패했어요.') }
    finally { setBusy(false) }
  }
  return <section className="push-settings"><h2>털 도착 알림</h2>{supported ? <div className="row"><Button disabled={busy} onClick={enable}>알림 켜기</Button><button className="text-link" disabled={busy} onClick={disable}>알림 끄기</button></div> : <p className="muted">이 브라우저에서는 앱 안 알림을 이용해 주세요.</p>}{message && <p role="status">{message}</p>}</section>
}
