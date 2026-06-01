'use client'

import { NoticeTextGenerator } from './NoticeTextGenerator'
interface StudentSummary {
  id: string
  name: string
  dashboard_group: string
}

interface Props {
  presentIds: Set<string>
  students: StudentSummary[]
  cohortName: string
  todayLabel: string
}

export function AttendanceOverview({ presentIds, students, cohortName, todayLabel }: Props) {
  const absent = students.filter(s => !presentIds.has(s.id))
  const present = students.filter(s => presentIds.has(s.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-neutral-500">{todayLabel} 기준</p>
          <div className="flex gap-6 mt-1">
            <span className="text-sm"><span className="font-semibold text-green-600">{present.length}</span> 출석</span>
            <span className="text-sm"><span className="font-semibold text-red-500">{absent.length}</span> 미출석</span>
            <span className="text-sm text-neutral-500">/ 전체 {students.length}명</span>
          </div>
        </div>
      </div>

      {absent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700">미출석 수강생</h3>
          <div className="flex flex-wrap gap-2">
            {absent.map(s => (
              <span
                key={s.id}
                className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-sm text-red-700"
                data-testid={`absent-${s.id}`}
              >
                {s.name}
                {s.dashboard_group && <span className="ml-1 text-red-400 text-xs">{s.dashboard_group}</span>}
              </span>
            ))}
          </div>
          <NoticeTextGenerator absentNames={absent.map(s => s.name)} cohortName={cohortName} />
        </div>
      )}

      {absent.length === 0 && (
        <p className="text-sm text-green-700 font-medium">전원 출석 완료!</p>
      )}
    </div>
  )
}
