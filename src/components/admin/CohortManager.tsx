'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Cohort } from '@/types/database'
import { addWeeks } from '@/lib/date'

interface Props {
  cohorts: Cohort[]
}

export function CohortManager({ cohorts }: Props) {
  const router = useRouter()
  const today = new Date().toLocaleDateString('sv-SE')
  const [newName, setNewName] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState('')
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
      body: JSON.stringify({
        name: newName,
        started_at: startDate,
        planned_end_at: endDate,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setNewName('')
      setStartDate(today)
      setEndDate('')
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
        <form onSubmit={createCohort} className="space-y-3" data-testid="create-cohort-form">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="예: 1기 2026-07"
              className="max-w-xs"
              data-testid="cohort-name-input"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-txt-muted mb-1">시작일</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-40"
                data-testid="cohort-start-date-input"
              />
            </div>
            <div>
              <label className="block text-xs text-txt-muted mb-1">종료일</label>
              <div className="flex gap-1.5 items-center">
                <Input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-40"
                  data-testid="cohort-end-date-input"
                />
                <button
                  type="button"
                  onClick={() => setEndDate(addWeeks(startDate, 3))}
                  disabled={!startDate}
                  data-testid="cohort-3week-preset"
                  className="shrink-0 text-xs px-2 py-1.5 rounded-lg border border-bdr text-txt-secondary hover:border-brand hover:text-brand transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  3주 자동설정
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading || !newName.trim() || !startDate || !endDate} data-testid="create-cohort-submit">
              {loading ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">기수 목록</h2>
        {cohorts.length === 0 ? (
          <p className="text-txt-muted text-sm">기수가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {cohorts.map(cohort => (
              <div
                key={cohort.id}
                className="flex items-center justify-between p-3 bg-surface border border-bdr rounded-lg"
                data-testid={`cohort-item-${cohort.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-txt-primary">{cohort.name}</span>
                  <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                    {cohort.status === 'active' ? '활성' : '종료'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-txt-muted">
                      {new Date(cohort.started_at).toLocaleDateString('ko-KR')}
                      {cohort.planned_end_at && (
                        <> ~ {new Date(cohort.planned_end_at).toLocaleDateString('ko-KR')}</>
                      )}
                    </p>
                  </div>
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
