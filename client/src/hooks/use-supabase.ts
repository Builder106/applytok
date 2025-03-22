import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../../shared/supabase'
import { Message } from '../../../shared/types'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      setUser(initialUser)
      setLoading(false)
    }
    
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_OUT') {
        // Clear any auth-related cookies on sign out
        const expires = new Date(0).toUTCString()
        document.cookie = `sb-access-token=; path=/; expires=${expires}; secure`
        document.cookie = `sb-refresh-token=; path=/; expires=${expires}; secure`
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Real-time messages subscription
  const subscribeToMessages = (userId: string, callback: (message: Message) => void) => {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe()
  }

  // File upload to Supabase Storage
  const uploadFile = async (
    bucketName: 'videos' | 'resumes',
    filePath: string,
    file: File
  ) => {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })
    return { data, error }
  }

  // Get file URL from Supabase Storage
  const getFileUrl = (bucketName: 'videos' | 'resumes', filePath: string) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  }

  return {
    user,
    loading,
    signIn: (provider: 'google' | 'github') =>
      supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}`
        }
      }),
    signOut: () => supabase.auth.signOut(),
    subscribeToMessages,
    uploadFile,
    getFileUrl,
  }
}