export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MissionDetailContent } from '@/components/dashboard/MissionDetailContent'
import { hasCohortStarted } from '@/lib/date'
import type { Cohort, Mission, MissionSubmission, Student } from '@/types/database'

interface Props {
  params: Promise<{ group: string; missionId: string }>
}

export default async function MissionDetailPage({ params }: Props) {
  const { group, missionId } = await params
  const supabase = createServerClient()

  const [missionResult, submissionsResult] = await Promise.all([
    supabase.from('missions').select('*').eq('id', missionId).single(),
    supabase.from('mission_submissions').select('student_id').eq('mission_id', missionId),
  ])

  const mission = missionResult.data as Mission | null
  if (!mission) notFound()

  const cohortResult = await supabase
    .from('cohorts').select('started_at').eq('id', mission.cohort_id).maybeSingle()
  const cohort = cohortResult.data as Pick<Cohort, 'started_at'> | null

  const studentsResult = await supabase
    .from('students')
    .select('id, name')
    .eq('cohort_id', mission.cohort_id)
    .eq('dashboard_group', group)
    .order('name')
  const students = (studentsResult.data ?? []) as Pick<Student, 'id' | 'name'>[]

  const submittedIds = new Set(
    ((submissionsResult.data ?? []) as Pick<MissionSubmission, 'student_id'>[]).map(s => s.student_id)
  )

  const studentsWithStatus = students.map(s => ({ ...s, submitted: submittedIds.has(s.id) }))

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-surface border-b border-bdr">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <a
              href={`/dashboard/${group}`}
              className="text-txt-muted hover:text-txt-primary transition-colors text-sm"
            >
              ←
            </a>
            <h1 className="font-semibold text-txt-primary">미션 상세</h1>
          </div>
        </div>
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-surface border-x border-b border-bdr min-h-screen">
          <MissionDetailContent
            mission={mission}
            group={group}
            students={studentsWithStatus}
            cohortStarted={hasCohortStarted(cohort?.started_at ?? null)}
            cohortStartedAt={cohort?.started_at ?? null}
          />
        </div>
      </div>
    </div>
  )
}
