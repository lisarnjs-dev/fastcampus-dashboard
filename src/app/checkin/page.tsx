export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { CheckinForm } from '@/components/checkin/CheckinForm'
import { createServerClient } from '@/lib/supabase/server'
import { hasCohortStarted } from '@/lib/date'

export default async function CheckinPage() {
  const session = await getSession()
  if (!session.student) redirect('/login')

  const { studentId, cohortId, dashboardGroup } = session.student
  const today = new Date().toLocaleDateString('sv-SE')

  const supabase = createServerClient()

  const { data: cohort } = await supabase
    .from('cohorts').select('started_at').eq('id', cohortId).maybeSingle()

  if (cohort && !hasCohortStarted(cohort.started_at)) {
    const startDateLabel = new Date(cohort.started_at).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center" data-testid="cohort-not-started-notice">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl" aria-hidden="true">📅</span>
          </div>
          <h2 className="font-semibold text-gray-900 mb-1.5">아직 기수가 시작되지 않았습니다</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            기수 시작일은 <strong className="text-gray-700">{startDateLabel}</strong>입니다.
            <br />시작일부터 출석 인증이 가능합니다.
          </p>
          <a
            href={`/dashboard/${dashboardGroup}`}
            className="block w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            대시보드로 돌아가기
          </a>
        </div>
      </div>
    )
  }

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
