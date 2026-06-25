'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AttendanceGrid } from './AttendanceGrid'
import { MissionSubmissionGrid } from './MissionSubmissionGrid'
import { MyAttendanceHistory } from './MyAttendanceHistory'
import type { Mission, Student } from '@/types/database'

type Tab = 'attendance' | 'mission' | 'my-history'

interface Props {
  students: Student[]
  missions: Mission[]
  submissions: { mission_id: string; student_id: string }[]
  attendedIds: string[]
  attendanceMessages: Record<string, string>
  group: string
  isStudentLoggedIn: boolean
}

export function DashboardTabs({ students, missions, submissions, attendedIds, attendanceMessages, group, isStudentLoggedIn }: Props) {
  const [tab, setTab] = useState<Tab>('attendance')

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 mb-4 bg-page rounded-xl p-1">
        <button
          onClick={() => setTab('attendance')}
          data-testid="tab-attendance"
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            tab === 'attendance'
              ? 'bg-surface text-txt-primary shadow-sm'
              : 'text-txt-muted hover:text-txt-secondary',
          ].join(' ')}
        >
          출석 현황
        </button>
        <button
          onClick={() => setTab('mission')}
          data-testid="tab-mission"
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            tab === 'mission'
              ? 'bg-surface text-txt-primary shadow-sm'
              : 'text-txt-muted hover:text-txt-secondary',
          ].join(' ')}
        >
          미션 제출 현황
        </button>
        {isStudentLoggedIn && (
          <button
            onClick={() => setTab('my-history')}
            data-testid="tab-my-history"
            className={[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              tab === 'my-history'
                ? 'bg-surface text-txt-primary shadow-sm'
                : 'text-txt-muted hover:text-txt-secondary',
            ].join(' ')}
          >
            내 출석 기록
          </button>
        )}
      </div>

      {/* Tab content */}
      {tab === 'attendance' && (
        <div className="bg-surface rounded-xl border border-bdr p-4">
          <h2 className="text-sm font-medium text-txt-secondary mb-3">수강생 명단</h2>
          <AttendanceGrid
            students={students}
            initialAttended={attendedIds}
            initialMessages={attendanceMessages}
            group={group}
          />
        </div>
      )}

      {tab === 'mission' && (
        <div className="space-y-4">
          {/* Mission cards */}
          {missions.length > 0 && (
            <div className="space-y-3">
              {missions.map(m => {
                const isPast = m.due_at ? new Date(m.due_at) < new Date() : false
                return (
                  <Link
                    key={m.id}
                    href={`/dashboard/${group}/mission/${m.id}`}
                    data-testid={`mission-card-${m.id}`}
                    className="block bg-surface border border-bdr rounded-xl p-4 hover:border-brand hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="shrink-0 bg-brand-muted text-brand text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {m.week}주차
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-txt-primary leading-snug group-hover:text-brand transition-colors">
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-xs text-txt-muted mt-1 leading-relaxed line-clamp-2">
                              {m.description}
                            </p>
                          )}
                          {m.due_at && (
                            <p className={`text-xs mt-1.5 ${isPast ? 'text-error' : 'text-txt-placeholder'}`}>
                              마감 {new Date(m.due_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-txt-placeholder group-hover:text-brand transition-colors text-sm">›</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Submission grid */}
          <div className="bg-surface rounded-xl border border-bdr p-4">
            <h2 className="text-sm font-medium text-txt-secondary mb-3">제출 현황</h2>
            <MissionSubmissionGrid
              students={students}
              missions={missions}
              submissions={submissions}
            />
          </div>
        </div>
      )}

      {tab === 'my-history' && isStudentLoggedIn && (
        <div className="bg-surface rounded-xl border border-bdr p-4">
          <h2 className="text-sm font-medium text-txt-secondary mb-4">내 누적 출석 기록</h2>
          <MyAttendanceHistory />
        </div>
      )}
    </div>
  )
}
