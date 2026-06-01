import { SessionOptions, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface AdminSessionData {
  isAdmin: boolean
}

export interface StudentSessionData {
  studentId: string
  cohortId: string
  dashboardGroup: string
  name: string
}

export interface SessionData {
  admin?: AdminSessionData
  student?: StudentSessionData
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'vibe-class-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
