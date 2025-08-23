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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      import_errors: {
        Row: {
          created_at: string
          error_message: string
          error_type: string
          id: string
          import_job_id: string
          row_data: Json | null
          row_number: number
        }
        Insert: {
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          import_job_id: string
          row_data?: Json | null
          row_number: number
        }
        Update: {
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          import_job_id?: string
          row_data?: Json | null
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          column_mapping: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          failed_rows: number | null
          file_size: number | null
          filename: string
          id: string
          imported_rows: number | null
          integration_id: string
          processed_rows: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["import_job_status"]
          total_rows: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_rows?: number | null
          file_size?: number | null
          filename: string
          id?: string
          imported_rows?: number | null
          integration_id: string
          processed_rows?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_job_status"]
          total_rows?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_rows?: number | null
          file_size?: number | null
          filename?: string
          id?: string
          imported_rows?: number | null
          integration_id?: string
          processed_rows?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_job_status"]
          total_rows?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_accounts: {
        Row: {
          account_id: string | null
          account_name: string | null
          created_at: string
          credentials_encrypted: string | null
          expires_at: string | null
          id: string
          integration_id: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          expires_at?: string | null
          id?: string
          integration_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          expires_at?: string | null
          id?: string
          integration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          metadata: Json | null
          platform: string
          status: Database["public"]["Enums"]["integration_status"]
          total_reviews: number | null
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform: string
          status?: Database["public"]["Enums"]["integration_status"]
          total_reviews?: number | null
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform?: string
          status?: Database["public"]["Enums"]["integration_status"]
          total_reviews?: number | null
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_sources: {
        Row: {
          created_at: string
          key_masked: string | null
          last_sync_at: string | null
          platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          key_masked?: string | null
          last_sync_at?: string | null
          platform: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          key_masked?: string | null
          last_sync_at?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          date: string
          id: string
          platform: string
          rating: number
          sentiment: string
          text: string
          title: string | null
          topics: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          platform: string
          rating: number
          sentiment: string
          text: string
          title?: string | null
          topics?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          platform?: string
          rating?: number
          sentiment?: string
          text?: string
          title?: string | null
          topics?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          hotel_name: string | null
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hotel_name?: string | null
          id?: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hotel_name?: string | null
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      import_job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      integration_status: "not_connected" | "connected" | "error" | "syncing"
      integration_type: "csv" | "api"
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
      import_job_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      integration_status: ["not_connected", "connected", "error", "syncing"],
      integration_type: ["csv", "api"],
    },
  },
} as const
