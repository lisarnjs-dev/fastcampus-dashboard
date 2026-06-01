'use client'

import { useRouter } from 'next/navigation'
import { Button } from './button'

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="text-neutral-500 hover:text-neutral-800 -ml-2"
      data-testid="back-button"
    >
      {label}
    </Button>
  )
}
