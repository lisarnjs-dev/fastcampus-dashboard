'use client'

import Link from 'next/link'

interface Props {
  isLoggedIn: boolean
}

export function LoginRequiredGate({ isLoggedIn }: Props) {
  if (isLoggedIn) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      data-testid="login-required-modal"
    >
      <div
        className="bg-surface rounded-2xl shadow-lg p-6 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        aria-describedby="login-required-desc"
      >
        <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl" aria-hidden="true">🔐</span>
        </div>
        <h2 id="login-required-title" className="font-semibold text-txt-primary mb-1.5">
          로그인이 필요합니다
        </h2>
        <p id="login-required-desc" className="text-sm text-txt-muted mb-5 leading-relaxed">
          출석 인증과 미션 제출을 위해<br />먼저 로그인해 주세요.
        </p>
        <Link
          href="/login"
          data-testid="login-required-cta"
          autoFocus
          className="block w-full py-2.5 bg-brand text-brand-fg text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
        >
          로그인하기
        </Link>
      </div>
    </div>
  )
}
