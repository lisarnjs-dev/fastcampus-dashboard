import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Mission, Student, MissionSubmission } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')
  const exportCsv = searchParams.get('export') === 'csv'

  const supabase = createServerClient()
  let query = supabase
    .from('missions')
    .select('*')
    .order('week', { ascending: true })
    .order('created_at', { ascending: true })

  if (cohortId) query = query.eq('cohort_id', cohortId)

  const missionsResult = await query
  if (missionsResult.error) return NextResponse.json({ error: missionsResult.error.message }, { status: 500 })
  const missions = missionsResult.data as Mission[]

  if (!exportCsv) return NextResponse.json(missions)

  if (!cohortId) return NextResponse.json({ error: 'cohort_id required for CSV export' }, { status: 400 })

  // CSV export: missions × students pivot
  const studentsResult = await supabase
    .from('students')
    .select('id, name, dashboard_group')
    .eq('cohort_id', cohortId)
    .order('dashboard_group')
    .order('name')
  const students = studentsResult.data as Pick<Student, 'id' | 'name' | 'dashboard_group'>[] | null

  const submissionsResult = await supabase
    .from('mission_submissions')
    .select('mission_id, student_id')
    .in('mission_id', missions.map(m => m.id))
  const submissions = submissionsResult.data as Pick<MissionSubmission, 'mission_id' | 'student_id'>[] | null

  const submissionSet = new Set<string>(
    (submissions ?? []).map(s => `${s.mission_id}|${s.student_id}`)
  )

  const missionHeaders = missions.map(m => `W${m.week} ${m.title}`)
  const header = ['이름', '그룹', ...missionHeaders]
  const rows = (students ?? []).map(s => [
    s.name,
    s.dashboard_group,
    ...missions.map(m => (submissionSet.has(`${m.id}|${s.id}`) ? 'O' : 'X')),
  ])

  const csvLines = [header, ...rows].map(r => r.join(','))
  const csv = '﻿' + csvLines.join('\r\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="missions_${cohortId}.csv"`,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { cohortId, week, title, description, dueAt, googleFormUrl, dashboardGroup } = body

  if (!cohortId || !week || !title?.trim()) {
    return NextResponse.json({ error: 'cohortId, week, title이 필요합니다' }, { status: 400 })
  }

  const supabase = createServerClient()
  const insertResult = await supabase
    .from('missions')
    .insert({
      cohort_id: cohortId,
      week: Number(week),
      title: title.trim(),
      description: description?.trim() || null,
      due_at: dueAt || null,
      google_form_url: googleFormUrl?.trim() || null,
      dashboard_group: dashboardGroup?.trim() || null,
    })
    .select()
    .single()

  if (insertResult.error) return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  return NextResponse.json(insertResult.data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const missionId = searchParams.get('id')
  if (!missionId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServerClient()
  const { error } = await supabase.from('missions').delete().eq('id', missionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
