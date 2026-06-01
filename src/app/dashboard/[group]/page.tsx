export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AttendanceGrid } from '@/components/dashboard/AttendanceGrid'
import { GroupSelector } from '@/components/dashboard/GroupSelector'
import { TodayCheckinCard } from '@/components/dashboard/TodayCheckinCard'
import { MissionCard } from '@/components/mission/MissionCard'
import { BackButton } from '@/components/ui/BackButton'
import type { Cohort, Mission, MissionSubmission, Student } from '@/types/database'

interface Props {
  params: Promise<{ group: string }>
}

export default async function DashboardGroupPage({ params }: Props) {
  const { group } = await params
  const supabase = createServerClient()
  const today = new Date().toLocaleDateString('sv-SE')

  const cohortResult = await supabase
    .from('cohorts')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  const activeCohort = cohortResult.data as Cohort | null

  if (!activeCohort) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">현재 활성 기수가 없습니다.</p>
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
    .from('attendances')
    .select('student_id')
    .eq('cohort_id', cohortId)
    .eq('date', today)
  const attendances = (attendancesResult.data ?? []) as { student_id: string }[]

  const missionsResult = await supabase
    .from('missions')
    .select('*')
    .eq('cohort_id', cohortId)
    .or(`dashboard_group.is.null,dashboard_group.eq.${group}`)
    .order('week', { ascending: true })
    .order('created_at', { ascending: true })
  const missions = (missionsResult.data ?? []) as Mission[]

  const missionIds = missions.map(m => m.id)
  const submissionsResult = missionIds.length > 0
    ? await supabase
        .from('mission_submissions')
        .select('mission_id, student_id')
        .in('mission_id', missionIds)
    : { data: [] }
  const submissions = (submissionsResult.data ?? []) as Pick<MissionSubmission, 'mission_id' | 'student_id'>[]
  const submissionsByMission = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.mission_id] = (acc[s.mission_id] ?? 0) + 1
    return acc
  }, {})

  const groups = [...new Set(students.map(s => s.dashboard_group))].sort()

  if (!groups.includes(group)) {
    if (groups.length > 0) notFound()
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">수강생이 없습니다.</p>
      </div>
    )
  }

  const groupStudents = students.filter(s => s.dashboard_group === group)
  const attendedIds = attendances.map(a => a.student_id)
  const attendedCount = groupStudents.filter(s => attendedIds.includes(s.id)).length

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/" label="← 기수 선택으로" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{activeCohort.name}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {today} 출석 현황 — {attendedCount}/{groupStudents.length}명
            </p>
          </div>
        </div>

        <GroupSelector groups={groups} />

        <TodayCheckinCard />

        <div>
          <h2 className="text-lg font-semibold mb-3">그룹 {group} 출석 현황</h2>
          <AttendanceGrid
            students={groupStudents}
            initialAttended={attendedIds}
            group={group}
          />
        </div>

        {missions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">미션</h2>
            <div className="space-y-3">
              {missions.map(m => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  submissionCount={submissionsByMission[m.id] ?? 0}
                  totalStudents={groupStudents.length}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
