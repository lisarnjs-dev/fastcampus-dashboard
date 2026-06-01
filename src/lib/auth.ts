import bcrypt from 'bcryptjs'
import { createServerClient } from './supabase/server'

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  if (username !== process.env.ADMIN_USERNAME) return false
  return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!)
}

export async function verifyStudentCredentials(name: string, authCode: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('students')
    .select('id, cohort_id, dashboard_group, name')
    .eq('name', name.trim())
    .eq('auth_code', authCode.trim().toUpperCase())
    .maybeSingle()
  return data
}
