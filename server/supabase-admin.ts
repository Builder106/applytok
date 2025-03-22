import { createServerClient } from '@supabase/ssr'
import type { Database } from '../shared/types'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is not set')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
}

// Create a Supabase admin client with the service role key for admin operations
export const supabaseAdmin = createServerClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    cookies: {
      // No cookie handling needed for admin operations
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  }
)

// Admin-level database operations
export async function createUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  return { data, error }
}

export async function deleteUser(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  return { data, error }
}

// Storage bucket management
export async function createStorageBucket(name: 'videos' | 'resumes') {
  const { data, error } = await supabaseAdmin.storage.createBucket(name, {
    public: name === 'videos', // videos bucket is public, resumes are private
    fileSizeLimit: name === 'videos' ? 1024 * 1024 * 100 : 1024 * 1024 * 10, // 100MB for videos, 10MB for resumes
    allowedMimeTypes: name === 'videos' 
      ? ['video/mp4', 'video/webm']
      : ['application/pdf']
  })
  return { data, error }
}