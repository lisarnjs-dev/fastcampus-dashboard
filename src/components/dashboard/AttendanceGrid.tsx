'use client'

import { useAttendanceRealtime } from '@/hooks/useAttendanceRealtime'
import { Student } from '@/types/database'

interface Props {
  students: Student[]
  initialAttended: string[]
  initialMessages: Record<string, string>
  group: string
}

export function AttendanceGrid({ students, initialAttended, initialMessages, group }: Props) {
  const { attended, messages } = useAttendanceRealtime(group, new Set(initialAttended), initialMessages)

  return (
    <div data-testid="attendance-grid" className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {students.map(s => {
        const isPresent = attended.has(s.id)
        const message = messages[s.id]
        return (
          <div
            key={s.id}
            data-testid={`attendance-cell-${s.id}`}
            className={[
              'relative group/cell flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border',
              isPresent
                ? 'bg-success-subtle border-success-border shadow-sm'
                : 'bg-page border-bdr',
            ].join(' ')}
          >
            <span className={`text-base mb-0.5 ${isPresent ? 'text-success-fg' : 'text-txt-placeholder'}`}>
              {isPresent ? '✓' : '○'}
            </span>
            <span className={`truncate w-full text-center text-[10px] leading-tight ${isPresent ? 'text-success-fg font-medium' : 'text-txt-muted'}`}>
              {s.name}
            </span>

            {isPresent && message && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48 pointer-events-none opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
                <div className="bg-txt-primary text-brand-fg text-xs rounded-lg px-3 py-2 break-words text-center">
                  {message}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-txt-primary" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
