import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { streamSse } from '../../api/sse'
import { getToken } from '../../api/token'

export function NotificationListener() {
  const client = useQueryClient()
  const [notice, setNotice] = useState<{ title: string; body: string; sheepId?: number } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false
    let attempt = 0
    async function connect() {
      if (stopped || (!getToken() && import.meta.env.VITE_USE_MOCK !== 'true')) return
      await streamSse('/notifications/stream', { method: 'GET', signal: controller.signal, requireTerminalEvent: false, onHttpError: error => { if (error.status === 401 || error.status === 403) stopped = true }, onUnknownEvent: (name, data) => {
        if (!['wool-arrived','wool-thanked'].includes(name) || typeof data !== 'object' || !data) return
        const event = data as Record<string, unknown>
        if (typeof event.title !== 'string' || typeof event.body !== 'string') return
        setNotice({ title: event.title, body: event.body, sheepId: name === 'wool-arrived' && typeof event.sheepId === 'number' ? event.sheepId : undefined })
        attempt = 0
        void client.invalidateQueries({ queryKey: ['my-worries'] })
        void client.invalidateQueries({ queryKey: ['worry'] })
      } })
      if (!stopped) timer = setTimeout(connect, Math.min(30000, 2000 * 2 ** attempt++))
    }
    void connect()
    return () => { stopped = true; controller.abort(); clearTimeout(timer) }
  }, [client])
  if (!notice) return null
  return <aside className="toast" role="status"><div><strong>{notice.title}</strong><p>{notice.body}</p>{notice.sheepId && <Link to={`/worries/${notice.sheepId}`} onClick={() => setNotice(null)}>받은 털 보기</Link>}</div><button aria-label="알림 닫기" onClick={() => setNotice(null)}>×</button></aside>
}
