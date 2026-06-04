'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: '홈', exact: true },
  { href: '/admin/cohorts', label: '기수 관리' },
  { href: '/admin/students', label: '수강생 관리' },
  { href: '/admin/attendance', label: '출석 현황' },
  { href: '/admin/missions', label: '미션 관리' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-surface border-b border-bdr px-6 flex items-center gap-1">
      <span className="font-semibold text-txt-primary mr-5 py-3.5 shrink-0">
        Vibe Class 어드민
      </span>

      {navItems.map(item => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'px-3 py-3.5 text-sm border-b-2 transition-colors whitespace-nowrap',
              isActive
                ? 'text-brand border-brand font-medium'
                : 'text-txt-muted border-transparent hover:text-txt-primary hover:border-bdr',
            ].join(' ')}
          >
            {item.label}
          </Link>
        )
      })}

      <form action="/api/auth/logout" method="POST" className="ml-auto">
        <button
          type="submit"
          className="text-sm text-txt-placeholder hover:text-error transition-colors py-3.5 pl-4"
        >
          로그아웃
        </button>
      </form>
    </nav>
  )
}
