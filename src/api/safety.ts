import { api } from './client'
import type { CrisisHelp } from './farm'
export const safetyApi = {
  help: (signal?: AbortSignal) => api.get<CrisisHelp>('/help/crisis', signal),
  banner: (signal?: AbortSignal) => api.get<{ active: boolean; crisisBannerUntil: string | null }>('/help/crisis/banner', signal),
}
