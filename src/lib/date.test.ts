import { describe, it, expect } from 'vitest'
import { addWeeks } from './date'

describe('addWeeks', () => {
  it('시작일로부터 3주(21일) 후 날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    expect(addWeeks('2026-06-07', 3)).toBe('2026-06-28')
  })

  it('월말 경계를 올바르게 처리한다', () => {
    expect(addWeeks('2026-06-20', 3)).toBe('2026-07-11')
  })

  it('연말 경계를 올바르게 처리한다', () => {
    expect(addWeeks('2026-12-20', 3)).toBe('2027-01-10')
  })

  it('1주를 더할 수 있다', () => {
    expect(addWeeks('2026-06-07', 1)).toBe('2026-06-14')
  })

  it('윤년 2월을 올바르게 처리한다', () => {
    expect(addWeeks('2024-02-10', 3)).toBe('2024-03-02')
  })
})
