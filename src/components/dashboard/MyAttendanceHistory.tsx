'use client'

import { useEffect, useState } from 'react'

interface AttendanceHistoryData {
  started_at: string
  planned_end_at: string | null
  ended_at: string | null
  attendedDates: string[]
}

type DayStatus = 'attended' | 'absent' | 'future' | 'today'

interface DayCell {
  date: string
  label: string
  status: DayStatus
}

// 날짜 문자열을 로컬 타임존 기준 Date로 파싱 (UTC 해석 방지)
function toLocalDate(str: string): Date {
  if (str.length === 10) {
    // "YYYY-MM-DD" 형식 - 로컬 타임존으로 직접 생성
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  // timestamptz 형식 - 로컬 날짜 기준으로 정규화
  const dt = new Date(str)
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildDayCells(data: AttendanceHistoryData, today: string): DayCell[] {
  const start = toLocalDate(data.started_at)
  const endCandidate = data.planned_end_at ?? data.ended_at ?? today
  const end = toLocalDate(endCandidate)
  const todayDate = toLocalDate(today)

  const attended = new Set(data.attendedDates)
  const cells: DayCell[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const isWeekend = cursor.getDay() === 0 || cursor.getDay() === 6
    if (!isWeekend) {
      const dateStr = toDateStr(cursor)
      let status: DayStatus
      if (cursor > todayDate) {
        status = 'future'
      } else if (dateStr === today) {
        status = attended.has(dateStr) ? 'attended' : 'today'
      } else {
        status = attended.has(dateStr) ? 'attended' : 'absent'
      }
      cells.push({
        date: dateStr,
        label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
        status,
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return cells
}

const STATUS_STYLES: Record<DayStatus, string> = {
  attended: 'bg-success-subtle border-success-border text-success-fg font-semibold',
  absent: 'bg-error-subtle border-error-border text-error',
  today: 'bg-brand-subtle border-brand text-brand',
  future: 'bg-page border-bdr text-txt-placeholder',
}

const STATUS_ICON: Record<DayStatus, string> = {
  attended: 'O',
  absent: 'X',
  today: '?',
  future: '·',
}

export function MyAttendanceHistory() {
  const [data, setData] = useState<AttendanceHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const today = toDateStr(new Date())

  useEffect(() => {
    fetch('/api/attendance/history')
      .then(r => {
        if (!r.ok) throw new Error('출석 기록을 불러오지 못했습니다')
        return r.json()
      })
      .then(d => {
        setData(d)
        setFetchError('')
      })
      .catch((e: unknown) => {
        setFetchError(e instanceof Error ? e.message : '출석 기록을 불러오지 못했습니다')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-page rounded w-1/3" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="h-10 bg-page rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <p className="text-sm text-error text-center py-4" data-testid="attendance-history-error">
        {fetchError}
      </p>
    )
  }

  if (!data) return null

  const cells = buildDayCells(data, today)
  const attendedCount = cells.filter(c => c.status === 'attended').length
  const absentCount = cells.filter(c => c.status === 'absent').length
  const totalPast = attendedCount + absentCount

  return (
    <div data-testid="my-attendance-history">
      {/* 요약 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-success-subtle border border-success-border text-success-fg text-xs font-bold">O</span>
          <span className="text-sm text-txt-secondary">출석 <strong className="text-txt-primary">{attendedCount}일</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-error-subtle border border-error-border text-error text-xs font-bold">X</span>
          <span className="text-sm text-txt-secondary">결석 <strong className="text-txt-primary">{absentCount}일</strong></span>
        </div>
        {totalPast > 0 && (
          <div className="ml-auto text-sm text-txt-muted">
            출석률 <strong className="text-txt-primary">{Math.round((attendedCount / totalPast) * 100)}%</strong>
          </div>
        )}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5" data-testid="attendance-day-grid">
        {cells.map(cell => (
          <div
            key={cell.date}
            title={cell.date}
            data-testid={`day-cell-${cell.date}`}
            className={[
              'flex flex-col items-center justify-center rounded-lg border py-2 gap-0.5',
              STATUS_STYLES[cell.status],
            ].join(' ')}
          >
            <span className="text-xs font-bold leading-none">{STATUS_ICON[cell.status]}</span>
            <span className="text-[10px] leading-none opacity-70">{cell.label}</span>
          </div>
        ))}
      </div>

      {cells.length === 0 && (
        <p className="text-sm text-txt-muted text-center py-4">기수 진행 기간이 설정되지 않았습니다.</p>
      )}
    </div>
  )
}
