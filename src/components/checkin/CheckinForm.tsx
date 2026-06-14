'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  alreadyCheckedIn: boolean
  existingMessage?: string
  dashboardGroup: string
}

export function CheckinForm({ alreadyCheckedIn, existingMessage, dashboardGroup }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(alreadyCheckedIn)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 10) {
      setError('출석 메시지는 10자 이상 입력하세요')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
    } else {
      const { error: msg } = await res.json()
      setError(msg)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center" data-testid="checkin-success">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-500 text-2xl">✓</span>
        </div>
        <h2 className="font-semibold text-gray-900 mb-1">출석 완료!</h2>
        <p className="text-sm text-gray-500 mb-4">오늘의 출석이 기록되었습니다.</p>
        {existingMessage && (
          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3 text-left mb-4 leading-relaxed">
            {existingMessage}
          </p>
        )}
        <button
          onClick={() => router.push(`/dashboard/${dashboardGroup}`)}
          className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-1">오늘의 학습 인증</h2>
      <p className="text-sm text-gray-500 mb-5">배운 내용이나 느낀 점을 10자 이상 작성하세요.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="checkin-form">
        <div className="relative">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="오늘 배운 내용이나 느낀 점을 작성해 주세요..."
            rows={5}
            data-testid="checkin-message"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all resize-none leading-relaxed"
          />
          <span className={`absolute bottom-3 right-3 text-xs transition-colors ${message.length >= 10 ? 'text-emerald-500' : 'text-gray-300'}`}>
            {message.length}자
          </span>
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          data-testid="checkin-submit"
          className="w-full py-3 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '제출 중...' : '출석 인증 제출'}
        </button>
      </form>
    </div>
  )
}
