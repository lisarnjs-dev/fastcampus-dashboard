export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { CohortManager } from '@/components/admin/CohortManager'

export default async function CohortsPage() {
  const supabase = createServerClient()
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">기수 관리</h1>
      <CohortManager cohorts={cohorts ?? []} />
    </div>
  )
}
