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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          room_id: string | null
          starts_at: string | null
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          room_id?: string | null
          starts_at?: string | null
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          room_id?: string | null
          starts_at?: string | null
          title?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string | null
          id: number
          payload: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string | null
          id?: number
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string | null
          id?: number
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reads: {
        Row: {
          ic_member_id: string
          last_read_at: string
          room_id: string
        }
        Insert: {
          ic_member_id: string
          last_read_at?: string
          room_id: string
        }
        Update: {
          ic_member_id?: string
          last_read_at?: string
          room_id?: string
        }
        Relationships: []
      }
      chat_settings: {
        Row: {
          config: Json
          scope: string
          updated_at: string
        }
        Insert: {
          config?: Json
          scope?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_permissions: {
        Row: {
          allow_roles: string[]
          feature: string
        }
        Insert: {
          allow_roles?: string[]
          feature: string
        }
        Update: {
          allow_roles?: string[]
          feature?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_voice: boolean | null
          media_duration: number | null
          message_type: Database["public"]["Enums"]["message_type"]
          quoted_message_id: string | null
          reply_to_message_id: string | null
          room_id: string
          search_vec: unknown | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_voice?: boolean | null
          media_duration?: number | null
          message_type?: Database["public"]["Enums"]["message_type"]
          quoted_message_id?: string | null
          reply_to_message_id?: string | null
          room_id: string
          search_vec?: unknown | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_voice?: boolean | null
          media_duration?: number | null
          message_type?: Database["public"]["Enums"]["message_type"]
          quoted_message_id?: string | null
          reply_to_message_id?: string | null
          room_id?: string
          search_vec?: unknown | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_quoted_message_id_fkey"
            columns: ["quoted_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          kind: string
          message_id: string
          read_at: string | null
          room_id: string
          user_ic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          message_id: string
          read_at?: string | null
          room_id: string
          user_ic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message_id?: string
          read_at?: string | null
          room_id?: string
          user_ic_id?: string
        }
        Relationships: []
      }
      room_announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          room_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          room_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_announcements_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_last_seen: {
        Row: {
          last_seen: string
          room_id: string
          user_id: string
        }
        Insert: {
          last_seen?: string
          room_id: string
          user_id: string
        }
        Update: {
          last_seen?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_last_seen_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["room_member_role"]
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["room_member_role"]
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["room_member_role"]
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      room_settings: {
        Row: {
          allow_file_upload: boolean | null
          allow_video: boolean | null
          created_at: string | null
          enter_sends: boolean | null
          max_message_length: number | null
          message_retention_days: number | null
          room_id: string
          show_flags: boolean | null
          show_rank: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_file_upload?: boolean | null
          allow_video?: boolean | null
          created_at?: string | null
          enter_sends?: boolean | null
          max_message_length?: number | null
          message_retention_days?: number | null
          room_id: string
          show_flags?: boolean | null
          show_rank?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_file_upload?: boolean | null
          allow_video?: boolean | null
          created_at?: string | null
          enter_sends?: boolean | null
          max_message_length?: number | null
          message_retention_days?: number | null
          room_id?: string
          show_flags?: boolean | null
          show_rank?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_settings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_private: boolean
          member_limit: number
          name: string
          password: string | null
          password_hash: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          member_limit?: number
          name: string
          password?: string | null
          password_hash?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          member_limit?: number
          name?: string
          password?: string | null
          password_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_id: string
          scheduled_at: string | null
          sent: boolean | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_id: string
          scheduled_at?: string | null
          sent?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string
          scheduled_at?: string | null
          sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "system_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      translations_cache: {
        Row: {
          created_at: string
          lang: string
          message_id: string
          translated: string
        }
        Insert: {
          created_at?: string
          lang: string
          message_id: string
          translated: string
        }
        Update: {
          created_at?: string
          lang?: string
          message_id?: string
          translated?: string
        }
        Relationships: []
      }
      user_ban_records: {
        Row: {
          active: boolean
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          active: boolean | null
          banned_at: string | null
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: number
          permanent: boolean | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: number
          permanent?: boolean | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: number
          permanent?: boolean | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_global_roles: {
        Row: {
          created_at: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_prefs: {
        Row: {
          sound_mention: boolean
          sound_new_msg: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          sound_mention?: boolean
          sound_new_msg?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          sound_mention?: boolean
          sound_new_msg?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          last_seen?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          last_seen?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country_code: string | null
          created_at: string
          email: string
          id: string
          is_banned: boolean
          is_muted: boolean
          last_seen: string | null
          rank: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          username: string
        }
        Insert: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          id: string
          is_banned?: boolean
          is_muted?: boolean
          last_seen?: string | null
          rank?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          username: string
        }
        Update: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          last_seen?: string | null
          rank?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      notifications_unread: {
        Row: {
          unread_count: number | null
          user_ic_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_to_room: {
        Args: { p_role?: string; p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      archive_messages: {
        Args: { p_before?: string; p_room?: string }
        Returns: number
      }
      ban_user: {
        Args: {
          p_actor: string
          p_minutes: number
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      can_post_now: {
        Args: { p_ic_id: string; p_max?: number; p_window_seconds?: number }
        Returns: boolean
      }
      check_room_password: {
        Args: { p_plain: string; p_room: string }
        Returns: boolean
      }
      create_room: {
        Args: {
          p_creator: string
          p_id: string
          p_is_private: boolean
          p_name: string
        }
        Returns: undefined
      }
      delete_message: {
        Args: { p_id: string; p_requester: string }
        Returns: undefined
      }
      delete_messages_range: {
        Args: { p_from?: string; p_scope: string; p_to?: string }
        Returns: number
      }
      export_all_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          archived_at: string | null
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_voice: boolean | null
          media_duration: number | null
          message_type: Database["public"]["Enums"]["message_type"]
          quoted_message_id: string | null
          reply_to_message_id: string | null
          room_id: string
          search_vec: unknown | null
          user_id: string
        }[]
      }
      export_messages: {
        Args: { p_room: string }
        Returns: {
          archived_at: string | null
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_voice: boolean | null
          media_duration: number | null
          message_type: Database["public"]["Enums"]["message_type"]
          quoted_message_id: string | null
          reply_to_message_id: string | null
          room_id: string
          search_vec: unknown | null
          user_id: string
        }[]
      }
      get_active_announcements: {
        Args: { p_room?: string }
        Returns: {
          body: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          room_id: string | null
          starts_at: string | null
          title: string | null
        }[]
      }
      get_chat_settings: {
        Args: { p_scope?: string }
        Returns: Json
      }
      get_effective_role: {
        Args: { p_room: string; p_user: string }
        Returns: string
      }
      get_last_read: {
        Args: { p_ic_id: string; p_room_id: string }
        Returns: string
      }
      has_permission: {
        Args: { p_action: string; p_room: string; p_user: string }
        Returns: boolean
      }
      import_messages: {
        Args: { p_payload: Json }
        Returns: number
      }
      list_permissions: {
        Args: { p_room: string; p_user: string }
        Returns: {
          allowed: boolean
          feature: string
        }[]
      }
      list_rooms_for_user: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          is_private: boolean
          name: string
        }[]
      }
      mark_room_read: {
        Args: { p_ic_id: string; p_room_id: string }
        Returns: undefined
      }
      post_system_message: {
        Args: { p_content: string; p_room: string }
        Returns: string
      }
      reboot_chat: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_user_from_room: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      search_messages: {
        Args:
          | {
              p_from?: string
              p_include_archived?: boolean
              p_limit?: number
              p_offset?: number
              p_q: string
              p_room?: string
              p_to?: string
              p_user?: string
            }
          | {
              p_limit?: number
              p_query?: string
              p_room?: string
              p_user?: string
            }
        Returns: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }[]
      }
      set_room_password: {
        Args: { p_plain: string; p_room: string }
        Returns: undefined
      }
      stats_counts_all: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: number
          today: number
          total: number
        }[]
      }
      stats_top_users: {
        Args: { p_limit?: number }
        Returns: {
          messages: number
          user_id: string
        }[]
      }
      unban_user: {
        Args: { p_actor: string; p_user_id: string }
        Returns: undefined
      }
      update_message: {
        Args: { p_editor: string; p_id: string; p_new_text: string }
        Returns: undefined
      }
      update_user_last_seen: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      upsert_chat_settings: {
        Args: { p_config: Json; p_scope: string }
        Returns: undefined
      }
      upsert_user_prefs: {
        Args: { p_sound_mention: boolean; p_sound_new: boolean; p_user: string }
        Returns: undefined
      }
    }
    Enums: {
      message_type: "text" | "file" | "voice" | "system"
      room_member_role: "owner" | "admin" | "member"
      user_role: "admin" | "moderator" | "user"
      user_status: "online" | "offline" | "away"
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
      message_type: ["text", "file", "voice", "system"],
      room_member_role: ["owner", "admin", "member"],
      user_role: ["admin", "moderator", "user"],
      user_status: ["online", "offline", "away"],
    },
  },
} as const
