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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exercise_images: {
        Row: {
          created_at: string
          equipment: string | null
          exercise_name: string
          exercise_name_normalized: string
          id: string
          image_url: string
          muscle_group: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          exercise_name: string
          exercise_name_normalized: string
          id?: string
          image_url: string
          muscle_group?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          exercise_name?: string
          exercise_name_normalized?: string
          id?: string
          image_url?: string
          muscle_group?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gym_members: {
        Row: {
          age: number
          birth_date: string | null
          created_at: string
          document_number: string
          full_name: string
          height_cm: number | null
          id: string
          sex: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age: number
          birth_date?: string | null
          created_at?: string
          document_number: string
          full_name: string
          height_cm?: number | null
          id?: string
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number
          birth_date?: string | null
          created_at?: string
          document_number?: string
          full_name?: string
          height_cm?: number | null
          id?: string
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          activity_factor: number
          carbs_g: number
          created_at: string
          daily_calories: number
          fats_g: number
          id: string
          member_id: string | null
          objective: string | null
          protein_g: number
          tmb: number
        }
        Insert: {
          activity_factor?: number
          carbs_g: number
          created_at?: string
          daily_calories: number
          fats_g: number
          id?: string
          member_id?: string | null
          objective?: string | null
          protein_g: number
          tmb: number
        }
        Update: {
          activity_factor?: number
          carbs_g?: number
          created_at?: string
          daily_calories?: number
          fats_g?: number
          id?: string
          member_id?: string | null
          objective?: string | null
          protein_g?: number
          tmb?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_assessments: {
        Row: {
          assessment_date: string
          bmi: number
          body_fat_percentage: number
          created_at: string
          created_by: string | null
          height_cm: number | null
          id: string
          member_id: string
          muscle_mass_percentage: number
          notes: string | null
          visceral_fat: number
          weight_kg: number | null
        }
        Insert: {
          assessment_date?: string
          bmi: number
          body_fat_percentage: number
          created_at?: string
          created_by?: string | null
          height_cm?: number | null
          id?: string
          member_id: string
          muscle_mass_percentage: number
          notes?: string | null
          visceral_fat: number
          weight_kg?: number | null
        }
        Update: {
          assessment_date?: string
          bmi?: number
          body_fat_percentage?: number
          created_at?: string
          created_by?: string | null
          height_cm?: number | null
          id?: string
          member_id?: string
          muscle_mass_percentage?: number
          notes?: string | null
          visceral_fat?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_assessments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string
          day_number: number
          equipment: string | null
          exercise_name: string
          exercise_order: number
          id: string
          notes: string | null
          reps: string
          rir: string | null
          routine_id: string
          sets: number
        }
        Insert: {
          created_at?: string
          day_number?: number
          equipment?: string | null
          exercise_name: string
          exercise_order?: number
          id?: string
          notes?: string | null
          reps: string
          rir?: string | null
          routine_id: string
          sets: number
        }
        Update: {
          created_at?: string
          day_number?: number
          equipment?: string | null
          exercise_name?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          reps?: string
          rir?: string | null
          routine_id?: string
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          days_per_week: number
          focus: Database["public"]["Enums"]["training_focus"]
          generated_at: string
          id: string
          is_ai_generated: boolean | null
          level: Database["public"]["Enums"]["training_level"]
          member_age: number
          member_name: string
          objective: Database["public"]["Enums"]["training_objective"]
          routine_data: Json
        }
        Insert: {
          days_per_week: number
          focus: Database["public"]["Enums"]["training_focus"]
          generated_at?: string
          id?: string
          is_ai_generated?: boolean | null
          level: Database["public"]["Enums"]["training_level"]
          member_age: number
          member_name: string
          objective: Database["public"]["Enums"]["training_objective"]
          routine_data: Json
        }
        Update: {
          days_per_week?: number
          focus?: Database["public"]["Enums"]["training_focus"]
          generated_at?: string
          id?: string
          is_ai_generated?: boolean | null
          level?: Database["public"]["Enums"]["training_level"]
          member_age?: number
          member_name?: string
          objective?: Database["public"]["Enums"]["training_objective"]
          routine_data?: Json
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
      [_ in never]: never
    }
    Functions: {
      get_user_email: { Args: { target_user_id: string }; Returns: string }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gym_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "staff"
        | "super_admin"
        | "entrenador"
        | "recepcionista"
      training_focus:
        | "tren_superior"
        | "gluteo_pierna"
        | "full_body"
        | "push_pull_legs"
      training_level: "principiante" | "intermedio" | "avanzado"
      training_objective: "perdida_grasa" | "hipertrofia" | "recomposicion"
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
      app_role: [
        "admin",
        "staff",
        "super_admin",
        "entrenador",
        "recepcionista",
      ],
      training_focus: [
        "tren_superior",
        "gluteo_pierna",
        "full_body",
        "push_pull_legs",
      ],
      training_level: ["principiante", "intermedio", "avanzado"],
      training_objective: ["perdida_grasa", "hipertrofia", "recomposicion"],
    },
  },
} as const
