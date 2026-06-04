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
      {tab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">수강생 명단</h2>
          <AttendanceGrid
            students={students}
            initialAttended={attendedIds}
            group={group}
          />
        </div>
      )}

      {tab === 'mission' && (
        <div className="space-y-4">
          {/* Mission cards */}
          {missions.length > 0 && (
            <div className="space-y-3">
              {missions.map(m => (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {m.week}주차
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{m.title}</p>
                        {m.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.description}</p>
                        )}
                        {m.due_at && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            마감 {new Date(m.due_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                    {m.google_form_url && (
                      <a
                        href={m.google_form_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        제출하기
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submission grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">제출 현황</h2>
            <MissionSubmissionGrid
              students={students}
              missions={missions}
              submissions={submissions}
            />
          </div>
        </div>
      )}
    </div>
  )
}
