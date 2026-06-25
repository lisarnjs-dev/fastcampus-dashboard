'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface AttendanceRecord {
  student_id: string
  date: string
  message: string
}

export function useAttendanceRealtime(
  group: string,
  initialAttended: Set<string>,
  initialMessages: Record<string, string> = {}
) {
  const [attended, setAttended] = useState<Set<string>>(initialAttended)
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages)

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
          setMessages(prev => ({ ...prev, [record.student_id]: record.message }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group])

  return { attended, messages }
}
