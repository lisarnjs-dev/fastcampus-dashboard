'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      data-testid="logout-button"
      className="text-xs text-txt-muted border border-bdr rounded-lg px-2.5 py-1 hover:border-brand hover:text-brand transition-all disabled:opacity-50"
    >
      {isLoading ? '...' : '로그아웃'}
    </button>
  )
}
