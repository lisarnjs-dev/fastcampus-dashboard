import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.student) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { message } = await request.json()
  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ error: '출석 메시지는 10자 이상 입력하세요' }, { status: 400 })
  }

  const { studentId, cohortId } = session.student
  const today = new Date().toLocaleDateString('sv-SE')

  const supabase = createServerClient()
  const { error } = await supabase.from('attendances').insert({
    student_id: studentId,
    cohort_id: cohortId,
    date: today,
    message: message.trim(),
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '오늘 이미 출석하셨습니다' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session.student) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { studentId } = session.student
  const today = new Date().toLocaleDateString('sv-SE')

  const supabase = createServerClient()
  const { data } = await supabase
    .from('attendances')
    .select('id, message, created_at')
    .eq('student_id', studentId)
    .eq('date', today)
    .maybeSingle()

  return NextResponse.json({ attendance: data })
}
