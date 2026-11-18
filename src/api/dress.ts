import { api } from './client'

export interface DressItem {
  code: string
  name: string
  yarnCost: number
  owned: boolean
  equipped: boolean
}

export interface DressItemsResponse {
  yarnCount: number
  spentYarn: number
  items: DressItem[]
}

export interface UpdateDressItemsRequest {
  craft: string[]
  equipped: string[]
}

export const dressApi = {
  getItems: (signal?: AbortSignal) =>
    api.get<DressItemsResponse>('/my-sheep/items', signal),

  updateItems: (body: UpdateDressItemsRequest) =>
    api.put<DressItemsResponse>('/my-sheep/items', body),
}
