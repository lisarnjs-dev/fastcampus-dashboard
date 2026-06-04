'use client'

import { useRouter } from 'next/navigation'

interface Props {
  href?: string
  label?: string
}

export function BackButton({ href, label = '← 뒤로' }: Props) {
  const router = useRouter()

  function handleClick() {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-[12px] text-black/40 hover:text-black/70 transition-colors"
      data-testid="back-button"
    >
      {label}
    </button>
  )
}
