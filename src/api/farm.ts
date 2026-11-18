import { api } from './client'

export type FarmCode = 'CAREER' | 'RELATIONSHIP' | 'BURNOUT' | 'SELF'
export const farmNames: Record<FarmCode, string> = { CAREER: '진로·학업', RELATIONSHIP: '관계', BURNOUT: '번아웃', SELF: '나' }
export interface Farm { code: FarmCode; name: string; tabName: string; waitingCount?: number }
export interface SheepItem { sheepId: number; preview: string; content?: string; stage: number; stageName?: string; nickname: string; createdAt: string; newWoolCount?: number; hidden?: boolean; graduatedAt?: string; alreadySent?: boolean }
export interface WoolItem { woolId: number; content: string; senderNickname: string; createdAt: string; thanked: boolean }
export interface SheepDetail extends Omit<SheepItem, 'preview'> { content: string; farm: Farm; mine: boolean; status: string; canSendWool: boolean; wools: WoolItem[] }
export interface SheepPage { sheep: SheepItem[]; hasNext: boolean; page: number }
export interface CrisisHelp { title: string; message: string; contacts: { name: string; phone: string; description: string }[]; emergency?: { phone: string; message: string }; hoursNote: string }
export type PostResult = { status: 'CREATED'; sheepId: number; stage: number; stageName: string } | { status: 'CRISIS'; crisisHelp: CrisisHelp } | { status: 'PII_REJECTED'; message: string }
export type WoolResult = { status: 'SENT'; woolId: number; sheepStage: number; stageUp: boolean; graduated: boolean; yarnAdded: number; yarnCount: number } | { status: 'SUGGEST'; message: string; suggestion?: string; categoryLabel?: string } | { status: 'BLOCKED'; message: string }

function validateItems<T extends { sheep: SheepItem[] }>(data: T): T {
  if (!Array.isArray(data.sheep)) {
    throw new Error('목장 정보를 읽을 수 없어요. 잠시 후 다시 시도해 주세요.')
  }

  const sheep = data.sheep.map(item => {
    const raw = item as SheepItem & { content?: unknown }
    const preview =
      typeof raw.preview === 'string' ? raw.preview :
      typeof raw.content === 'string' ? raw.content : null

    if (!Number.isSafeInteger(raw.sheepId) || preview === null) {
      throw new Error('목장 정보를 읽을 수 없어요. 잠시 후 다시 시도해 주세요.')
    }

    return { ...item, preview }
  })

  return { ...data, sheep }
}
export const farmApi = {
  list: (code: FarmCode | 'all', page: number, signal?: AbortSignal) => api.get<SheepPage>(`/farms/${code}/sheep?page=${page}`, signal).then(validateItems),
  mine: (status: 'active' | 'graduated', signal?: AbortSignal) => api.get<{ sheep: SheepItem[] }>(`/worry-sheep/me?status=${status}`, signal).then(validateItems),
  detail: (id: number, signal?: AbortSignal) => api.get<SheepDetail>(`/worry-sheep/${id}`, signal),
  post: (code: FarmCode, content: string) => api.post<PostResult>(`/farms/${code}/sheep`, { content }),
  send: (id: number, content: string, sendAsIs = false) => api.post<WoolResult>(`/worry-sheep/${id}/wools`, { content, sendAsIs }),
  graduate: (id: number) => api.post(`/worry-sheep/${id}/graduate`),
  thank: (id: number) => api.post<{ woolId: number; thanked: boolean }>(`/wools/${id}/thanks`),
  recommend: (id: number) => api.get<{ farmCode: FarmCode }>(`/diaries/${id}/farm-recommendation`),
}
