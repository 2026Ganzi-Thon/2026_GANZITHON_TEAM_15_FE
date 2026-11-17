import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import './ui.css'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`ui-button ${props.className ?? ''}`} />
}
export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ui-card ${props.className ?? ''}`} />
}
export function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="ui-header"><button type="button" aria-label="뒤로 가기" onClick={onBack}><img src="/assets/figma/back.svg" alt="" width="24" height="24" /></button><h1>{title}</h1></header>
}
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`ui-page ${className}`}>{children}</main>
}

export function Chip({ selected, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button {...props} type="button" aria-pressed={selected} className={`chip ${selected ? 'selected' : ''} ${props.className ?? ''}`} />
}
