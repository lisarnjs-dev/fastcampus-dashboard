'use client'

import { NoticeTextGenerator } from './NoticeTextGenerator'
interface StudentSummary {
  id: string
  name: string
  dashboard_group: string
}

interface Props {
  presentIds: Set<string>
  attendanceMessages: Record<string, string>
  students: StudentSummary[]
  cohortName: string
  dateLabel: string
}

export function AttendanceOverview({ presentIds, attendanceMessages, students, cohortName, dateLabel }: Props) {
  const absent = students.filter(s => !presentIds.has(s.id))
  const present = students.filter(s => presentIds.has(s.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-txt-muted">{dateLabel} 기준</p>
          <div className="flex gap-6 mt-1">
            <span className="text-sm"><span className="font-semibold text-success-fg">{present.length}</span> 출석</span>
            <span className="text-sm"><span className="font-semibold text-error">{absent.length}</span> 미출석</span>
            <span className="text-sm text-txt-muted">/ 전체 {students.length}명</span>
          </div>
        </div>
      </div>

      {absent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-txt-secondary">미출석 수강생</h3>
          <div className="flex flex-wrap gap-2">
            {absent.map(s => (
              <span
                key={s.id}
                className="px-2.5 py-1 bg-error-subtle border border-error-border rounded-full text-sm text-error"
                data-testid={`absent-${s.id}`}
              >
                {s.name}
                {s.dashboard_group && <span className="ml-1 text-error opacity-60 text-xs">{s.dashboard_group}</span>}
              </span>
            ))}
          </div>
          <NoticeTextGenerator absentNames={absent.map(s => s.name)} cohortName={cohortName} />
        </div>
      )}

      {absent.length === 0 && (
        <p className="text-sm text-success-fg font-medium">전원 출석 완료!</p>
      )}

      {present.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-txt-secondary">출석 수강생</h3>
          <div className="flex flex-col gap-2">
            {present.map(s => (
              <div
                key={s.id}
                data-testid={`present-${s.id}`}
                className="flex items-start gap-3 px-3 py-2.5 bg-success-subtle border border-success-border rounded-xl"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-success-fg text-sm font-medium">{s.name}</span>
                  {s.dashboard_group && (
                    <span className="text-xs text-success-fg opacity-60">{s.dashboard_group}</span>
                  )}
                </div>
                {attendanceMessages[s.id] && (
                  <p className="text-xs text-txt-muted leading-relaxed">{attendanceMessages[s.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
