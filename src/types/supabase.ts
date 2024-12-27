export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          month_decision: string | null
          next_action_date: string | null
          status: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          month_decision?: string | null
          next_action_date?: string | null
          status?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          month_decision?: string | null
          next_action_date?: string | null
          status?: string | null
          created_at?: string
          created_by?: string
        }
      }
    }
  }
}