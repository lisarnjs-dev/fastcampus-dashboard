import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Cohort } from '@/types/database'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('cohorts')
    .select('id, name, status, started_at')
    .eq('status', 'active')
    .order('started_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data as Cohort[])
}
