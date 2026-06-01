'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface AttendanceRecord {
  student_id: string
  date: string
}

export function useAttendanceRealtime(group: string, initialAttended: Set<string>) {
  const [attended, setAttended] = useState<Set<string>>(initialAttended)

  useEffect(() => {
    const supabase = createBrowserClient()
    const today = new Date().toLocaleDateString('sv-SE')

    const channel = supabase
      .channel(`attendances-${group}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendances',
          filter: `date=eq.${today}`,
        },
        (payload) => {
          const record = payload.new as AttendanceRecord
          setAttended(prev => new Set([...prev, record.student_id]))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group])

  return attended
}
