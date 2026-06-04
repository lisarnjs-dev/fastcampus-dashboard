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
              'flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border',
              isPresent
                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                : 'bg-gray-50 border-gray-200',
            ].join(' ')}
          >
            <span className={`text-base mb-0.5 ${isPresent ? 'text-emerald-500' : 'text-gray-300'}`}>
              {isPresent ? '✓' : '○'}
            </span>
            <span className={`truncate w-full text-center text-[10px] leading-tight ${isPresent ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
              {s.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
