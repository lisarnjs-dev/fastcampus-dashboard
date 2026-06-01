import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-neutral-900">Vibe Class 어드민</span>
        <Link href="/admin" className="text-sm text-neutral-600 hover:text-neutral-900">홈</Link>
        <Link href="/admin/cohorts" className="text-sm text-neutral-600 hover:text-neutral-900">기수 관리</Link>
        <Link href="/admin/students" className="text-sm text-neutral-600 hover:text-neutral-900">수강생 관리</Link>
        <Link href="/admin/attendance" className="text-sm text-neutral-600 hover:text-neutral-900">출석 현황</Link>
        <Link href="/admin/missions" className="text-sm text-neutral-600 hover:text-neutral-900">미션 관리</Link>
        <form action="/api/auth/logout" method="POST" className="ml-auto">
          <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">로그아웃</button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
