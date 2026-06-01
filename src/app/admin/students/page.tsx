export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { StudentCsvUpload } from '@/components/admin/StudentCsvUpload'
import { StudentList } from '@/components/admin/StudentList'
import type { Cohort, Student } from '@/types/database'

export default async function StudentsPage() {
  const supabase = createServerClient()

  const cohortsResult = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false })
  const cohorts = (cohortsResult.data ?? []) as Cohort[]

  const studentsResult = await supabase
    .from('students')
    .select('*')
    .order('dashboard_group', { ascending: true })
    .order('name', { ascending: true })
  const students = (studentsResult.data ?? []) as Student[]

  const activeCohort = cohorts.find(c => c.status === 'active') ?? null
  const activeStudents = activeCohort
    ? students.filter(s => s.cohort_id === activeCohort.id)
    : []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">수강생 관리</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">CSV 업로드</h2>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 max-w-lg">
          <StudentCsvUpload activeCohort={activeCohort} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          수강생 목록{activeCohort ? ` — ${activeCohort.name}` : ''}
        </h2>
        <StudentList students={activeStudents} />
      </section>
    </div>
  )
}
