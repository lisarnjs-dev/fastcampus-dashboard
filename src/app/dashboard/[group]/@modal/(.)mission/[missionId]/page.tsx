export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MissionDetailModal } from '@/components/dashboard/MissionDetailModal'
import { MissionDetailContent } from '@/components/dashboard/MissionDetailContent'
import type { Mission, MissionSubmission, Student } from '@/types/database'

interface Props {
  params: Promise<{ group: string; missionId: string }>
}

export default async function MissionModalPage({ params }: Props) {
  const { group, missionId } = await params
  const supabase = createServerClient()

  const [missionResult, submissionsResult] = await Promise.all([
    supabase.from('missions').select('*').eq('id', missionId).single(),
    supabase.from('mission_submissions').select('student_id').eq('mission_id', missionId),
  ])

  const mission = missionResult.data as Mission | null
  if (!mission) notFound()

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
    <MissionDetailModal>
      <MissionDetailContent mission={mission} group={group} students={studentsWithStatus} />
    </MissionDetailModal>
  )
}
