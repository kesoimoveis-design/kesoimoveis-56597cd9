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
      cities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          state: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          state: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          state?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          id: string
          message: string | null
          name: string
          phone: string
          property_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          name: string
          phone: string
          property_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          featured: boolean
          finalidade: Database["public"]["Enums"]["property_finalidade"]
          id: string
          is_owner_direct: boolean
          owner_id: string
          parking_spaces: number | null
          price: number
          status: Database["public"]["Enums"]["property_status"]
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          address: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          featured?: boolean
          finalidade: Database["public"]["Enums"]["property_finalidade"]
          id?: string
          is_owner_direct?: boolean
          owner_id: string
          parking_spaces?: number | null
          price: number
          status?: Database["public"]["Enums"]["property_status"]
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          address?: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          featured?: boolean
          finalidade?: Database["public"]["Enums"]["property_finalidade"]
          id?: string
          is_owner_direct?: boolean
          owner_id?: string
          parking_spaces?: number | null
          price?: number
          status?: Database["public"]["Enums"]["property_status"]
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          created_at: string
          id: string
          is_main: boolean
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_main?: boolean
          property_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_main?: boolean
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          created_at: string
          id: string
          property_id: string
          service_id: string
          status: Database["public"]["Enums"]["service_order_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          service_id: string
          status?: Database["public"]["Enums"]["service_order_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["service_order_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          legal_assistance: boolean
          name: string
          photos_included: boolean
          price: number
          video_included: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          legal_assistance?: boolean
          name: string
          photos_included?: boolean
          price: number
          video_included?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          legal_assistance?: boolean
          name?: string
          photos_included?: boolean
          price?: number
          video_included?: boolean
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
      expire_owner_direct_properties: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "buyer"
      property_finalidade: "buy" | "rent"
      property_status: "active" | "pending" | "expired" | "paused"
      property_type: "casa" | "apartamento" | "terreno" | "comercial" | "rural"
      service_order_status: "pending" | "completed" | "cancelled"
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
      app_role: ["admin", "owner", "buyer"],
      property_finalidade: ["buy", "rent"],
      property_status: ["active", "pending", "expired", "paused"],
      property_type: ["casa", "apartamento", "terreno", "comercial", "rural"],
      service_order_status: ["pending", "completed", "cancelled"],
    },
  },
} as const
