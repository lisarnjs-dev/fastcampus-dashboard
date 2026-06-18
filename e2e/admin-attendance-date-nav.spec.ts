import { test, expect } from '@playwright/test'

test.describe('Admin 출석 날짜 네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD_PLAIN
    if (!username || !password) {
      test.skip(true, 'ADMIN_USERNAME/ADMIN_PASSWORD_PLAIN not set')
      return
    }
    await page.goto('/admin/login')
    await page.fill('[data-testid="admin-username"]', username)
    await page.fill('[data-testid="admin-password"]', password)
    await page.click('[data-testid="admin-login-submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('출석 현황 페이지에 날짜 네비게이션 스트립이 렌더된다', async ({ page }) => {
    await page.goto('/admin/attendance')
    await expect(page.locator('[data-testid="attendance-date-nav"]')).toBeVisible()
  })

  test('날짜 버튼 클릭 시 URL에 date 파라미터가 추가된다', async ({ page }) => {
    await page.goto('/admin/attendance')
    const dateNav = page.locator('[data-testid="attendance-date-nav"]')
    await expect(dateNav).toBeVisible()

    const firstBtn = dateNav.locator('button').first()
    const dateValue = await firstBtn.getAttribute('data-testid')
    const dateStr = dateValue?.replace('date-btn-', '') ?? ''

    await firstBtn.click()
    await expect(page).toHaveURL(new RegExp(`date=${dateStr}`))
  })

  test('선택된 날짜 버튼이 aria-pressed=true 상태다', async ({ page }) => {
    await page.goto('/admin/attendance')
    const pressedBtn = page.locator('[data-testid="attendance-date-nav"] button[aria-pressed="true"]')
    await expect(pressedBtn).toHaveCount(1)
  })

  test('?date= 파라미터로 접근하면 해당 날짜 버튼이 선택 상태다', async ({ page }) => {
    await page.goto('/admin/attendance')
    const dateNav = page.locator('[data-testid="attendance-date-nav"]')
    const firstBtn = dateNav.locator('button').first()
    const testid = await firstBtn.getAttribute('data-testid')
    const dateStr = testid?.replace('date-btn-', '') ?? ''

    await page.goto(`/admin/attendance?date=${dateStr}`)
    const btn = page.locator(`[data-testid="date-btn-${dateStr}"]`)
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
})
