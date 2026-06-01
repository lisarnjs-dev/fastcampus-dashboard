'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mission } from '@/types/database'

interface Props {
  missions: Mission[]
}

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
        // first row is header, names are in first column
        const names = rows.slice(1).map(r => r[0]?.trim()).filter(Boolean) as string[]

        if (names.length === 0) {
          setError('이름을 찾을 수 없습니다. CSV 첫 번째 열에 이름이 있어야 합니다.')
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

  if (missions.length === 0) return null

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-lg font-semibold">Google Forms CSV 임포트</h2>
      <p className="text-sm text-neutral-500">
        Google Forms 응답 시트 → 파일 다운로드 → CSV로 저장 후 업로드
      </p>

      <div>
        <Label>미션 선택</Label>
        <select
          className="mt-1 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white"
          value={selectedMissionId}
          onChange={e => setSelectedMissionId(e.target.value)}
          data-testid="import-mission-select"
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
        <Label>Google Forms 응답 CSV</Label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="mt-1 block w-full text-sm text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
          data-testid="import-csv-file"
        />
        <p className="text-xs text-neutral-400 mt-1">첫 번째 열이 이름이어야 합니다</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleImport} disabled={loading} data-testid="import-submit">
        {loading ? '임포트 중...' : '제출 데이터 임포트'}
      </Button>

      {result && (
        <div className="rounded-lg border border-neutral-200 p-4 space-y-2 bg-neutral-50">
          <p className="text-sm font-medium text-green-700">
            {result.matched}명 매칭 완료
          </p>
          {result.unmatched.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700">
                매칭 실패 ({result.unmatched.length}명) — 수동 확인 필요:
              </p>
              <ul className="mt-1 text-sm text-neutral-600 list-disc list-inside">
                {result.unmatched.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
