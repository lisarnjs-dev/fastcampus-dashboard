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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-4">
          {/* BackButton은 client component이므로 dynamic import 없이 바로 사용 */}
          <a href={`/dashboard/${dashboardGroup}`} className="text-sm text-neutral-500 hover:text-neutral-800">← 뒤로</a>
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
