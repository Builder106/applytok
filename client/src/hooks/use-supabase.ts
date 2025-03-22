import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../../shared/supabase'
import { Message } from '../../../shared/types'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
      supabase.auth.signInWithOAuth({ provider }),
    signOut: () => supabase.auth.signOut(),
    subscribeToMessages,
    uploadFile,
    getFileUrl,
  }
}