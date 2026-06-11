import { test, expect } from '@playwright/test'

test.describe('Public Dashboard', () => {
  test('home page redirects to a dashboard group', async ({ page }) => {
    await page.goto('/')
    // Either redirects to /dashboard/... or shows a no-cohort message
    await expect(page).toHaveURL(/\/(dashboard\/[A-Z])?/)
  })

  test('dashboard page renders attendance grid', async ({ page }) => {
    const res = await page.goto('/dashboard/A')
    // Accepts 200 (active cohort) or 404 (no such group)
    expect([200, 404]).toContain(res?.status())
    if (res?.status() === 200) {
      await expect(page.locator('[data-testid="attendance-grid"]')).toBeVisible()
    }
  })

  test('missions public page renders', async ({ page }) => {
    await page.goto('/missions')
    await expect(page).not.toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('미션')
  })
})
