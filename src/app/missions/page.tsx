export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { MissionCard } from '@/components/mission/MissionCard'
import { BackButton } from '@/components/ui/BackButton'
import type { Cohort, Mission, MissionSubmission } from '@/types/database'

export default async function MissionsPage() {
  const supabase = createServerClient()

  const cohortResult = await supabase
    .from('cohorts')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  const activeCohort = cohortResult.data as Cohort | null

  if (!activeCohort) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">현재 활성 기수가 없습니다.</p>
      </div>
    )
  }

  const cohortId = activeCohort.id

  const missionsResult = await supabase
    .from('missions')
    .select('*')
    .eq('cohort_id', cohortId)
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

  const studentCountResult = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', cohortId)
  const studentCount = studentCountResult.count ?? 0

  const submissionsByMission = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.mission_id] = (acc[s.mission_id] ?? 0) + 1
    return acc
  }, {})

  const byWeek = missions.reduce<Record<number, Mission[]>>((acc, m) => {
    if (!acc[m.week]) acc[m.week] = []
    acc[m.week]!.push(m)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">미션 목록</h1>
          <p className="text-sm text-neutral-500 mt-1">{activeCohort.name}</p>
        </div>

        {Object.keys(byWeek).length === 0 && (
          <p className="text-neutral-500">등록된 미션이 없습니다.</p>
        )}

        {Object.entries(byWeek).map(([week, weekMissions]) => (
          <section key={week}>
            <h2 className="text-lg font-semibold mb-3">Week {week}</h2>
            <div className="space-y-3">
              {weekMissions.map(m => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  submissionCount={submissionsByMission[m.id] ?? 0}
                  totalStudents={studentCount}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
