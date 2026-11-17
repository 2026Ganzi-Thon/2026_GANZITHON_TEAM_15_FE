import { test, expect } from '@playwright/test'

test('앱 안 털 도착 알림에서 내 고민으로 이동', async ({ page }) => {
  await page.goto('/me?demoNotification=1')
  await expect(page.getByText('새 털이 도착했어요')).toBeVisible()
  await page.getByRole('link', { name: '받은 털 보기' }).click()
  await expect(page).toHaveURL('/worries/9')
  await expect(page.getByText('털이 풍성해졌어요')).toBeVisible()
})

test('개인정보 거절과 상담 전환은 게시 완료가 아님', async ({ page }) => {
  await page.goto('/worries/new')
  const input = page.getByRole('textbox', { name: '고민 내용' })
  await input.fill('연락처 010-1234-5678')
  await page.getByRole('button', { name: '올리기', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('연락처를 지우고')
  await input.fill('[시연:위기] 상담 전환 테스트')
  await page.getByRole('button', { name: '올리기', exact: true }).click()
  await expect(page.getByText('고민은 게시되지 않았어요.')).toBeVisible()
  await page.getByRole('link', { name: '도움받을 곳 보기' }).click()
  await expect(page.getByRole('heading', { name: '전화로 이야기해 볼래요?' })).toBeVisible()
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
})

test('잘못된 고민 주소와 좁은 화면', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/worries/not-a-number')
  await expect(page.getByText('고민을 찾을 수 없어요')).toBeVisible()
  await page.getByRole('link', { name: '목장으로' }).click()
  await expect(page.locator('.pasture')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('link', { name: '나', exact: true }).click()
  await page.getByRole('link', { name: '차단한 목동 관리' }).click()
  await expect(page.getByText('차단한 목동이 없어요')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
