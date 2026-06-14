import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session.student) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { studentId, cohortId } = session.student
  const supabase = createServerClient()

  const cohortResult = await supabase
    .from('cohorts')
    .select('started_at, planned_end_at, ended_at')
    .eq('id', cohortId)
    .single()

  if (cohortResult.error) {
    return NextResponse.json({ error: cohortResult.error.message }, { status: 500 })
  }

  const { started_at, planned_end_at, ended_at } = cohortResult.data
  const attendancesResult = await supabase
    .from('attendances')
    .select('date')
    .eq('student_id', studentId)
    .eq('cohort_id', cohortId)
    .order('date', { ascending: true })

  if (attendancesResult.error) {
    return NextResponse.json({ error: attendancesResult.error.message }, { status: 500 })
  }

  const attendedDates = new Set((attendancesResult.data ?? []).map(a => a.date))

  return NextResponse.json({
    started_at,
    planned_end_at,
    ended_at,
    attendedDates: Array.from(attendedDates),
  })
}
