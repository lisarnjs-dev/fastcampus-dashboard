export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { AttendanceOverview } from '@/components/admin/AttendanceOverview'
import type { Cohort, Student, Attendance } from '@/types/database'

function toKSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export default async function AdminAttendancePage() {
  const supabase = createServerClient()

  const cohortResult = await supabase
    .from('cohorts')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  const activeCohort = cohortResult.data as Cohort | null

  if (!activeCohort) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">출석 현황</h1>
        <p className="text-amber-700 text-sm">활성 기수가 없습니다.</p>
      </div>
    )
  }

  const today = toKSTDateString(new Date())
  const cohortId = activeCohort.id

  const studentsResult = await supabase
    .from('students')
    .select('id, name, dashboard_group')
    .eq('cohort_id', cohortId)
    .order('dashboard_group')
    .order('name')
  const students = (studentsResult.data ?? []) as Pick<Student, 'id' | 'name' | 'dashboard_group'>[]

  const attendancesResult = await supabase
    .from('attendances')
    .select('student_id')
    .eq('cohort_id', cohortId)
    .eq('date', today)
  const todayAttendances = (attendancesResult.data ?? []) as Pick<Attendance, 'student_id'>[]

  const presentIds = new Set(todayAttendances.map(a => a.student_id))
  const todayLabel = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">출석 현황</h1>
          <p className="text-sm text-neutral-500 mt-1">{activeCohort.name}</p>
        </div>
        <a
          href={`/api/admin/attendance?export=csv&cohort_id=${activeCohort.id}`}
          className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          data-testid="export-attendance-csv"
        >
          CSV 내보내기
        </a>
      </div>

      <AttendanceOverview
        presentIds={presentIds}
        students={students}
        cohortName={activeCohort.name}
        todayLabel={todayLabel}
      />
    </div>
  )
}
