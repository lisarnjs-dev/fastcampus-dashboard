import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { verifyStudentCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { name, authCode } = await request.json()

  if (!name || !authCode) {
    return NextResponse.json({ error: '이름과 인증코드를 입력해주세요' }, { status: 400 })
  }

  const student = await verifyStudentCredentials(name, authCode)
  if (!student) {
    return NextResponse.json({ error: '이름 또는 인증코드가 올바르지 않습니다' }, { status: 401 })
  }

  const session = await getSession()
  session.student = {
    studentId: student.id,
    cohortId: student.cohort_id,
    dashboardGroup: student.dashboard_group,
    name: student.name,
  }
  await session.save()

  return NextResponse.json({ group: student.dashboard_group })
}
