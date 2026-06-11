import { test, expect } from '@playwright/test'

test.describe('Admin Flow', () => {
  test('admin routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin/login')
  })

  test('admin login page renders form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('[data-testid="admin-username"]')).toBeVisible()
    await expect(page.locator('[data-testid="admin-password"]')).toBeVisible()
    await expect(page.locator('[data-testid="admin-login-submit"]')).toBeVisible()
  })

  test('wrong credentials show error', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('[data-testid="admin-username"]', 'wrong')
    await page.fill('[data-testid="admin-password"]', 'wrong')
    await page.click('[data-testid="admin-login-submit"]')
    await expect(page.locator('[data-testid="admin-login-error"]')).toBeVisible()
  })

  test('admin login with correct credentials redirects to /admin', async ({ page }) => {
    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD_PLAIN
    if (!username || !password) {
      test.skip(true, 'ADMIN_USERNAME/ADMIN_PASSWORD_PLAIN not set')
    }
    await page.goto('/admin/login')
    await page.fill('[data-testid="admin-username"]', username!)
    await page.fill('[data-testid="admin-password"]', password!)
    await page.click('[data-testid="admin-login-submit"]')
    await expect(page).toHaveURL('/admin')
  })
})
