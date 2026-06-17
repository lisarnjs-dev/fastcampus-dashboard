import { test, expect } from '@playwright/test'

const DASHBOARD_URL = '/dashboard/A'

test.describe('LoginRequiredGate', () => {
  test('비로그인 상태에서 대시보드 접근 시 로그인 안내 모달이 표시된다', async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await expect(page.getByTestId('login-required-modal')).toBeVisible()
  })

  test('모달 배경을 클릭해도 닫히지 않는다', async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await expect(page.getByTestId('login-required-modal')).toBeVisible()
    // 오버레이(배경) 클릭 — 내부 dialog 카드 바깥 영역
    await page.mouse.click(10, 10)
    await expect(page.getByTestId('login-required-modal')).toBeVisible()
  })

  test('로그인하기 버튼 클릭 시 /login으로 이동한다', async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.getByTestId('login-required-cta').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('로그인된 상태에서는 모달이 표시되지 않는다', async ({ browser }) => {
    // iron-session은 서버 암호화 쿠키라 직접 주입 불가.
    // /api/auth/student 엔드포인트로 세션을 수립한 뒤 검증한다.
    // 환경변수 TEST_STUDENT_NAME / TEST_STUDENT_AUTH_CODE 미설정 시 명시적 skip.
    const name = process.env.TEST_STUDENT_NAME
    const authCode = process.env.TEST_STUDENT_AUTH_CODE

    if (!name || !authCode) {
      test.skip(true, 'TEST_STUDENT_NAME / TEST_STUDENT_AUTH_CODE 환경변수가 설정되지 않아 건너뜀')
    }

    const context = await browser.newContext()
    const page = await context.newPage()

    const loginRes = await page.request.post('/api/auth/student', {
      data: { name, authCode },
    })

    if (!loginRes.ok()) {
      throw new Error(`학생 로그인 실패: HTTP ${loginRes.status()} — ${await loginRes.text()}`)
    }

    await page.goto(DASHBOARD_URL)
    await expect(page.getByTestId('login-required-modal')).not.toBeVisible()
    await context.close()
  })

  test('모달이 올바른 ARIA 속성을 가지고 있다', async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    const modal = page.getByTestId('login-required-modal')
    const dialog = modal.locator('[role="alertdialog"]')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAttribute('aria-labelledby', 'login-required-title')
    await expect(dialog).toHaveAttribute('aria-describedby', 'login-required-desc')
  })
})
