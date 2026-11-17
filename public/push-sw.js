/* global self */
self.addEventListener('push', event => {
  let data
  try { data = event.data?.json() } catch { return }
  if (!data || typeof data.title !== 'string') return
  const id = Number(data.sheepId)
  event.waitUntil(self.registration.showNotification(data.title, {
    body: typeof data.body === 'string' ? data.body : '',
    tag: Number.isSafeInteger(id) ? `wool-${id}` : 'wool-notice',
    data: { url: Number.isSafeInteger(id) && id > 0 ? `/worries/${id}` : '/worries/me' },
  }))
})
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const path = event.notification.data?.url
  const url = new URL(typeof path === 'string' && /^\/worries\//.test(path) ? path : '/worries/me', self.location.origin).href
  event.waitUntil(self.clients.openWindow(url))
})
