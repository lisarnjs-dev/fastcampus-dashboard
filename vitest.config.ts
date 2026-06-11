import { defineConfig } from 'vitest/config'

// e2e/ 폴더는 Playwright 전용 — vitest는 src 안의 유닛 테스트만 실행한다.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
