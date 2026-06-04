'use client'

import { useState } from 'react'
import { AttendanceGrid } from './AttendanceGrid'
import { MissionSubmissionGrid } from './MissionSubmissionGrid'
import type { Mission, Student } from '@/types/database'

type Tab = 'attendance' | 'mission'

interface Props {
  students: Student[]
  missions: Mission[]
  submissions: { mission_id: string; student_id: string }[]
  attendedIds: string[]
  group: string
}

export function DashboardTabs({ students, missions, submissions, attendedIds, group }: Props) {
  const [tab, setTab] = useState<Tab>('attendance')

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab('attendance')}
          data-testid="tab-attendance"
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            tab === 'attendance'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          출석 인증 현황
        </button>
        <button
          onClick={() => setTab('mission')}
          data-testid="tab-mission"
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            tab === 'mission'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          미션 제출 현황
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {tab === 'attendance' && (
          <>
            <h2 className="text-sm font-medium text-gray-700 mb-3">수강생 명단</h2>
            <AttendanceGrid
              students={students}
              initialAttended={attendedIds}
              group={group}
            />
          </>
        )}
        {tab === 'mission' && (
          <>
            <h2 className="text-sm font-medium text-gray-700 mb-3">미션 제출 현황</h2>
            <MissionSubmissionGrid
              students={students}
              missions={missions}
              submissions={submissions}
            />
          </>
        )}
      </div>
    </div>
  )
}
