'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cohort } from '@/types/database'

type Step = 'cohort' | 'group' | 'login'

export default function HomePage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('cohort')
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/cohorts')
      .then(r => r.json())
      .then(setCohorts)
  }, [])

  async function selectCohort(cohort: Cohort) {
    setSelectedCohort(cohort)
    setLoading(true)
    const res = await fetch(`/api/cohorts/${cohort.id}/groups`)
    const data = await res.json()
    setGroups(data)
    setLoading(false)
    setStep('group')
  }

  function selectGroup(group: string) {
    setSelectedGroup(group)
    setStep('login')
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError('')
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
      setLoginError('이름 또는 인증코드가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {step === 'cohort' && 'Vibe Class'}
            {step === 'group' && selectedCohort?.name}
            {step === 'login' && `그룹 ${selectedGroup} 로그인`}
          </CardTitle>
          {step !== 'cohort' && (
            <button
              onClick={() => setStep(step === 'login' ? 'group' : 'cohort')}
              className="text-xs text-neutral-400 hover:text-neutral-600 text-left mt-1"
            >
              ← 뒤로
            </button>
          )}
        </CardHeader>

        <CardContent>
          {step === 'cohort' && (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500 mb-4">기수를 선택하세요</p>
              {cohorts.length === 0 ? (
                <p className="text-sm text-neutral-400">현재 진행 중인 기수가 없습니다.</p>
              ) : (
                cohorts.map(cohort => (
                  <Button
                    key={cohort.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => selectCohort(cohort)}
                    disabled={loading}
                    data-testid={`cohort-btn-${cohort.id}`}
                  >
                    {cohort.name}
                  </Button>
                ))
              )}
            </div>
          )}

          {step === 'group' && (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500 mb-4">본인의 그룹을 선택하세요</p>
              {groups.length === 0 ? (
                <p className="text-sm text-neutral-400">등록된 수강생이 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {groups.map(group => (
                    <Button
                      key={group}
                      variant="outline"
                      className="h-16 text-lg font-semibold"
                      onClick={() => selectGroup(group)}
                      data-testid={`group-btn-${group}`}
                    >
                      그룹 {group}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" data-testid="student-login-form">
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
              {loginError && (
                <p className="text-sm text-red-600" data-testid="student-login-error">{loginError}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="student-login-submit"
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
