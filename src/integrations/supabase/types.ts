export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          active: boolean
          created_at: string
          display_name: string | null
          email: string
          id: string
          last_login_at: string | null
          password_hash: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          password_hash: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string
          ip: string | null
          token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at: string
          ip?: string | null
          token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string
          ip?: string | null
          token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      blind_date_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          session_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          session_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blind_date_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "blind_date_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      blind_date_profiles: {
        Row: {
          answers: Json
          chats_remaining: number
          compat_vector: Json
          completed: boolean
          created_at: string
          extended_answers: Json
          extended_completed: boolean
          is_trial: boolean
          notes: string | null
          paid: boolean
          period_start: string
          plan: string
          sessions_limit: number | null
          sessions_used: number
          trial_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          chats_remaining?: number
          compat_vector?: Json
          completed?: boolean
          created_at?: string
          extended_answers?: Json
          extended_completed?: boolean
          is_trial?: boolean
          notes?: string | null
          paid?: boolean
          period_start?: string
          plan?: string
          sessions_limit?: number | null
          sessions_used?: number
          trial_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          chats_remaining?: number
          compat_vector?: Json
          completed?: boolean
          created_at?: string
          extended_answers?: Json
          extended_completed?: boolean
          is_trial?: boolean
          notes?: string | null
          paid?: boolean
          period_start?: string
          plan?: string
          sessions_limit?: number | null
          sessions_used?: number
          trial_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blind_date_questions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          key: string
          options: Json
          position: number
          prompt: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          key: string
          options?: Json
          position?: number
          prompt: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          key?: string
          options?: Json
          position?: number
          prompt?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blind_date_sessions: {
        Row: {
          compatibility: number | null
          created_at: string
          decision_a: string | null
          decision_b: string | null
          ends_at: string
          id: string
          revealed_at: string | null
          started_at: string
          status: string
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          compatibility?: number | null
          created_at?: string
          decision_a?: string | null
          decision_b?: string | null
          ends_at?: string
          id?: string
          revealed_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          compatibility?: number | null
          created_at?: string
          decision_a?: string | null
          decision_b?: string | null
          ends_at?: string
          id?: string
          revealed_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          content_html: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content_html?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content_html?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      interest_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["interest_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["interest_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["interest_status"]
          updated_at?: string
        }
        Relationships: []
      }
      interest_unlocks: {
        Row: {
          created_at: string
          id: string
          payment_id: string | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id?: string | null
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_secrets: {
        Row: {
          created_at: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_liked_id_fkey"
            columns: ["liked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_liked_id_fkey"
            columns: ["liked_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          reveal_a: boolean
          reveal_b: boolean
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          reveal_a?: boolean
          reveal_b?: boolean
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          reveal_a?: boolean
          reveal_b?: boolean
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          last_read_at: string
          match_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          match_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string
          match_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_campaigns: {
        Row: {
          audience: Json
          body: string
          created_at: string
          cta_link: string | null
          cta_text: string | null
          email_status: string | null
          id: string
          send_email: boolean
          send_in_app: boolean
          sent_by: string | null
          sent_count: number
          title: string
          type: string
        }
        Insert: {
          audience?: Json
          body: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          email_status?: string | null
          id?: string
          send_email?: boolean
          send_in_app?: boolean
          sent_by?: string | null
          sent_count?: number
          title: string
          type?: string
        }
        Update: {
          audience?: Json
          body?: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          email_status?: string | null
          id?: string
          send_email?: boolean
          send_in_app?: boolean
          sent_by?: string | null
          sent_count?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          cta_link: string | null
          cta_text: string | null
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          admin_notes: string | null
          amount_label: string | null
          created_at: string
          feature: string
          id: string
          phone: string | null
          plan: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_user_id: string | null
          updated_at: string
          upi_reference: string | null
          user_id: string
          whatsapp_sent_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_label?: string | null
          created_at?: string
          feature?: string
          id?: string
          phone?: string | null
          plan: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_user_id?: string | null
          updated_at?: string
          upi_reference?: string | null
          user_id: string
          whatsapp_sent_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_label?: string | null
          created_at?: string
          feature?: string
          id?: string
          phone?: string | null
          plan?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_user_id?: string | null
          updated_at?: string
          upi_reference?: string | null
          user_id?: string
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      profile_interests: {
        Row: {
          interest: string
          user_id: string
        }
        Insert: {
          interest: string
          user_id: string
        }
        Update: {
          interest?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          position: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_prompts: {
        Row: {
          answer: string
          created_at: string
          id: string
          position: number
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          position?: number
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          position?: number
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          age: number | null
          age_max: number | null
          age_min: number | null
          banned: boolean
          city: string | null
          created_at: string
          device: string | null
          distance_km: number | null
          first_name: string | null
          gender: string | null
          grandfathered: boolean
          id: string
          intent: string | null
          interested_in: string | null
          is_admin_created: boolean
          last_active_at: string | null
          looking_for: string | null
          match_period_start: string
          matches_used_this_period: number
          onboarded: boolean
          onboarding_step: number
          payment_status: string
          phone: string | null
          plan: string
          plan_expires_at: string | null
          plan_period_end: string | null
          plan_started_at: string | null
          profession: string | null
          selected_plan: string | null
          story: string | null
          suspended: boolean
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          voice_intro_path: string | null
        }
        Insert: {
          account_status?: string
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          banned?: boolean
          city?: string | null
          created_at?: string
          device?: string | null
          distance_km?: number | null
          first_name?: string | null
          gender?: string | null
          grandfathered?: boolean
          id: string
          intent?: string | null
          interested_in?: string | null
          is_admin_created?: boolean
          last_active_at?: string | null
          looking_for?: string | null
          match_period_start?: string
          matches_used_this_period?: number
          onboarded?: boolean
          onboarding_step?: number
          payment_status?: string
          phone?: string | null
          plan?: string
          plan_expires_at?: string | null
          plan_period_end?: string | null
          plan_started_at?: string | null
          profession?: string | null
          selected_plan?: string | null
          story?: string | null
          suspended?: boolean
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          voice_intro_path?: string | null
        }
        Update: {
          account_status?: string
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          banned?: boolean
          city?: string | null
          created_at?: string
          device?: string | null
          distance_km?: number | null
          first_name?: string | null
          gender?: string | null
          grandfathered?: boolean
          id?: string
          intent?: string | null
          interested_in?: string | null
          is_admin_created?: boolean
          last_active_at?: string | null
          looking_for?: string | null
          match_period_start?: string
          matches_used_this_period?: number
          onboarded?: boolean
          onboarding_step?: number
          payment_status?: string
          phone?: string | null
          plan?: string
          plan_expires_at?: string | null
          plan_period_end?: string | null
          plan_started_at?: string | null
          profession?: string | null
          selected_plan?: string | null
          story?: string | null
          suspended?: boolean
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          voice_intro_path?: string | null
        }
        Relationships: []
      }
      prompts_library: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          position: number
          text: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          position?: number
          text: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          position?: number
          text?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      sheet_sync_log: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          lead_id: string | null
          request_id: number | null
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string | null
          request_id?: number | null
          source: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string | null
          request_id?: number | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signup_leads: {
        Row: {
          attempts: number
          auth_user_id: string | null
          created_at: string
          email: string | null
          email_verified_at: string | null
          first_name: string | null
          id: string
          ip: string | null
          last_error: string | null
          phone: string | null
          signup_attempted_at: string
          signup_completed_at: string | null
          source: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          attempts?: number
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_error?: string | null
          phone?: string | null
          signup_attempted_at?: string
          signup_completed_at?: string | null
          source?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          attempts?: number
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_error?: string | null
          phone?: string | null
          signup_attempted_at?: string
          signup_completed_at?: string | null
          source?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          contact_number: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          priority: string
          purchase_date: string | null
          status: string
          subject: string | null
          ticket_type: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_number?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          priority?: string
          purchase_date?: string | null
          status?: string
          subject?: string | null
          ticket_type?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          priority?: string
          purchase_date?: string | null
          status?: string
          subject?: string | null
          ticket_type?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          account_status: string | null
          age: number | null
          city: string | null
          created_at: string | null
          first_name: string | null
          gender: string | null
          id: string | null
          intent: string | null
          looking_for: string | null
          onboarded: boolean | null
          profession: string | null
          story: string | null
          voice_intro_path: string | null
        }
        Insert: {
          account_status?: string | null
          age?: number | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string | null
          intent?: string | null
          looking_for?: string | null
          onboarded?: boolean | null
          profession?: string | null
          story?: string | null
          voice_intro_path?: string | null
        }
        Update: {
          account_status?: string | null
          age?: number | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string | null
          intent?: string | null
          looking_for?: string | null
          onboarded?: boolean | null
          profession?: string | null
          story?: string | null
          voice_intro_path?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_resolve_audience: {
        Args: { _type: string; _value: string }
        Returns: {
          id: string
        }[]
      }
      bd_consume_chat: { Args: { _user_id: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      enqueue_sheet_sync: {
        Args: { _lead_id: string; _source: string; _user_id: string }
        Returns: undefined
      }
      get_my_bd_profile: {
        Args: never
        Returns: {
          answers: Json
          chats_remaining: number
          completed: boolean
          extended_answers: Json
          extended_completed: boolean
          paid: boolean
          period_start: string
          plan: string
          sessions_limit: number
          sessions_used: number
          user_id: string
        }[]
      }
      get_my_match_usage: {
        Args: never
        Returns: {
          limit: number
          period_end: string
          period_start: string
          plan: string
          used: number
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          account_status: string
          age: number | null
          age_max: number | null
          age_min: number | null
          banned: boolean
          city: string | null
          created_at: string
          device: string | null
          distance_km: number | null
          first_name: string | null
          gender: string | null
          grandfathered: boolean
          id: string
          intent: string | null
          interested_in: string | null
          is_admin_created: boolean
          last_active_at: string | null
          looking_for: string | null
          match_period_start: string
          matches_used_this_period: number
          onboarded: boolean
          onboarding_step: number
          payment_status: string
          phone: string | null
          plan: string
          plan_expires_at: string | null
          plan_period_end: string | null
          plan_started_at: string | null
          profession: string | null
          selected_plan: string | null
          story: string | null
          suspended: boolean
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          voice_intro_path: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_active: { Args: { _user_id: string }; Returns: boolean }
      match_limit_for_plan: { Args: { _plan: string }; Returns: number }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      plan_period_interval: { Args: { _plan: string }; Returns: string }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      refresh_match_period: { Args: { _user_id: string }; Returns: undefined }
      save_my_bd_answers: {
        Args: { _answers: Json; _completed?: boolean }
        Returns: undefined
      }
      save_my_bd_extended: {
        Args: { _answers: Json; _completed?: boolean }
        Returns: undefined
      }
      set_my_reveal: { Args: { _match_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      interest_status: "pending" | "accepted" | "declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      interest_status: ["pending", "accepted", "declined"],
    },
  },
} as const
