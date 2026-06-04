'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Mission } from '@/types/database'

interface Props {
  missions: Mission[]
}

interface WeekResult {
  week: number
  missionTitle: string
  matched: number
  unmatched: string[]
}

const inputClass = [
  'w-full px-3.5 py-2.5 border border-bdr rounded-lg text-sm text-txt-primary',
  'placeholder:text-txt-placeholder bg-surface',
  'focus:outline-none focus:border-bdr-focus focus:ring-2 focus:ring-brand-subtle transition-all',
].join(' ')

const labelClass = 'block text-sm font-medium text-txt-secondary mb-1.5'

export function GoogleFormsCsvImport({ missions }: Props) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<WeekResult[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function extractWeekNumber(weekStr: string): number | null {
    const match = weekStr.match(/(\d+)주차/)
    return match ? parseInt(match[1], 10) : null
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('CSV 파일을 선택하세요'); return }

    setLoading(true)
    setError('')
    setResults([])

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
        const weekColIndex = header.findIndex(h => h.includes('주차') || h.includes('제출 주차'))

        if (nameColIndex === -1) {
          setError('"수강생 성함" 열을 찾을 수 없습니다. Google Forms 응답 CSV인지 확인하세요.')
          setLoading(false)
          return
        }

        // 주차별로 그룹화
        const weekGroups = new Map<number, Set<string>>()

        for (const row of rows.slice(1)) {
          const name = row[nameColIndex]?.trim()
          if (!name) continue

          if (weekColIndex !== -1) {
            const weekStr = row[weekColIndex]?.trim() ?? ''
            const weekNum = extractWeekNumber(weekStr)
            if (weekNum !== null) {
              if (!weekGroups.has(weekNum)) weekGroups.set(weekNum, new Set())
              weekGroups.get(weekNum)!.add(name)
              continue
            }
          }

          // 주차 컬럼 없거나 파싱 실패 시 미션이 1개면 그걸로 처리
          if (missions.length === 1) {
            const weekNum = missions[0].week
            if (!weekGroups.has(weekNum)) weekGroups.set(weekNum, new Set())
            weekGroups.get(weekNum)!.add(name)
          }
        }

        if (weekGroups.size === 0) {
          setError('처리할 수 있는 데이터가 없습니다. CSV 형식을 확인하세요.')
          setLoading(false)
          return
        }

        // 주차 → 미션 매핑
        const missionByWeek = new Map<number, Mission>()
        for (const m of missions) {
          if (!missionByWeek.has(m.week)) missionByWeek.set(m.week, m)
        }

        const weekResults: WeekResult[] = []
        const unmatchedWeeks: number[] = []

        for (const [weekNum, names] of Array.from(weekGroups).sort((a, b) => a[0] - b[0])) {
          const mission = missionByWeek.get(weekNum)
          if (!mission) {
            unmatchedWeeks.push(weekNum)
            continue
          }

          const res = await fetch('/api/admin/missions/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missionId: mission.id, names: Array.from(names) }),
          })

          if (!res.ok) {
            const { error: msg } = await res.json()
            setError(`${weekNum}주차 임포트 실패: ${msg}`)
            setLoading(false)
            return
          }

          const data = await res.json()
          weekResults.push({
            week: weekNum,
            missionTitle: mission.title,
            matched: data.matched,
            unmatched: data.unmatched,
          })
        }

        if (unmatchedWeeks.length > 0) {
          setError(`${unmatchedWeeks.join(', ')}주차 미션이 등록되지 않아 건너뜀`)
        }

        setResults(weekResults)
        setLoading(false)
        if (fileRef.current) fileRef.current.value = ''
        const label = document.getElementById('file-name-label')
        if (label) label.textContent = '선택된 파일 없음'
      },
      error: (err) => {
        setError(`CSV 파싱 오류: ${err.message}`)
        setLoading(false)
      },
    })
  }

  const totalMatched = results.reduce((sum, r) => sum + r.matched, 0)
  const allUnmatched = results.flatMap(r => r.unmatched)

  return (
    <div className="bg-surface border border-bdr rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-txt-primary">Google Forms CSV 임포트</h2>
        <p className="text-sm text-txt-muted mt-1">
          Google Forms 응답 시트를 CSV로 다운로드 후 업로드하세요.
          &ldquo;수강생 성함&rdquo;과 &ldquo;제출 주차 선택&rdquo; 열이 포함된 CSV를 지원합니다.
          주차별로 자동 매칭됩니다.
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
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

        {results.length > 0 && (
          <div className="rounded-xl border border-bdr p-4 space-y-3 bg-page">
            <div className="flex items-center gap-2">
              <span className="text-success text-lg">✓</span>
              <p className="text-sm font-medium text-success-fg">
                총 {totalMatched}명 매칭 완료
              </p>
            </div>

            <div className="space-y-2">
              {results.map(r => (
                <div key={r.week} className="flex items-center justify-between text-sm">
                  <span className="text-txt-secondary">
                    <span className="bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-md mr-2">
                      {r.week}주차
                    </span>
                    {r.missionTitle}
                  </span>
                  <span className="text-success-fg font-medium">{r.matched}명</span>
                </div>
              ))}
            </div>

            {allUnmatched.length > 0 && (
              <div className="pt-3 border-t border-bdr">
                <p className="text-sm font-medium text-warning-fg mb-2">
                  매칭 실패 {allUnmatched.length}명 — 수동 확인 필요
                </p>
                <ul className="space-y-1">
                  {allUnmatched.map((name, i) => (
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
