export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cohort } from '@/types/database'

export default async function AdminHomePage() {
  const supabase = createServerClient()

  const cohortsResult = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false })
  const cohorts = (cohortsResult.data ?? []) as Cohort[]

  const activeCohort = cohorts.find(c => c.status === 'active')
  const activeCohortId = activeCohort?.id ?? ''

  const [studentCountResult, todayCountResult] = await Promise.all([
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', activeCohortId),
    supabase
      .from('attendances')
      .select('*', { count: 'exact', head: true })
      .eq('date', new Date().toLocaleDateString('sv-SE')),
  ])

  const studentCount = studentCountResult.count
  const todayCount = todayCountResult.count

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">대시보드 개요</h1>

      {activeCohort ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          활성 기수: <strong>{activeCohort.name}</strong>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          활성 기수가 없습니다.{' '}
          <Link href="/admin/cohorts" className="underline font-medium">기수를 생성하세요</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-neutral-500">현재 기수 수강생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{studentCount ?? 0}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-neutral-500">오늘 출석</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayCount ?? 0}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-neutral-500">전체 기수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cohorts.length}개</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/cohorts" className="block p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <h3 className="font-semibold">기수 관리 →</h3>
          <p className="text-sm text-neutral-500 mt-1">새 기수 생성, 종료, CSV 내보내기</p>
        </Link>
        <Link href="/admin/students" className="block p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <h3 className="font-semibold">수강생 관리 →</h3>
          <p className="text-sm text-neutral-500 mt-1">CSV 업로드, 인증코드 발급</p>
        </Link>
        <Link href="/admin/attendance" className="block p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <h3 className="font-semibold">출석 현황 →</h3>
          <p className="text-sm text-neutral-500 mt-1">미출석자 목록, 알림 멘트 생성</p>
        </Link>
        <Link href="/admin/missions" className="block p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <h3 className="font-semibold">미션 관리 →</h3>
          <p className="text-sm text-neutral-500 mt-1">미션 등록, Google Forms CSV 임포트</p>
        </Link>
      </div>
    </div>
  )
}
