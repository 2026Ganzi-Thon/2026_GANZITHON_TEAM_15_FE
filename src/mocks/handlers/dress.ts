import { http, HttpResponse } from 'msw'
import type { DressItem, DressItemsResponse } from '../../api/dress'

let mockYarnCount = 4
let mockSpentYarn = 0

let mockItems: DressItem[] = [
  { code: 'SCARF', name: '목도리', yarnCost: 2, owned: true, equipped: true },
  { code: 'HAT', name: '모자', yarnCost: 3, owned: false, equipped: false },
  { code: 'FLOWER', name: '꽃 장식', yarnCost: 2, owned: false, equipped: false },
]

export const dressHandlers = [
  http.get('*/my-sheep/items', () => {
    return HttpResponse.json({
      success: true,
      data: {
        yarnCount: mockYarnCount,
        spentYarn: mockSpentYarn,
        items: mockItems,
      } satisfies DressItemsResponse,
    })
  }),

  http.put('*/my-sheep/items', async ({ request }) => {
    const body = await request.json() as { craft: string[]; equipped: string[] }

    for (const code of body.craft) {
      const item = mockItems.find((candidate) => candidate.code === code)
      if (item && !item.owned && mockYarnCount >= item.yarnCost) {
        mockYarnCount -= item.yarnCost
        mockSpentYarn += item.yarnCost
        item.owned = true
      }
    }

    mockItems = mockItems.map((item) => ({
      ...item,
      equipped: body.equipped.includes(item.code) && item.owned,
    }))

    return HttpResponse.json({
      success: true,
      data: {
        yarnCount: mockYarnCount,
        spentYarn: mockSpentYarn,
        items: mockItems,
      } satisfies DressItemsResponse,
    })
  }),
]
