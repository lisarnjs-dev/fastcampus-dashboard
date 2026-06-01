'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cohort } from '@/types/database'

interface Props {
  activeCohort: Cohort | null
}

export function StudentCsvUpload({ activeCohort }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string[]>([])

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
    if (!file || !activeCohort) return
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
      body: JSON.stringify({ cohortId: activeCohort.id, names: parsed }),
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
    a.download = `students_${activeCohort.name}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setFile(null)
    setPreview([])
    router.refresh()
  }

  if (!activeCohort) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        활성 기수가 없습니다. 먼저 기수를 생성하세요.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        현재 활성 기수: <strong>{activeCohort.name}</strong>에 수강생을 추가합니다.
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
        disabled={!file || loading}
        data-testid="student-csv-submit"
      >
        {loading ? '업로드 중...' : '업로드 및 인증코드 CSV 다운로드'}
      </Button>
    </div>
  )
}
