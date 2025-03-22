export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          headline: string | null
          bio: string | null
          location: string | null
          profile_image: string | null
          user_type: 'job_seeker' | 'employer'
          company_name: string | null
          company_logo: string | null
          skills: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          email: string
          username: string
          full_name: string
          headline?: string | null
          bio?: string | null
          location?: string | null
          profile_image?: string | null
          user_type: 'job_seeker' | 'employer'
          company_name?: string | null
          company_logo?: string | null
          skills?: string[] | null
        }
        Update: Partial<Omit<Database['public']['Tables']['users']['Insert'], 'email'>>
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          video_type: 'resume' | 'job'
          views: number
          likes: number
          comments: number
          shares: number
          skills: string[] | null
          salary: string | null
          location: string | null
          job_type: string | null
          duration: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          video_type: 'resume' | 'job'
          skills?: string[] | null
          salary?: string | null
          location?: string | null
          job_type?: string | null
          duration?: number | null
        }
        Update: Partial<Database['public']['Tables']['videos']['Insert']>
      }
      applications: {
        Row: {
          id: string
          job_video_id: string
          user_video_id: string
          user_id: string
          employer_id: string
          status: 'pending' | 'viewed' | 'interview' | 'rejected' | 'offered'
          note: string | null
          resume_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          job_video_id: string
          user_video_id: string
          user_id: string
          employer_id: string
          status?: 'pending' | 'viewed' | 'interview' | 'rejected' | 'offered'
          note?: string | null
          resume_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      messages: {
        Row: {
          id: number
          senderId: number
          receiverId: number
          content: string
          read: boolean
          createdAt: string
        }
        Insert: {
          senderId: number
          receiverId: number
          content: string
          read?: boolean
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          video_id: string
        }
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>
      }
      comments: {
        Row: {
          id: number
          video_id: number
          user_id: number
          content: string
          created_at: string
        }
        Insert: {
          video_id: number
          user_id: number
          content: string
          created_at?: string
        }
        Update: {
          video_id?: number
          user_id?: number
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export convenience types
export type Tables = Database['public']['Tables']
export type Message = Tables['messages']['Row']
export type User = Tables['users']['Row']
export type Video = Tables['videos']['Row']
export type Application = Tables['applications']['Row']
export type Bookmark = Tables['bookmarks']['Row']