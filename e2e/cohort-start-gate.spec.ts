import { test, expect } from '@playwright/test'

/**
 * 기수 시작 전 출석/미션 제출 차단 게이트.
 * 활성 기수의 시작 여부는 DB 상태에 따라 달라지므로,
 * /api/cohorts 응답으로 시나리오 해당 여부를 판단하고 아니면 skip한다.
 */

interface CohortInfo {
  id: string
  started_at: string
}

function isStarted(startedAt: string): boolean {
  const start = new Date(startedAt)
  const today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return today >= start
}

test.describe('Cohort Start Gate', () => {
  test('기수 시작 전에는 미션 제출 클릭 시 안내 모달이 뜬다', async ({ page, request }) => {
    const res = await request.get('/api/cohorts')
    const cohorts = (await res.json()) as CohortInfo[]
    const active = cohorts[0]

    test.skip(!active || isStarted(active.started_at), '활성 기수가 없거나 이미 시작됨 — 시나리오 해당 없음')

    await page.goto('/missions')
    const submitLink = page.locator('[data-testid^="mission-submit-"]').first()
    test.skip((await submitLink.count()) === 0, 'Google Form이 연결된 미션 없음')

    await submitLink.click()
    await expect(page.locator('[data-testid="cohort-not-started-modal"]')).toBeVisible()
    await expect(page.getByText('아직 기수가 시작되지 않았습니다')).toBeVisible()

    await page.locator('[data-testid="cohort-not-started-close"]').click()
    await expect(page.locator('[data-testid="cohort-not-started-modal"]')).toHaveCount(0)
  })

  test('기수 시작 후에는 미션 제출 링크가 모달 없이 동작한다', async ({ page, request }) => {
    const res = await request.get('/api/cohorts')
    const cohorts = (await res.json()) as CohortInfo[]
    const active = cohorts[0]

    test.skip(!active || !isStarted(active.started_at), '활성 기수가 없거나 아직 시작 전 — 시나리오 해당 없음')

    await page.goto('/missions')
    const submitLink = page.locator('[data-testid^="mission-submit-"]').first()
    test.skip((await submitLink.count()) === 0, 'Google Form이 연결된 미션 없음')

    await submitLink.click()
    await expect(page.locator('[data-testid="cohort-not-started-modal"]')).toHaveCount(0)
  })
})
