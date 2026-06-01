'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Cohort } from '@/types/database'

interface Props {
  cohorts: Cohort[]
}

export function CohortManager({ cohorts }: Props) {
  const router = useRouter()
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createCohort(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    setLoading(false)
    if (res.ok) {
      setNewName('')
      router.refresh()
    } else {
      const { error } = await res.json()
      setError(error)
    }
  }

  async function endCohort(cohortId: string, cohortName: string) {
    if (!confirm(`"${cohortName}" 기수를 종료하시겠습니까?`)) return
    setLoading(true)
    await fetch('/api/admin/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end', cohortId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">새 기수 생성</h2>
        <form onSubmit={createCohort} className="flex gap-2" data-testid="create-cohort-form">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="예: 1기 2026-07"
            className="max-w-xs"
            data-testid="cohort-name-input"
          />
          <Button type="submit" disabled={loading} data-testid="create-cohort-submit">
            {loading ? '생성 중...' : '생성'}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">기수 목록</h2>
        {cohorts.length === 0 ? (
          <p className="text-neutral-500 text-sm">기수가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {cohorts.map(cohort => (
              <div
                key={cohort.id}
                className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg"
                data-testid={`cohort-item-${cohort.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{cohort.name}</span>
                  <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                    {cohort.status === 'active' ? '활성' : '종료'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {new Date(cohort.started_at).toLocaleDateString('ko-KR')} 시작
                  </span>
                  {cohort.status === 'active' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => endCohort(cohort.id, cohort.name)}
                      disabled={loading}
                    >
                      종료
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
