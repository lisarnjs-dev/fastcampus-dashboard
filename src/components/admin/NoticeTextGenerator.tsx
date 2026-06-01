'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  absentNames: string[]
  cohortName: string
}

export function NoticeTextGenerator({ absentNames, cohortName }: Props) {
  const [copied, setCopied] = useState(false)

  if (absentNames.length === 0) return null

  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const text = `[${cohortName} 출석 안내 — ${today}]\n\n아직 출석 인증을 하지 않은 수강생입니다:\n${absentNames.map(n => `• ${n}`).join('\n')}\n\n출석 인증을 완료해 주세요!`

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">단톡방 안내 멘트</h3>
      <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm whitespace-pre-wrap font-sans text-neutral-700">
        {text}
      </pre>
      <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="copy-notice">
        {copied ? '복사됨 ✓' : '클립보드 복사'}
      </Button>
    </div>
  )
}
