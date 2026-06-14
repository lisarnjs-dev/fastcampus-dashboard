'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Cohort } from '@/types/database'

interface Props {
  cohorts: Cohort[]
}

export function StudentCsvUpload({ cohorts }: Props) {
  const router = useRouter()
  const [selectedCohortId, setSelectedCohortId] = useState<string>(
    cohorts.find(c => c.status === 'active')?.id ?? cohorts[0]?.id ?? ''
  )
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string[]>([])

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId) ?? null

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')

    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const names = result.data
          .map(row => Object.values(row)[0]?.trim())
          .filter(Boolean) as string[]
        setPreview(names.slice(0, 5))
      },
    })
  }

  async function handleUpload() {
    if (!file || !selectedCohort) return
    setLoading(true)
    setError('')

    const parsed = await new Promise<string[]>((resolve, reject) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const names = result.data
            .map(row => Object.values(row)[0]?.trim())
            .filter(Boolean) as string[]
          resolve(names)
        },
        error: reject,
      })
    })

    if (parsed.length === 0) {
      setError('이름이 없습니다. CSV 첫 번째 열에 이름을 입력하세요.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort.id, names: parsed }),
    })

    setLoading(false)

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_${selectedCohort.name}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setFile(null)
    setPreview([])
    router.refresh()
  }

  if (cohorts.length === 0) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        기수가 없습니다. 먼저 기수를 생성하세요.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cohort-select">업로드할 기수 선택</Label>
        <Select value={selectedCohortId} onValueChange={(v) => setSelectedCohortId(v ?? '')}>
          <SelectTrigger id="cohort-select" data-testid="cohort-select">
            <SelectValue placeholder="기수를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {cohorts.map(cohort => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
                {cohort.status === 'active' && (
                  <span className="ml-2 text-xs text-green-600">(활성)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="csv-upload">CSV 파일 선택 (첫 번째 열: 이름)</Label>
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFile}
          data-testid="student-csv-input"
        />
      </div>

      {preview.length > 0 && (
        <div className="text-sm text-neutral-600">
          <p className="font-medium mb-1">미리보기 (최대 5명):</p>
          <ul className="list-disc list-inside space-y-0.5">
            {preview.map((name, i) => <li key={i}>{name}</li>)}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={!file || !selectedCohortId || loading}
        data-testid="student-csv-submit"
      >
        {loading ? '업로드 중...' : '업로드 및 인증코드 CSV 다운로드'}
      </Button>
    </div>
  )
}
