import Link from 'next/link'
import { getSession } from '@/lib/session'
import { hasCohortStarted } from '@/lib/date'
import { CohortStartGate } from '@/components/ui/CohortStartGate'
import type { Cohort } from '@/types/database'

interface Props {
  cohort: Cohort
  alreadyCheckedIn?: boolean
}

export async function TodayCheckinCard({ cohort, alreadyCheckedIn = false }: Props) {
  const session = await getSession()
  const student = session.student
  const started = hasCohortStarted(cohort.started_at)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {student ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">{student.name}님, 안녕하세요! 👋</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {alreadyCheckedIn
                ? '오늘 출석 인증을 완료하셨습니다! 🎉'
                : '오늘 출석 인증을 완료하셨나요?'}
            </p>
          </div>
          {alreadyCheckedIn ? (
            <button
              disabled
              data-testid="checkin-link"
              className="shrink-0 px-4 py-2.5 bg-success-subtle text-success-fg text-sm font-medium rounded-xl cursor-not-allowed"
            >
              출석 완료 ✓
            </button>
          ) : (
            <CohortStartGate
              started={started}
              startedAt={cohort.started_at}
              href="/checkin"
              dataTestId="checkin-link"
              className="shrink-0 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              출석 인증
            </CohortStartGate>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">출석 인증을 하려면 로그인하세요.</p>
          <Link
            href="/login"
            className="shrink-0 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            로그인
          </Link>
        </div>
      )}
    </div>
  )
}
