/**
 * 기수가 시작되었는지 날짜(로컬 타임존) 기준으로 판단한다.
 * 시작일이 없거나 파싱 불가하면 차단하지 않도록 true를 반환한다.
 */
export function hasCohortStarted(startedAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!startedAt) return true
  const start = new Date(startedAt)
  if (Number.isNaN(start.getTime())) return true
  return toLocalDateString(now) >= toLocalDateString(start)
}

function toLocalDateString(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

/**
 * YYYY-MM-DD 날짜 문자열에 weeks 주를 더한 날짜를 YYYY-MM-DD로 반환한다.
 * UTC 해석 오류를 피하기 위해 로컬 타임존 기준으로 파싱한다.
 */
export function addWeeks(dateStr: string, weeks: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + weeks * 7)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
