import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu cấu hình Supabase trong file .env')
}

export const hasSupabase = !!(supabaseUrl && supabaseAnonKey)
export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null
