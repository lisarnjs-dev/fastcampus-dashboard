export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createServerClient()

  const cohortResult = await supabase
    .from('cohorts')
    .select('id')
    .eq('status', 'active')
    .maybeSingle()
  const activeCohort = cohortResult.data as { id: string } | null

  if (!activeCohort) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-neutral-900">Vibe Class</h1>
          <p className="text-neutral-500">현재 진행 중인 기수가 없습니다.</p>
        </div>
      </div>
    )
  }

  const firstGroupResult = await supabase
    .from('students')
    .select('dashboard_group')
    .eq('cohort_id', activeCohort.id)
    .order('dashboard_group', { ascending: true })
    .limit(1)
    .maybeSingle()
  const firstGroup = firstGroupResult.data as { dashboard_group: string } | null

  redirect(`/dashboard/${firstGroup?.dashboard_group ?? 'A'}`)
}
