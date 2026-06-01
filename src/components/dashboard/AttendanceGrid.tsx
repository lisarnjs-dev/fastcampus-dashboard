'use client'

import { useAttendanceRealtime } from '@/hooks/useAttendanceRealtime'
import { Student } from '@/types/database'

interface Props {
  students: Student[]
  initialAttended: string[]
  group: string
}

export function AttendanceGrid({ students, initialAttended, group }: Props) {
  const attended = useAttendanceRealtime(group, new Set(initialAttended))

  return (
    <div data-testid="attendance-grid" className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {students.map(s => {
        const isPresent = attended.has(s.id)
        return (
          <div
            key={s.id}
            title={s.name}
            data-testid={`attendance-cell-${s.id}`}
            className={[
              'flex flex-col items-center justify-center rounded-lg p-2 text-xs text-center transition-colors',
              isPresent
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-neutral-100 border border-neutral-200 text-neutral-400',
            ].join(' ')}
          >
            <span className="text-lg">{isPresent ? '✓' : '○'}</span>
            <span className="truncate w-full text-center">{s.name}</span>
          </div>
        )
      })}
    </div>
  )
}
