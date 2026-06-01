import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Cohort } from '@/types/database'

export async function GET() {
  const supabase = createServerClient()
  const result = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false })

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json(result.data as Cohort[])
}

export async function POST(request: NextRequest) {
  const { name, action, cohortId } = await request.json()
  const supabase = createServerClient()

  if (action === 'end') {
    const { error } = await supabase
      .from('cohorts')
      .update({ status: 'archived', ended_at: new Date().toISOString() })
      .eq('id', cohortId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: '기수명을 입력하세요' }, { status: 400 })
  }

  const existingResult = await supabase
    .from('cohorts')
    .select('id')
    .eq('status', 'active')
    .maybeSingle()
  const existing = existingResult.data as { id: string } | null

  if (existing) {
    return NextResponse.json({ error: '활성 기수가 이미 존재합니다. 먼저 종료하세요.' }, { status: 409 })
  }

  const insertResult = await supabase
    .from('cohorts')
    .insert({ name: name.trim(), status: 'active' })
    .select()
    .single()

  if (insertResult.error) return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  return NextResponse.json(insertResult.data as Cohort, { status: 201 })
}
