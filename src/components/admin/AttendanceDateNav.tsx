'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect, useTransition } from 'react'

interface Props {
  dates: string[]
  selectedDate: string
  todayKST: string
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLabel(dateStr: string): { md: string; day: string } {
  const d = parseLocalDate(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return {
    md: `${month}/${day}`,
    day: DAY_KO[d.getDay()],
  }
}

function isSameWeek(a: string, b: string): boolean {
  const da = parseLocalDate(a)
  const db = parseLocalDate(b)
  const startOfWeekA = new Date(da)
  startOfWeekA.setDate(da.getDate() - da.getDay())
  const startOfWeekB = new Date(db)
  startOfWeekB.setDate(db.getDate() - db.getDay())
  return startOfWeekA.getTime() === startOfWeekB.getTime()
}

export function AttendanceDateNav({ dates, selectedDate, todayKST }: Props) {
  const router = useRouter()
  const selectedRef = useRef<HTMLButtonElement>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' })
  }, [selectedDate])

  return (
    <div
      className="overflow-x-auto pb-2 -mx-1"
      data-testid="attendance-date-nav"
    >
      <div className="flex gap-1 min-w-max px-1">
        {dates.map((date, i) => {
          const isSelected = date === selectedDate
          const isToday = date === todayKST
          const isWeekStart = i === 0 || !isSameWeek(dates[i - 1], date)
          const { md, day } = formatLabel(date)

          return (
            <div
              key={date}
              className={`flex flex-col items-center${isWeekStart && i !== 0 ? ' ml-3 pl-3 border-l border-bdr' : ''}`}
            >
              <button
                ref={isSelected ? selectedRef : undefined}
                onClick={() => startTransition(() => router.push(`?date=${date}`))}
                disabled={isPending && !isSelected}
                data-testid={`date-btn-${date}`}
                aria-pressed={isSelected}
                className={[
                  'flex flex-col items-center px-3 py-2 rounded-xl border text-sm transition-all w-14',
                  isSelected
                    ? 'bg-brand text-brand-fg border-brand font-semibold'
                    : 'bg-surface border-bdr text-txt-secondary hover:border-brand hover:text-brand',
                  isPending && !isSelected ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <span className="text-xs leading-tight">{md}</span>
                <span className="leading-tight">{day}</span>
              </button>
              {isToday && !isSelected && (
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
