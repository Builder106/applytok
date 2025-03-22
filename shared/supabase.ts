import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { Database } from './types.ts'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing or empty. Make sure your .env file is being loaded correctly.')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing or empty. Make sure your .env file is being loaded correctly.')
}

// Browser client for client-side operations
export const supabase = createBrowserClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Create server client (for use in server-side code)
export function createClient(cookieStore: { get: (name: string) => string | undefined }) {
  return createServerClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)
        },
      },
    }
  )
}

// Types for Supabase tables
export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Video = Tables['videos']['Row']
export type Application = Tables['applications']['Row']
export type Comment = Tables['comments']['Row']
export type Message = Tables['messages']['Row']
export type Bookmark = Tables['bookmarks']['Row']