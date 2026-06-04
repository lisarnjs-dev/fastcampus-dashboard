export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { CheckinForm } from '@/components/checkin/CheckinForm'
import { createServerClient } from '@/lib/supabase/server'

export default async function CheckinPage() {
  const session = await getSession()
  if (!session.student) redirect('/login')

  const { studentId, dashboardGroup } = session.student
  const today = new Date().toLocaleDateString('sv-SE')

  const supabase = createServerClient()
  const { data: existing } = await supabase
    .from('attendances')
    .select('id, message, created_at')
    .eq('student_id', studentId)
    .eq('date', today)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <a
            href={`/dashboard/${dashboardGroup}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← 대시보드로
          </a>
        </div>
        <CheckinForm
          alreadyCheckedIn={!!existing}
          existingMessage={existing?.message}
          dashboardGroup={dashboardGroup}
        />
      </div>
    </div>
  )
}
