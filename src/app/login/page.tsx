'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/ui/BackButton'

export default function StudentLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        authCode: form.get('authCode'),
      }),
    })

    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      router.push(`/dashboard/${group}`)
    } else {
      setError('이름 또는 인증코드가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <BackButton href="/" />
          <CardTitle className="text-xl">수강생 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="student-login-form">
            <div className="space-y-1">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                required
                data-testid="student-name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="authCode">인증코드</Label>
              <Input
                id="authCode"
                name="authCode"
                type="text"
                placeholder="예: AB3X7K9M"
                required
                className="font-mono uppercase"
                data-testid="student-auth-code"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" data-testid="student-login-error">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading} data-testid="student-login-submit">
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
