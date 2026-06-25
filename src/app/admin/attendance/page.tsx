export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { AttendanceOverview } from '@/components/admin/AttendanceOverview'
import { AttendanceDateNav } from '@/components/admin/AttendanceDateNav'
import { generateDateRange } from '@/lib/date'
import type { Cohort, Student, Attendance } from '@/types/database'

function toKSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function isValidDate(str: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const date = new Date(y, m - 1, d)
  return date.getMonth() === m - 1 && date.getDate() === d
}

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: requestedDate } = await searchParams
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

  const todayKST = toKSTDateString(new Date())
  const cohortId = activeCohort.id

  const cohortStart = activeCohort.started_at.slice(0, 10)
  const dateRangeEnd = activeCohort.ended_at?.slice(0, 10)
    ?? activeCohort.planned_end_at?.slice(0, 10)
    ?? todayKST

  const dates = generateDateRange(cohortStart, dateRangeEnd)

  const selectedDate =
    requestedDate && isValidDate(requestedDate) && dates.includes(requestedDate)
      ? requestedDate
      : todayKST

  const studentsResult = await supabase
    .from('students')
    .select('id, name, dashboard_group')
    .eq('cohort_id', cohortId)
    .order('dashboard_group')
    .order('name')
  const students = (studentsResult.data ?? []) as Pick<Student, 'id' | 'name' | 'dashboard_group'>[]

  const attendancesResult = await supabase
    .from('attendances')
    .select('student_id, message')
    .eq('cohort_id', cohortId)
    .eq('date', selectedDate)
  const dateAttendances = (attendancesResult.data ?? []) as Pick<Attendance, 'student_id' | 'message'>[]

  const presentIds = new Set(dateAttendances.map(a => a.student_id))
  const attendanceMessages = Object.fromEntries(dateAttendances.map(a => [a.student_id, a.message]))
  const dateLabel = new Date(selectedDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })

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

      <AttendanceDateNav dates={dates} selectedDate={selectedDate} todayKST={todayKST} />

      <AttendanceOverview
        presentIds={presentIds}
        attendanceMessages={attendanceMessages}
        students={students}
        cohortName={activeCohort.name}
        dateLabel={dateLabel}
      />
    </div>
  )
}
