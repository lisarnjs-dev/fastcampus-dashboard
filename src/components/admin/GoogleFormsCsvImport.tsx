'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Mission } from '@/types/database'

interface Props {
  missions: Mission[]
}

const inputClass = [
  'w-full px-3.5 py-2.5 border border-bdr rounded-lg text-sm text-txt-primary',
  'placeholder:text-txt-placeholder bg-surface',
  'focus:outline-none focus:border-bdr-focus focus:ring-2 focus:ring-brand-subtle transition-all',
].join(' ')

const labelClass = 'block text-sm font-medium text-txt-secondary mb-1.5'

export function GoogleFormsCsvImport({ missions }: Props) {
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ matched: number; unmatched: string[] } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport() {
    if (!selectedMissionId) { setError('미션을 선택하세요'); return }
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('CSV 파일을 선택하세요'); return }

    setLoading(true)
    setError('')
    setResult(null)

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data as string[][]
        if (rows.length < 2) {
          setError('CSV에 데이터가 없습니다.')
          setLoading(false)
          return
        }

        const header = rows[0].map(h => h.trim())
        const nameColIndex = header.findIndex(h => h.includes('성함'))
        if (nameColIndex === -1) {
          setError('"수강생 성함" 열을 찾을 수 없습니다. Google Forms 응답 CSV인지 확인하세요.')
          setLoading(false)
          return
        }

        const names = rows.slice(1).map(r => r[nameColIndex]?.trim()).filter(Boolean) as string[]

        if (names.length === 0) {
          setError('이름을 찾을 수 없습니다.')
          setLoading(false)
          return
        }

        const res = await fetch('/api/admin/missions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ missionId: selectedMissionId, names }),
        })

        setLoading(false)
        if (res.ok) {
          const data = await res.json()
          setResult(data)
          if (fileRef.current) fileRef.current.value = ''
        } else {
          const { error: msg } = await res.json()
          setError(msg)
        }
      },
      error: (err) => {
        setError(`CSV 파싱 오류: ${err.message}`)
        setLoading(false)
      },
    })
  }

  return (
    <div className="bg-surface border border-bdr rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-txt-primary">Google Forms CSV 임포트</h2>
        <p className="text-sm text-txt-muted mt-1">
          Google Forms 응답 시트 → 파일 → 다운로드 → CSV로 저장 후 업로드하세요.
          &ldquo;수강생 성함&rdquo; 열이 포함된 CSV만 지원합니다.
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className={labelClass}>미션 선택</label>
          <select
            value={selectedMissionId}
            onChange={e => setSelectedMissionId(e.target.value)}
            data-testid="import-mission-select"
            className={[inputClass, 'cursor-pointer'].join(' ')}
          >
            <option value="">미션을 선택하세요</option>
            {missions.map(m => (
              <option key={m.id} value={m.id}>
                Week {m.week} — {m.title}{m.dashboard_group ? ` (그룹 ${m.dashboard_group})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Google Forms 응답 CSV</label>
          <label className="flex items-center gap-3 px-3.5 py-2.5 border border-bdr rounded-lg bg-surface hover:bg-page cursor-pointer transition-colors group">
            <span className="shrink-0 px-2.5 py-1 bg-page border border-bdr rounded-md text-xs font-medium text-txt-secondary group-hover:border-brand group-hover:text-brand transition-colors">
              파일 선택
            </span>
            <span className="text-sm text-txt-placeholder truncate" id="file-name-label">
              선택된 파일 없음
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="sr-only"
              data-testid="import-csv-file"
              onChange={e => {
                const label = document.getElementById('file-name-label')
                if (label) label.textContent = e.target.files?.[0]?.name ?? '선택된 파일 없음'
              }}
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-error bg-error-subtle border border-error-border rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleImport}
          disabled={loading}
          data-testid="import-submit"
          className="px-5 py-2.5 bg-brand text-brand-fg text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '임포트 중...' : '제출 데이터 임포트'}
        </button>

        {result && (
          <div className="rounded-xl border border-bdr p-4 space-y-3 bg-page">
            <div className="flex items-center gap-2">
              <span className="text-success text-lg">✓</span>
              <p className="text-sm font-medium text-success-fg">
                {result.matched}명 매칭 완료
              </p>
            </div>

            {result.unmatched.length > 0 && (
              <div className="pt-3 border-t border-bdr">
                <p className="text-sm font-medium text-warning-fg mb-2">
                  매칭 실패 {result.unmatched.length}명 — 수동 확인 필요
                </p>
                <ul className="space-y-1">
                  {result.unmatched.map((name, i) => (
                    <li key={i} className="text-sm text-txt-secondary flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-txt-placeholder shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
