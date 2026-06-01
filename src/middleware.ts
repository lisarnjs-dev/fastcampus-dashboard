import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData } from './lib/session'

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'vibe-class-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const response = NextResponse.next()
    const session = await getIronSession<SessionData>(request, response, sessionOptions)
    if (!session.admin?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

  if (pathname === '/checkin') {
    const response = NextResponse.next()
    const session = await getIronSession<SessionData>(request, response, sessionOptions)
    if (!session.student?.studentId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/checkin'],
}
