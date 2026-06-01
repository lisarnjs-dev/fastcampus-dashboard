'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mission, Cohort } from '@/types/database'

interface Props {
  missions: Mission[]
  activeCohort: Cohort | null
}

export function MissionManager({ missions, activeCohort }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    week: '1',
    title: '',
    description: '',
    dueAt: '',
    googleFormUrl: '',
    dashboardGroup: '',
  })

  async function createMission(e: React.FormEvent) {
    e.preventDefault()
    if (!activeCohort) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cohortId: activeCohort.id,
        ...form,
      }),
    })

    setLoading(false)
    if (res.ok) {
      setForm({ week: '1', title: '', description: '', dueAt: '', googleFormUrl: '', dashboardGroup: '' })
      router.refresh()
    } else {
      const { error: msg } = await res.json()
      setError(msg)
    }
  }

  async function deleteMission(id: string) {
    if (!confirm('미션을 삭제하시겠습니까?')) return
    setLoading(true)
    await fetch(`/api/admin/missions?id=${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">새 미션 등록</h2>
        {!activeCohort ? (
          <p className="text-sm text-amber-700">활성 기수가 없습니다.</p>
        ) : (
          <form onSubmit={createMission} className="space-y-3 max-w-lg" data-testid="mission-form">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Week</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.week}
                  onChange={e => setForm(f => ({ ...f, week: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>그룹 (빈칸=전체)</Label>
                <Input
                  value={form.dashboardGroup}
                  onChange={e => setForm(f => ({ ...f, dashboardGroup: e.target.value }))}
                  placeholder="A"
                />
              </div>
            </div>
            <div>
              <Label>제목</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                data-testid="mission-title"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div>
              <Label>마감일시</Label>
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
              />
            </div>
            <div>
              <Label>Google Forms URL</Label>
              <Input
                value={form.googleFormUrl}
                onChange={e => setForm(f => ({ ...f, googleFormUrl: e.target.value }))}
                placeholder="https://forms.gle/..."
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} data-testid="mission-submit">
              {loading ? '등록 중...' : '미션 등록'}
            </Button>
          </form>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">미션 목록</h2>
        {missions.length === 0 ? (
          <p className="text-neutral-500 text-sm">미션이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {missions.map(m => (
              <div
                key={m.id}
                className="flex items-start justify-between p-3 bg-white border border-neutral-200 rounded-lg gap-3"
                data-testid={`mission-item-${m.id}`}
              >
                <div>
                  <p className="text-xs text-neutral-400">Week {m.week}{m.dashboard_group ? ` · 그룹 ${m.dashboard_group}` : ''}</p>
                  <p className="font-medium">{m.title}</p>
                  {m.due_at && (
                    <p className="text-xs text-neutral-500">
                      마감: {new Date(m.due_at).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMission(m.id)}
                  disabled={loading}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
