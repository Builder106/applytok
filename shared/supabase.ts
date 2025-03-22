import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.ts'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are loaded
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing or empty. Make sure your .env file is being loaded correctly.')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing or empty. Make sure your .env file is being loaded correctly.')
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Types for Supabase tables
export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Video = Tables['videos']['Row']
export type Application = Tables['applications']['Row']
export type Comment = Tables['comments']['Row']
export type Message = Tables['messages']['Row']
export type Bookmark = Tables['bookmarks']['Row']