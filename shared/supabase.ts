import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.ts'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types for Supabase tables
export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Video = Tables['videos']['Row']
export type Application = Tables['applications']['Row']
export type Comment = Tables['comments']['Row']
export type Message = Tables['messages']['Row']
export type Bookmark = Tables['bookmarks']['Row']