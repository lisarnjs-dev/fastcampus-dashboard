export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { MissionManager } from '@/components/admin/MissionManager'
import { GoogleFormsCsvImport } from '@/components/admin/GoogleFormsCsvImport'
import type { Cohort, Mission } from '@/types/database'

export default async function AdminMissionsPage() {
  const supabase = createServerClient()

  const cohortResult = await supabase
    .from('cohorts')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  const activeCohort = cohortResult.data as Cohort | null

  let missions: Mission[] = []
  if (activeCohort) {
    const missionsResult = await supabase
      .from('missions')
      .select('*')
      .eq('cohort_id', activeCohort.id)
      .order('week', { ascending: true })
      .order('created_at', { ascending: true })
    missions = (missionsResult.data ?? []) as Mission[]
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-neutral-900">미션 관리</h1>
      <MissionManager missions={missions} activeCohort={activeCohort} />
      <hr className="border-neutral-200" />
      <GoogleFormsCsvImport missions={missions} />
    </div>
  )
}
