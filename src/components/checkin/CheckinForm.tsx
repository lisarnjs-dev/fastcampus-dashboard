'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <Card data-testid="checkin-success">
        <CardHeader>
          <CardTitle className="text-green-700">출석 완료!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingMessage && (
            <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">{existingMessage}</p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/dashboard/${dashboardGroup}`)}
          >
            대시보드로 돌아가기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>출석 인증</CardTitle>
        <p className="text-sm text-neutral-500">오늘의 학습 인증 메시지를 작성하세요 (10자 이상)</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="checkin-form">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="오늘 배운 내용이나 느낀 점을 작성해 주세요..."
            rows={4}
            className="resize-none"
            data-testid="checkin-message"
          />
          <p className="text-xs text-neutral-400 text-right">{message.length}자</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="checkin-submit"
          >
            {loading ? '제출 중...' : '출석 인증 제출'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
