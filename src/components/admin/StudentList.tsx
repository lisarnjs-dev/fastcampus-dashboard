'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Student } from '@/types/database'

interface Props {
  students: Student[]
}

export function StudentList({ students }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function downloadCsv() {
    const rows = [
      ['이름', '그룹', '인증코드'],
      ...students.map(s => [s.name, s.dashboard_group, s.auth_code]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteStudent(id: string, name: string) {
    if (!confirm(`"${name}" 수강생을 삭제하시겠습니까?`)) return
    setLoading(true)
    await fetch('/api/admin/students?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id }),
    })
    setLoading(false)
    router.refresh()
  }

  const grouped = students.reduce<Record<string, Student[]>>((acc, s) => {
    const g = s.dashboard_group
    if (!acc[g]) acc[g] = []
    acc[g].push(s)
    return acc
  }, {})

  const groups = Object.keys(grouped).sort()

  if (students.length === 0) {
    return <p className="text-neutral-500 text-sm">수강생이 없습니다.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">총 {students.length}명</p>
        <Button variant="outline" size="sm" onClick={downloadCsv} data-testid="download-students-csv">
          CSV 다운로드
        </Button>
      </div>
      {groups.map(group => (
        <div key={group}>
          <h3 className="font-semibold text-neutral-700 mb-2">그룹 {group} ({grouped[group].length}명)</h3>
          <div className="space-y-1">
            {grouped[group].map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-lg"
                data-testid={`student-item-${s.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{s.name}</span>
                  <Badge variant="secondary" className="font-mono text-xs">{s.auth_code}</Badge>
                  <Badge variant="outline" className="text-xs">그룹 {s.dashboard_group}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteStudent(s.id, s.name)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
