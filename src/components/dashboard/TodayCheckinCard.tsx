import Link from 'next/link'
import { getSession } from '@/lib/session'

export async function TodayCheckinCard() {
  const session = await getSession()
  const student = session.student

  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
      {student ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{student.name}님, 안녕하세요!</p>
            <p className="text-sm text-neutral-500">오늘 출석 인증을 하셨나요?</p>
          </div>
          <Link
            href="/checkin"
            className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
            data-testid="checkin-link"
          >
            출석 인증
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">출석 인증을 하려면 로그인하세요.</p>
          <Link
            href="/login"
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
          >
            로그인
          </Link>
        </div>
      )}
    </div>
  )
}
