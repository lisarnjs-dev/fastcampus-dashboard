import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ cohortId: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { cohortId } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('students')
    .select('dashboard_group')
    .eq('cohort_id', cohortId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups = [...new Set((data ?? []).map((s: { dashboard_group: string }) => s.dashboard_group))].sort()
  return NextResponse.json(groups)
}
