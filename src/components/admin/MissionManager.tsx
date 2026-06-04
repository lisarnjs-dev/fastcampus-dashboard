'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mission, Cohort } from '@/types/database'

interface Props {
  missions: Mission[]
  activeCohort: Cohort | null
}

const inputClass = [
  'w-full px-3.5 py-2.5 border border-bdr rounded-lg text-sm text-txt-primary',
  'placeholder:text-txt-placeholder bg-surface',
  'focus:outline-none focus:border-bdr-focus focus:ring-2 focus:ring-brand-subtle transition-all',
].join(' ')

const labelClass = 'block text-sm font-medium text-txt-secondary mb-1.5'

export function MissionManager({ missions, activeCohort }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null)
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
      body: JSON.stringify({ cohortId: activeCohort.id, ...form }),
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

  async function closeMission(id: string) {
    setLoading(true)
    await fetch('/api/admin/missions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, dueAt: new Date().toISOString() }),
    })
    setConfirmCloseId(null)
    setLoading(false)
    router.refresh()
  }

  async function deleteMission(id: string) {
    setLoading(true)
    await fetch(`/api/admin/missions?id=${id}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    setLoading(false)
    router.refresh()
  }

  // Week별 그룹핑
  const byWeek = missions.reduce<Record<number, Mission[]>>((acc, m) => {
    if (!acc[m.week]) acc[m.week] = []
    acc[m.week]!.push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* ── 새 미션 등록 폼 ── */}
      <div className="bg-surface border border-bdr rounded-2xl p-6">
        <h2 className="text-base font-semibold text-txt-primary mb-5">새 미션 등록</h2>

        {!activeCohort ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-warning-subtle rounded-xl">
            <span className="text-warning-fg text-sm font-medium">활성 기수가 없습니다. 기수를 먼저 생성하세요.</span>
          </div>
        ) : (
          <form onSubmit={createMission} className="space-y-4" data-testid="mission-form">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Week</label>
                <input
                  type="number"
                  min={1}
                  value={form.week}
                  onChange={e => setForm(f => ({ ...f, week: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  그룹
                  <span className="ml-1.5 text-xs text-txt-placeholder font-normal">비워두면 전체 공개</span>
                </label>
                <input
                  value={form.dashboardGroup}
                  onChange={e => setForm(f => ({ ...f, dashboardGroup: e.target.value }))}
                  placeholder="A"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>제목 *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="미션 제목을 입력하세요"
                data-testid="mission-title"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>설명</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="수강생에게 보여질 미션 설명을 입력하세요"
                className={[inputClass, 'resize-none leading-relaxed'].join(' ')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>마감 일시</label>
                <input
                  type="datetime-local"
                  value={form.dueAt}
                  onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Google Forms URL</label>
                <input
                  value={form.googleFormUrl}
                  onChange={e => setForm(f => ({ ...f, googleFormUrl: e.target.value }))}
                  placeholder="https://forms.gle/..."
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-error bg-error-subtle border border-error-border rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                data-testid="mission-submit"
                className="px-5 py-2.5 bg-brand text-brand-fg text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '등록 중...' : '미션 등록'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── 미션 목록 ── */}
      <div className="bg-surface border border-bdr rounded-2xl p-6">
        <h2 className="text-base font-semibold text-txt-primary mb-5">
          미션 목록
          {missions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-txt-muted">({missions.length}개)</span>
          )}
        </h2>

        {missions.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mb-3">
              <span className="text-lg">📋</span>
            </div>
            <p className="text-sm font-medium text-txt-secondary">등록된 미션이 없습니다</p>
            <p className="text-xs text-txt-muted mt-1">위 폼에서 첫 번째 미션을 등록하세요.</p>
          </div>
        ) : (
          /* Week별 그룹 */
          <div className="space-y-6">
            {Object.entries(byWeek).map(([week, weekMissions]) => (
              <div key={week}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-txt-muted uppercase tracking-wide">
                    Week {week}
                  </span>
                  <div className="flex-1 h-px bg-bdr" />
                </div>

                <div className="space-y-2">
                  {weekMissions.map(m => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-4 px-4 py-3.5 border border-bdr rounded-xl hover:bg-page transition-colors"
                      data-testid={`mission-item-${m.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {m.dashboard_group && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-brand-muted text-brand">
                              그룹 {m.dashboard_group}
                            </span>
                          )}
                          {m.google_form_url && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-success-subtle text-success-fg border border-success-border">
                              폼 연결됨
                            </span>
                          )}
                          {m.due_at && new Date(m.due_at) < new Date() && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-error-subtle text-error border border-error-border">
                              마감됨
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-txt-primary">{m.title}</p>

                        {m.description && (
                          <p className="text-xs text-txt-muted mt-0.5 line-clamp-2">{m.description}</p>
                        )}

                        {m.due_at && (
                          <p className="text-xs text-txt-placeholder mt-1">
                            마감 {new Date(m.due_at).toLocaleString('ko-KR')}
                          </p>
                        )}
                      </div>

                      {/* 액션 버튼 영역 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 종료 확인 */}
                        {confirmCloseId === m.id ? (
                          <>
                            <span className="text-xs text-txt-muted">지금 종료할까요?</span>
                            <button
                              onClick={() => setConfirmCloseId(null)}
                              className="text-xs text-txt-muted hover:text-txt-primary px-2.5 py-1.5 rounded-lg border border-bdr hover:bg-page transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => closeMission(m.id)}
                              disabled={loading}
                              className="text-xs text-warning-fg bg-warning-subtle border border-warning-fg/20 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              종료
                            </button>
                          </>
                        ) : confirmDeleteId === m.id ? (
                          <>
                            <span className="text-xs text-txt-muted">삭제할까요?</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-txt-muted hover:text-txt-primary px-2.5 py-1.5 rounded-lg border border-bdr hover:bg-page transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => deleteMission(m.id)}
                              disabled={loading}
                              className="text-xs text-error bg-error-subtle border border-error-border px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          <>
                            {!(m.due_at && new Date(m.due_at) < new Date()) && (
                              <button
                                onClick={() => { setConfirmCloseId(m.id); setConfirmDeleteId(null) }}
                                className="text-xs text-txt-placeholder hover:text-warning-fg px-2.5 py-1.5 rounded-lg border border-transparent hover:border-warning-fg/20 hover:bg-warning-subtle transition-all"
                                data-testid={`mission-close-${m.id}`}
                              >
                                종료
                              </button>
                            )}
                            <button
                              onClick={() => { setConfirmDeleteId(m.id); setConfirmCloseId(null) }}
                              className="text-xs text-txt-placeholder hover:text-error px-2.5 py-1.5 rounded-lg border border-transparent hover:border-error-border hover:bg-error-subtle transition-all"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
