import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { verifyAdminCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: '로그인 실패' }, { status: 401 })
  }

  const valid = await verifyAdminCredentials(username, password)
  if (!valid) {
    return NextResponse.json({ error: '로그인 실패' }, { status: 401 })
  }

  const session = await getSession()
  session.admin = { isAdmin: true }
  await session.save()

  return NextResponse.json({ ok: true })
}
