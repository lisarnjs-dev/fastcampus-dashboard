import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function parseWeekNumber(weekStr: string): number | null {
  const match = weekStr.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '')
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.WEBHOOK_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cohortId = request.nextUrl.searchParams.get('cohort_id')
  if (!cohortId) {
    return NextResponse.json({ error: 'cohort_id required' }, { status: 400 })
  }

  const body = await request.json() as { name?: string; week?: string; timestamp?: string }
  const name = body.name?.trim() ?? ''
  const weekStr = body.week?.trim() ?? ''

  if (!name || !weekStr) {
    return NextResponse.json({ error: 'name and week are required' }, { status: 400 })
  }

  const weekNumber = parseWeekNumber(weekStr)
  if (!weekNumber) {
    return NextResponse.json({ error: `Could not parse week number from "${weekStr}"` }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, name, dashboard_group')
    .eq('cohort_id', cohortId)

  const student = (students ?? []).find(s => normalizeName(s.name) === normalizeName(name))
  if (!student) {
    return NextResponse.json({ error: `Student "${name}" not found in cohort` }, { status: 404 })
  }

  const { data: missions } = await supabase
    .from('missions')
    .select('id, dashboard_group')
    .eq('cohort_id', cohortId)
    .eq('week', weekNumber)

  // 학생 그룹에 맞는 미션 우선, 없으면 전체 공개 미션, 그것도 없으면 첫 번째
  const mission =
    (missions ?? []).find(m => m.dashboard_group === student.dashboard_group) ??
    (missions ?? []).find(m => !m.dashboard_group) ??
    missions?.[0]

  if (!mission) {
    return NextResponse.json({ error: `Week ${weekNumber} mission not found` }, { status: 404 })
  }

  const submittedAt = body.timestamp
    ? new Date(body.timestamp).toISOString()
    : new Date().toISOString()

  const { error } = await supabase
    .from('mission_submissions')
    .upsert(
      { mission_id: mission.id, student_id: student.id, submitted_at: submittedAt, imported_at: new Date().toISOString() },
      { onConflict: 'mission_id,student_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, student: student.name, week: weekNumber })
}
