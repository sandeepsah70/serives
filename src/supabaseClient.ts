import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://odgyrlkenxufbfdeqsvx.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZ3lybGtlbnh1ZmJmZGVxc3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NTk1NTMsImV4cCI6MjEwOTMzNTU1M30.ApHZCBKl_TGbhVgA131e2FmCsx_cHZTWxx4IvhxIg7U'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
