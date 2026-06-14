'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'

export function MissionDetailModal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleClose = useCallback(() => router.back(), [router])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto z-10">
        <button
          onClick={handleClose}
          aria-label="닫기"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-txt-muted hover:bg-page transition-colors text-lg"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
