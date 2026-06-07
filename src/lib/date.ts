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
