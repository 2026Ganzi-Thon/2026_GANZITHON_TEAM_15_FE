import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sheep } from './Sheep'
import { Button } from './ui'

export function EmptyState({ title, action, to }: { title: string; action?: string; to?: string }) {
  return <div className="empty-state"><Sheep size={180} /><p>{title}</p>{action && to && <Link className="ui-button" to={to}>{action}</Link>}</div>
}
export function QueryState({ pending, error, retry }: { pending: boolean; error: Error | null; retry: () => void }) {
  if (pending) return <p role="status" className="loading">포근한 마음을 불러오는 중…</p>
  if (error) return <div role="alert" className="ui-error"><p>{error.message}</p><Button onClick={retry}>다시 시도</Button></div>
  return null
}
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onClose, 5000); return () => clearTimeout(timer) }, [message, onClose])
  return <div className="toast" role="status">{message}<button aria-label="알림 닫기" onClick={onClose}>×</button></div>
}
export function BottomSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => { const el = ref.current; const before = document.activeElement as HTMLElement | null; el?.showModal(); return () => { el?.close(); before?.focus() } }, [])
  return <dialog className="bottom-sheet" ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }}><section><div className="row"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="닫기" onClick={onClose}>×</button></div>{children}</section></dialog>
}
