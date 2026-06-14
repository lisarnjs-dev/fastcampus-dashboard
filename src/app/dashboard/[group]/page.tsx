export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { GroupSelector } from '@/components/dashboard/GroupSelector'
import { TodayCheckinCard } from '@/components/dashboard/TodayCheckinCard'
import { getSession } from '@/lib/session'
import type { Cohort, Mission, MissionSubmission, Student } from '@/types/database'

interface Props {
  params: Promise<{ group: string }>
}

export default async function DashboardGroupPage({ params }: Props) {
  const { group } = await params
  const supabase = createServerClient()
  const today = new Date().toLocaleDateString('sv-SE')

  const cohortResult = await supabase
    .from('cohorts').select('*').eq('status', 'active').maybeSingle()
  const activeCohort = cohortResult.data as Cohort | null

  if (!activeCohort) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">현재 활성 기수가 없습니다.</p>
      </div>
    )
  }

  const cohortId = activeCohort.id

  const studentsResult = await supabase
    .from('students')
    .select('id, name, dashboard_group, cohort_id, auth_code, created_at')
    .eq('cohort_id', cohortId)
    .order('name', { ascending: true })
  const students = (studentsResult.data ?? []) as Student[]

  const attendancesResult = await supabase
    .from('attendances').select('student_id').eq('cohort_id', cohortId).eq('date', today)
  const attendances = (attendancesResult.data ?? []) as { student_id: string }[]

  const missionsResult = await supabase
    .from('missions').select('*').eq('cohort_id', cohortId)
    .or(`dashboard_group.is.null,dashboard_group.eq.${group}`)
    .order('week', { ascending: true }).order('created_at', { ascending: true })
  const missions = (missionsResult.data ?? []) as Mission[]

  const missionIds = missions.map(m => m.id)
  const submissionsResult = missionIds.length > 0
    ? await supabase.from('mission_submissions').select('mission_id, student_id').in('mission_id', missionIds)
    : { data: [] }
  const submissions = (submissionsResult.data ?? []) as Pick<MissionSubmission, 'mission_id' | 'student_id'>[]

  const session = await getSession()
  const isStudentLoggedIn = !!session.student

  const groups = [...new Set(students.map(s => s.dashboard_group))].sort()

  if (!groups.includes(group)) {
    if (groups.length > 0) notFound()
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">수강생이 없습니다.</p>
      </div>
    )
  }

  const groupStudents = students.filter(s => s.dashboard_group === group)
  const attendedIds = attendances.map(a => a.student_id)
  const attendedCount = groupStudents.filter(s => attendedIds.includes(s.id)).length
  const attendancePct = groupStudents.length > 0 ? Math.round((attendedCount / groupStudents.length) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                data-testid="back-button"
                className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
              >
                ←
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">{activeCohort.name}</h1>
                <p className="text-xs text-gray-400">{today}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {attendedCount}
                <span className="text-gray-300 font-normal text-base">/{groupStudents.length}</span>
              </p>
              <p className="text-xs text-gray-400">오늘 출석</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Group tabs */}
        <GroupSelector groups={groups} />

        {/* Attendance progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">그룹 {group} 출석 현황</span>
            <span className="text-sm text-gray-500">{attendedCount}/{groupStudents.length}명 ({attendancePct}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${attendancePct}%` }}
            />
          </div>
        </div>

        {/* Checkin card */}
        <TodayCheckinCard cohort={activeCohort} />

        {/* Attendance / Mission tabs */}
        <DashboardTabs
          students={groupStudents}
          missions={missions}
          submissions={submissions}
          attendedIds={attendedIds}
          group={group}
          isStudentLoggedIn={isStudentLoggedIn}
        />
      </div>
    </div>
  )
}
