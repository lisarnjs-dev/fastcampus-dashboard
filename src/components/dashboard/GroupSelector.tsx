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
          className={[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            currentGroup === g
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
          ].join(' ')}
          data-testid={`group-tab-${g}`}
        >
          그룹 {g}
        </Link>
      ))}
    </div>
  )
}
