// Supabase client — NULL-SAFE: thiếu env thì trả null để app vẫn chạy (localStorage),
// không trắng màn. Khi điền .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) là tự bật.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const hasSupabase = Boolean(url && key)
export const supabase = hasSupabase ? createClient(url, key) : null
