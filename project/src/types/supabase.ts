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
      profiles: {
        Row: {
          id: string
          full_name: string
          company: string | null
          subscription: string
          bill_credits: number
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          company?: string | null
          subscription?: string
          bill_credits?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          company?: string | null
          subscription?: string
          bill_credits?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          number: string
          date: string
          due_date: string
          client_name: string
          client_email: string
          items: Json
          notes: string | null
          terms: string | null
          status: string
          total_amount: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          number: string
          date: string
          due_date: string
          client_name: string
          client_email: string
          items: Json
          notes?: string | null
          terms?: string | null
          status?: string
          total_amount: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          number?: string
          date?: string
          due_date?: string
          client_name?: string
          client_email?: string
          items?: Json
          notes?: string | null
          terms?: string | null
          status?: string
          total_amount?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          user_id: string
          file_path: string
          file_name: string
          file_size: number
          status: string
          crops: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          file_name: string
          file_size: number
          status?: string
          crops?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          file_name?: string
          file_size?: number
          status?: string
          crops?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}