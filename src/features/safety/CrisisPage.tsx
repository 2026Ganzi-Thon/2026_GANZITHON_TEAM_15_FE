import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { safetyApi } from '../../api/safety'
import { Page } from '../../components/ui'
import { BackHeader } from '../../components/navigation'
import { QueryState } from '../../components/feedback'

export default function CrisisPage() {
  const location = useLocation()
  const returnTo = typeof location.state?.returnTo === 'string' && /^\/(?!\/)/.test(location.state.returnTo) ? location.state.returnTo : '/farm'
  const query = useQuery({ queryKey: ['crisis-help'], queryFn: ({ signal }) => safetyApi.help(signal), retry: 1 })
  const help = query.data
  return <Page className="crisis-page"><BackHeader title="도움받을 곳" fallback={returnTo} /><QueryState pending={query.isPending} error={query.error} retry={() => query.refetch()} />{help && <><h2>{help.title}</h2><p>{help.message}</p><div>{help.contacts.map(contact => <a className="contact-row" key={contact.phone} href={`tel:${contact.phone.replace(/[^\d+]/g,'')}`}><span>{contact.name}<small>{contact.description}</small></span><strong>{contact.phone}</strong></a>)}</div><p className="muted">{help.hoursNote}</p>{help.emergency && <a href={`tel:${help.emergency.phone.replace(/[^\d+]/g,'')}`}>{help.emergency.message} · {help.emergency.phone}</a>}{help.contacts[0] && <a className="ui-button report-submit" href={`tel:${help.contacts[0].phone.replace(/[^\d+]/g,'')}`}>{help.contacts[0].phone}에 전화하기</a>}</>}<Link className="text-link" to={returnTo}>{returnTo.startsWith('/care') ? '대화로 돌아가기' : '이전 화면으로 돌아가기'}</Link></Page>
}
