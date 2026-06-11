'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  started: boolean
  startedAt: string | null
  href: string
  external?: boolean
  className?: string
  dataTestId?: string
  children: React.ReactNode
}

/**
 * 기수 시작 전에는 클릭 시 이동 대신 안내 모달을 띄우는 링크 래퍼.
 * 출석 인증 / 미션 제출 버튼에 사용한다.
 */
export function CohortStartGate({ started, startedAt, href, external, className, dataTestId, children }: Props) {
  const [showModal, setShowModal] = useState(false)

  function handleClick(e: React.MouseEvent) {
    if (!started) {
      e.preventDefault()
      setShowModal(true)
    }
  }

  const startDateLabel = startedAt
    ? new Date(startedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={className}
          data-testid={dataTestId}
        >
          {children}
        </a>
      ) : (
        <Link href={href} onClick={handleClick} className={className} data-testid={dataTestId}>
          {children}
        </Link>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setShowModal(false)}
          data-testid="cohort-not-started-modal"
        >
          <div
            className="bg-surface rounded-2xl shadow-lg p-6 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cohort-not-started-title"
          >
            <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl" aria-hidden="true">📅</span>
            </div>
            <h2 id="cohort-not-started-title" className="font-semibold text-txt-primary mb-1.5">
              아직 기수가 시작되지 않았습니다
            </h2>
            <p className="text-sm text-txt-muted mb-5 leading-relaxed">
              {startDateLabel
                ? <>기수 시작일은 <strong className="text-txt-secondary">{startDateLabel}</strong>입니다.<br />시작일부터 출석 인증과 미션 제출이 가능합니다.</>
                : '시작일부터 출석 인증과 미션 제출이 가능합니다.'}
            </p>
            <button
              onClick={() => setShowModal(false)}
              data-testid="cohort-not-started-close"
              className="w-full py-2.5 bg-brand text-brand-fg text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  )
}
