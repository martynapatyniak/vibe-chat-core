import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  username: string
  created_at: string
  avatar_url?: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  room_id: string
  created_at: string
  user: User
}

export interface Room {
  id: string
  name: string
  description?: string
  created_at: string
}
