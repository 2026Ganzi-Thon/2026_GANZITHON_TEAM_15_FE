import { http, HttpResponse } from 'msw'
import type { SheepDetail, FarmCode } from '../../api/farm'
import { farmNames } from '../../api/farm'
import type { Block } from '../../api/me'
import { crisisHelp } from '../fixtures/safety'

const ok = (data: unknown, status = 200) => HttpResponse.json({ success: true, data }, { status })
const fail = (message: string, status = 400, code = 'COMMON_400') => HttpResponse.json({ success: false, error: { code, message } }, { status })
let nickname = '다정한 목동'
let yarnCount = 12
let blocks: Block[] = []
let nextId = 30
let crisisUntil: string | null = null
const now = new Date().toISOString()
const texts = ['면접에서 또 떨어졌어요. 계속 준비하는 게 맞는지 모르겠어요.', '친구랑 연락이 점점 줄어요. 먼저 연락해도 될까요?', '열심히 하는데 자꾸 지쳐요.', '나를 좋아하는 방법을 찾고 싶어요.']
const codes = Object.keys(farmNames) as FarmCode[]
const sheep: SheepDetail[] = Array.from({ length: 12 }, (_, i) => ({ sheepId: i + 1, content: texts[i % 4], stage: i % 5 + 1, nickname: i >= 8 ? nickname : ['조용한 목동','포근한 목동','느긋한 목동'][i % 3], createdAt: now, farm: { code: codes[i % 4], name: farmNames[codes[i % 4]], tabName: farmNames[codes[i % 4]] }, mine: i >= 8, status: i >= 10 ? 'GRADUATED' : 'ACTIVE', canSendWool: i < 8, alreadySent: false, newWoolCount: i === 8 ? 2 : 0, wools: i === 8 ? [{ woolId: 101, content: '천천히 정해도 괜찮아요. 응원할게요.', senderNickname: '포근한 목동', createdAt: now, thanked: false }] : [] }))
const reports = new Set<string>()
const hidden = new Set<number>()
const endpoint = (path: string) => new RegExp(`${path}$`)
export const frontend2Handlers = [
  http.get(endpoint('/users/me'), () => ok({ userId: 1, nickname })),
  http.put(endpoint('/users/me/nickname'), async ({ request }) => {
    const body = await request.json() as { nickname: string }
    if (typeof body.nickname !== 'string' || body.nickname.length < 2 || body.nickname.length > 10 || !/^[가-힣a-zA-Z0-9]+(?: [가-힣a-zA-Z0-9]+)*$/.test(body.nickname)) return fail('2~10자의 한글·영문·숫자로 입력해 주세요.')
    if (body.nickname === '조용한 목동') return fail('이미 사용 중인 닉네임이에요.', 409, 'ACCOUNT_NICKNAME_UNAVAILABLE')
    nickname = body.nickname; return ok({ userId: 1, nickname })
  }),
  http.get(endpoint('/my-sheep'), () => ok({ stage: 3, stageName: '포근한 양', woolCount: 6, stageStartAt: 6, nextStageAt: 9, woolToNextStage: 3, yarnCount, equippedItems: [] })),
  http.get(/\/farms\/([^/]+)\/sheep$/, ({ request }) => {
    const url = new URL(request.url); const code = url.pathname.split('/').at(-2)!; const page = Number(url.searchParams.get('page') || 0)
    const items = sheep.filter(s => !s.mine && s.status === 'ACTIVE' && !hidden.has(s.sheepId) && !blocks.some(b => b.nickname === s.nickname) && (code === 'all' || s.farm.code === code)).sort((a,b) => Number(a.alreadySent) - Number(b.alreadySent) || a.stage - b.stage)
    return ok({ sheep: items.slice(page * 8, (page + 1) * 8), page, size: 8, hasNext: items.length > (page + 1) * 8 })
  }),
  http.get(endpoint('/worry-sheep/me'), ({ request }) => {
    const status = new URL(request.url).searchParams.get('status') === 'graduated' ? 'GRADUATED' : 'ACTIVE'
    return ok({ status, sheep: sheep.filter(s => s.mine && s.status === status) })
  }),
  http.get(/\/worry-sheep\/(\d+)$/, ({ request }) => {
    const id = Number(new URL(request.url).pathname.split('/').at(-1)); const item = sheep.find(s => s.sheepId === id)
    if (!item || hidden.has(id) || blocks.some(b => b.nickname === item.nickname)) return fail('고민을 찾을 수 없어요.',404,'COMMON_404')
    return ok(item)
  }),
  http.post(/\/farms\/([^/]+)\/sheep$/, async ({ request }) => {
    const code = new URL(request.url).pathname.split('/').at(-2) as FarmCode
    const { content } = await request.json() as { content: string }
    if (!farmNames[code] || typeof content !== 'string' || !content.trim() || content.trim().length > 200) return fail('목장과 고민 내용을 확인해 주세요.')
    if (/010[-\s]?\d/.test(content)) return ok({ status: 'PII_REJECTED', message: '연락처를 지우고 다시 올려 주세요.' })
    if (content.includes('[시연:위기]')) { crisisUntil = new Date(Date.now() + 86400000).toISOString(); return ok({ status: 'CRISIS', crisisHelp }) }
    const item: SheepDetail = { sheepId: nextId++, content: content.trim(), stage: 1, nickname, createdAt: new Date().toISOString(), farm: { code, name: farmNames[code], tabName: farmNames[code] }, mine: true, status: 'ACTIVE', canSendWool: false, wools: [], newWoolCount: 0 }
    sheep.unshift(item); return ok({ ...item, status: 'CREATED' },201)
  }),
  http.post(/\/worry-sheep\/(\d+)\/wools$/, async ({ request }) => {
    const id = Number(new URL(request.url).pathname.split('/').at(-2)); const item = sheep.find(s => s.sheepId === id)
    if (!item) return fail('고민을 찾을 수 없어요.',404)
    if (item.mine || !item.canSendWool) return fail('이미 보냈거나 조언을 보낼 수 없는 고민이에요.',409)
    const { content, sendAsIs } = await request.json() as { content: string; sendAsIs: boolean }
    if (typeof content !== 'string' || !content.trim() || content.trim().length > 100) return fail('조언을 1~100자로 입력해 주세요.')
    if (/010[-\s]?\d/.test(content)) return ok({ status: 'BLOCKED', message: '개인정보를 지우고 다시 보내 주세요.' })
    if (content.includes('노력') && !sendAsIs) return ok({ status: 'SUGGEST', message: '다그치는 말처럼 들릴 수 있어요', suggestion: '많이 애쓰고 있다는 게 느껴져요.' })
    item.canSendWool = false; item.alreadySent = true; item.stage = Math.min(5,item.stage + 1); yarnCount++
    return ok({ status: 'SENT', woolId: nextId++, sheepStage: item.stage, stageUp: true, graduated: false, yarnAdded: 1, yarnCount },201)
  }),
  http.post(/\/worry-sheep\/(\d+)\/graduate$/, ({ request }) => {
    const item = sheep.find(s => s.sheepId === Number(new URL(request.url).pathname.split('/').at(-2)))
    if (!item?.mine) return fail('고민을 찾을 수 없어요.',404)
    item.status = 'GRADUATED'; item.graduatedAt = new Date().toISOString(); return ok({ sheepId: item.sheepId, status: item.status })
  }),
  http.post(/\/wools\/(\d+)\/thanks$/, ({ request }) => {
    const id = Number(new URL(request.url).pathname.split('/').at(-2)); const wool = sheep.flatMap(s => s.wools).find(w => w.woolId === id)
    if (!wool) return fail('조언을 찾을 수 없어요.',404)
    if (wool.thanked) return fail('이미 고마워요를 보냈어요.',409,'THANKS_ALREADY_SENT')
    wool.thanked = true; return ok({ woolId: id, thanked: true },201)
  }),
  http.get(/\/diaries\/\d+\/farm-recommendation$/, () => ok({ farmCode: 'CAREER', name: '진로·학업', tabName: '진로' })),
  http.get(endpoint('/blocks'), () => ok(blocks)),
  http.post(endpoint('/blocks'), async ({ request }) => {
    const { targetType, targetId } = await request.json() as { targetType: string; targetId: number }
    const name = targetType === 'WOOL' ? sheep.flatMap(s => s.wools).find(w => w.woolId === targetId)?.senderNickname : sheep.find(s => s.sheepId === targetId && !s.mine)?.nickname
    if (!name) return fail('대상을 찾을 수 없어요.',404)
    const block = blocks.find(b => b.nickname === name) ?? { blockId: nextId++, nickname: name, blockedAt: now }
    if (!blocks.includes(block)) blocks.push(block)
    return ok(block,201)
  }),
  http.delete(/\/blocks\/\d+$/, ({ request }) => { const id = Number(new URL(request.url).pathname.split('/').at(-1)); blocks = blocks.filter(b => b.blockId !== id); return ok(null) }),
  http.post(endpoint('/reports'), async ({ request }) => {
    const body = await request.json() as { targetType: string; targetId: number; reason: string; blockUser: boolean }
    if (!['ABUSIVE','PERSONAL_INFO','SPAM','LOOKS_DANGEROUS','ETC'].includes(body.reason) || !['WORRY_SHEEP','WOOL'].includes(body.targetType) || !Number.isSafeInteger(body.targetId) || body.targetId <= 0) return fail('신고 대상을 확인해 주세요.')
    const item = sheep.find(s => s.sheepId === body.targetId)
    if (body.targetType === 'WORRY_SHEEP' && (!item || item.mine)) return fail('신고할 수 없는 고민이에요.',400)
    const key = `${body.targetType}:${body.targetId}`
    if (reports.has(key)) return fail('이미 신고한 대상이에요.',409,'REPORT_DUPLICATED')
    reports.add(key); if (body.targetType === 'WORRY_SHEEP') hidden.add(body.targetId)
    return ok({ reportId: nextId++, hidden: false, blocked: false },201)
  }),
  http.get(endpoint('/help/crisis/banner'), () => ok({ active: !!crisisUntil && Date.parse(crisisUntil) > Date.now(), crisisBannerUntil: crisisUntil })),
  http.get(endpoint('/help/crisis'), () => ok(crisisHelp)),
  http.get(endpoint('/push/vapid-public-key'), () => ok({ enabled: false, publicKey: null })),
  http.get(endpoint('/notifications/stream'), () => new HttpResponse(
    globalThis.location?.search.includes('demoNotification=1') ? 'event: wool-arrived\ndata: {"type":"WOOL_ARRIVED","title":"털 한 올","body":"새 털이 도착했어요","sheepId":9}\n\n' : ':connected\n\n',
    { headers: { 'Content-Type': 'text/event-stream' } },
  )),
]
