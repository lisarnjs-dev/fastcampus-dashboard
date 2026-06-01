import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { missionId, names } = body as { missionId: string; names: string[] }

  if (!missionId || !Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: 'missionId와 names가 필요합니다' }, { status: 400 })
  }

  const supabase = createServerClient()

  const missionResult = await supabase
    .from('missions')
    .select('cohort_id')
    .eq('id', missionId)
    .single()
  const mission = missionResult.data as { cohort_id: string } | null

  if (!mission) return NextResponse.json({ error: '미션을 찾을 수 없습니다' }, { status: 404 })

  const studentsResult = await supabase
    .from('students')
    .select('id, name')
    .eq('cohort_id', mission.cohort_id)
  const students = studentsResult.data as { id: string; name: string }[] | null

  const studentMap = new Map<string, string>()
  for (const s of students ?? []) {
    studentMap.set(normalizeName(s.name), s.id)
  }

  const matched: string[] = []
  const unmatched: string[] = []

  for (const name of names) {
    const studentId = studentMap.get(normalizeName(name))
    if (studentId) {
      matched.push(studentId)
    } else {
      unmatched.push(name)
    }
  }

  if (matched.length > 0) {
    const submissions = matched.map(studentId => ({
      mission_id: missionId,
      student_id: studentId,
      submitted_at: new Date().toISOString(),
      imported_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('mission_submissions')
      .upsert(submissions, { onConflict: 'mission_id,student_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    matched: matched.length,
    unmatched,
  })
}
