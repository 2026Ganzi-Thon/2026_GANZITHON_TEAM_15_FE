import { http, HttpResponse } from 'msw'

export const reportHandlers = [http.post(/\/reports$/, async ({ request }) => {
  const body = await request.json() as { targetId?: number; targetType?: string; reason?: string; blockUser?: boolean }
  if (!Number.isSafeInteger(body.targetId) || Number(body.targetId) <= 0 || !['WORRY_SHEEP', 'WOOL'].includes(body.targetType ?? '') || typeof body.blockUser !== 'boolean' || !['ABUSIVE', 'PERSONAL_INFO', 'SPAM', 'LOOKS_DANGEROUS', 'ETC'].includes(body.reason ?? '')) {
    return HttpResponse.json({ success: false, error: { code: 'COMMON_400', message: '고민과 신고 사유를 확인해 주세요.' } }, { status: 400 })
  }
  return HttpResponse.json({ success: true, data: { reportId: Date.now(), hidden: false, blocked: body.blockUser } }, { status: 201 })
})]
