'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  groups: string[]
}

export function GroupSelector({ groups }: Props) {
  const pathname = usePathname()
  const currentGroup = pathname.split('/').pop() ?? ''

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map(g => (
        <Link
          key={g}
          href={`/dashboard/${g}`}
          data-testid={`group-tab-${g}`}
          className={[
            'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
            currentGroup === g
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600',
          ].join(' ')}
        >
          그룹 {g}
        </Link>
      ))}
    </div>
  )
}
