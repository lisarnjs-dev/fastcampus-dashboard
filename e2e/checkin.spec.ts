import { test, expect } from '@playwright/test'

test.describe('Student Check-in Flow', () => {
  test('unauthenticated checkin redirects to login', async ({ page }) => {
    await page.goto('/checkin')
    await expect(page).toHaveURL('/login')
  })

  test('student login page renders form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="student-auth-code"]')).toBeVisible()
    await expect(page.locator('[data-testid="student-login-submit"]')).toBeVisible()
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid="student-name"]', '존재하지않는사람')
    await page.fill('[data-testid="student-auth-code"]', 'BADCODE1')
    await page.click('[data-testid="student-login-submit"]')
    await expect(page.locator('[data-testid="student-login-error"]')).toBeVisible()
  })
})
