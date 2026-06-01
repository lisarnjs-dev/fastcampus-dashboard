import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateAuthCode, assignGroup } from '@/lib/auth-code'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')

  const supabase = createServerClient()
  let query = supabase
    .from('students')
    .select('id, name, auth_code, dashboard_group, cohort_id, created_at')
    .order('dashboard_group', { ascending: true })
    .order('name', { ascending: true })

  if (cohortId) {
    query = query.eq('cohort_id', cohortId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('action') === 'delete') {
    const { studentId } = await request.json()
    const supabase = createServerClient()
    const { error } = await supabase.from('students').delete().eq('id', studentId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const { cohortId, names } = await request.json() as { cohortId: string; names: string[] }

  if (!cohortId) return NextResponse.json({ error: 'cohortId required' }, { status: 400 })
  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: '이름 목록이 비어있습니다' }, { status: 400 })
  }

  const supabase = createServerClient()

  const sorted = [...names].sort()
  const studentsToInsert = []
  const usedCodes = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    const name = sorted[i].trim()
    if (!name) continue

    let code = generateAuthCode()
    while (usedCodes.has(code)) {
      code = generateAuthCode()
    }
    usedCodes.add(code)

    studentsToInsert.push({
      cohort_id: cohortId,
      name,
      auth_code: code,
      dashboard_group: assignGroup(i),
    })
  }

  const { data, error } = await supabase
    .from('students')
    .insert(studentsToInsert)
    .select('name, auth_code, dashboard_group')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const csv = ['이름,인증코드,대시보드그룹']
  for (const s of data) {
    csv.push(`${s.name},${s.auth_code},${s.dashboard_group}`)
  }

  return new NextResponse(csv.join('\n'), {
    status: 201,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="students.csv"',
    },
  })
}
