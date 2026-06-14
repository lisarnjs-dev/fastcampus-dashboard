export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      cohorts: {
        Row: {
          id: string
          name: string
          status: 'active' | 'archived'
          started_at: string
          ended_at: string | null
          planned_end_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'active' | 'archived'
          started_at?: string
          ended_at?: string | null
          planned_end_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: string
          started_at?: string
          ended_at?: string | null
          planned_end_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          cohort_id: string
          name: string
          auth_code: string
          dashboard_group: string
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          name: string
          auth_code: string
          dashboard_group: string
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          name?: string
          auth_code?: string
          dashboard_group?: string
          created_at?: string
        }
        Relationships: []
      }
      attendances: {
        Row: {
          id: string
          student_id: string
          cohort_id: string
          date: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          cohort_id: string
          date: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          cohort_id?: string
          date?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          id: string
          cohort_id: string
          dashboard_group: string | null
          week: number
          title: string
          description: string
          due_at: string
          google_form_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          dashboard_group?: string | null
          week: number
          title: string
          description?: string
          due_at: string
          google_form_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          dashboard_group?: string | null
          week?: number
          title?: string
          description?: string
          due_at?: string
          google_form_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      mission_submissions: {
        Row: {
          id: string
          mission_id: string
          student_id: string
          submitted_at: string
          imported_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          student_id: string
          submitted_at: string
          imported_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          student_id?: string
          submitted_at?: string
          imported_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Cohort = Database['public']['Tables']['cohorts']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Attendance = Database['public']['Tables']['attendances']['Row']
export type Mission = Database['public']['Tables']['missions']['Row']
export type MissionSubmission = Database['public']['Tables']['mission_submissions']['Row']
