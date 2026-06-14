import { describe, it, expect } from 'vitest'
import { addWeeks, hasCohortStarted } from './date'

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

describe('hasCohortStarted', () => {
  const now = new Date(2026, 5, 11, 10, 0, 0) // 2026-06-11 10:00 로컬

  it('시작일이 미래면 false를 반환한다', () => {
    expect(hasCohortStarted('2026-06-15', now)).toBe(false)
  })

  it('시작일이 오늘이면 true를 반환한다 (당일 개강 포함)', () => {
    expect(hasCohortStarted('2026-06-11', now)).toBe(true)
  })

  it('시작일이 과거면 true를 반환한다', () => {
    expect(hasCohortStarted('2026-06-01', now)).toBe(true)
  })

  it('ISO 타임스탬프 형식의 시작일도 날짜 기준으로 비교한다', () => {
    expect(hasCohortStarted('2026-06-15T00:00:00.000Z', now)).toBe(false)
    expect(hasCohortStarted('2026-06-01T00:00:00.000Z', now)).toBe(true)
  })

  it('시작일이 없으면 차단하지 않는다 (true)', () => {
    expect(hasCohortStarted(null, now)).toBe(true)
    expect(hasCohortStarted(undefined, now)).toBe(true)
    expect(hasCohortStarted('', now)).toBe(true)
  })

  it('파싱할 수 없는 시작일은 차단하지 않는다 (true)', () => {
    expect(hasCohortStarted('not-a-date', now)).toBe(true)
  })
})
