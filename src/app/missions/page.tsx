export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { MissionCard } from '@/components/mission/MissionCard'
import type { Cohort, Mission, MissionSubmission } from '@/types/database'

export default async function MissionsPage() {
  const supabase = createServerClient()

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

  const missionsResult = await supabase
    .from('missions').select('*').eq('cohort_id', cohortId)
    .order('week', { ascending: true }).order('created_at', { ascending: true })
  const missions = (missionsResult.data ?? []) as Mission[]

  const missionIds = missions.map(m => m.id)
  const submissionsResult = missionIds.length > 0
    ? await supabase.from('mission_submissions').select('mission_id, student_id').in('mission_id', missionIds)
    : { data: [] }
  const submissions = (submissionsResult.data ?? []) as Pick<MissionSubmission, 'mission_id' | 'student_id'>[]

  const studentCountResult = await supabase
    .from('students').select('*', { count: 'exact', head: true }).eq('cohort_id', cohortId)
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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <a
              href="javascript:history.back()"
              data-testid="back-button"
              className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
            >
              ←
            </a>
            <div>
              <h1 className="font-semibold text-gray-900">미션</h1>
              <p className="text-xs text-gray-400">{activeCohort.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">
        {Object.keys(byWeek).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">등록된 미션이 없습니다.</p>
          </div>
        )}
        {Object.entries(byWeek).map(([week, weekMissions]) => (
          <section key={week}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-500">Week {week}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex flex-col gap-3">
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
