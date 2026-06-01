import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Student, Attendance } from '@/types/database'

function toKSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')
  const exportCsv = searchParams.get('export') === 'csv'

  if (!cohortId) return NextResponse.json({ error: 'cohort_id required' }, { status: 400 })

  const supabase = createServerClient()

  const studentsResult = await supabase
    .from('students')
    .select('id, name, dashboard_group')
    .eq('cohort_id', cohortId)
    .order('dashboard_group')
    .order('name')
  const students = studentsResult.data as Pick<Student, 'id' | 'name' | 'dashboard_group'>[] | null

  if (!students) return NextResponse.json({ error: '수강생 없음' }, { status: 404 })

  if (exportCsv) {
    // Full pivot CSV: students × dates
    const attendancesResult = await supabase
      .from('attendances')
      .select('student_id, date')
      .eq('cohort_id', cohortId)
      .order('date')
    const attendances = attendancesResult.data as Pick<Attendance, 'student_id' | 'date'>[] | null

    const attendanceSet = new Set<string>(
      (attendances ?? []).map(a => `${a.student_id}|${a.date}`)
    )

    const allDates = [...new Set((attendances ?? []).map(a => a.date))].sort()

    const header = ['이름', '그룹', ...allDates]
    const rows = students.map(s => [
      s.name,
      s.dashboard_group,
      ...allDates.map(d => (attendanceSet.has(`${s.id}|${d}`) ? 'O' : 'X')),
    ])

    const csvLines = [header, ...rows].map(r => r.join(','))
    const csv = '﻿' + csvLines.join('\r\n') // BOM for Excel
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendance_${cohortId}.csv"`,
      },
    })
  }

  // Default: today's attendance summary
  const today = toKSTDateString(new Date())
  const todayAttendancesResult = await supabase
    .from('attendances')
    .select('student_id')
    .eq('cohort_id', cohortId)
    .eq('date', today)
  const todayAttendances = todayAttendancesResult.data as Pick<Attendance, 'student_id'>[] | null

  const presentIds = new Set((todayAttendances ?? []).map(a => a.student_id))

  return NextResponse.json({
    date: today,
    students,
    presentIds: [...presentIds],
  })
}
