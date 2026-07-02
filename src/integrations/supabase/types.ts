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
      ads: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          is_active: boolean
          media_type: string
          media_url: string
          title: string
          uploaded_by: string | null
          uploaded_by_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          media_type: string
          media_url: string
          title: string
          uploaded_by?: string | null
          uploaded_by_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string
          title?: string
          uploaded_by?: string | null
          uploaded_by_id?: string | null
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          pin: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          pin: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          pin?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_id: string | null
          duration: number
          id: string
          notes: string | null
          patient_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor_id?: string | null
          duration?: number
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_id?: string | null
          duration?: number
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_ups: {
        Row: {
          cashier_id: string | null
          cashier_name: string | null
          closed_at: string | null
          counted_card: number
          counted_cash: number
          counted_mobile: number
          expected_card: number
          expected_cash: number
          expected_mobile: number
          id: string
          notes: string | null
          opened_at: string
          opening_float: number
          shift_number: string
          variance: number
        }
        Insert: {
          cashier_id?: string | null
          cashier_name?: string | null
          closed_at?: string | null
          counted_card?: number
          counted_cash?: number
          counted_mobile?: number
          expected_card?: number
          expected_cash?: number
          expected_mobile?: number
          id?: string
          notes?: string | null
          opened_at?: string
          opening_float?: number
          shift_number: string
          variance?: number
        }
        Update: {
          cashier_id?: string | null
          cashier_name?: string | null
          closed_at?: string | null
          counted_card?: number
          counted_cash?: number
          counted_mobile?: number
          expected_card?: number
          expected_cash?: number
          expected_mobile?: number
          id?: string
          notes?: string | null
          opened_at?: string
          opening_float?: number
          shift_number?: string
          variance?: number
        }
        Relationships: []
      }
      consultations: {
        Row: {
          chief_complaint: string | null
          created_at: string
          date: string
          diagnosis: string | null
          doctor_id: string | null
          doctor_name: string | null
          id: string
          notes: string | null
          patient_id: string | null
          prescription: string | null
          treatment: string | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          date?: string
          diagnosis?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          prescription?: string | null
          treatment?: string | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          date?: string
          diagnosis?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          prescription?: string | null
          treatment?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          specialization: string | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          barcode: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string
          lines: Json
          notes: string | null
          patient_id: string | null
          patient_name: string | null
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string
          lines?: Json
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string
          lines?: Json
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      medical_certificates: {
        Row: {
          created_at: string
          doctor_name: string | null
          from_date: string | null
          id: string
          issued_date: string
          patient_id: string | null
          patient_name: string | null
          reason: string | null
          recommendation: string | null
          to_date: string | null
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          from_date?: string | null
          id?: string
          issued_date?: string
          patient_id?: string | null
          patient_name?: string | null
          reason?: string | null
          recommendation?: string | null
          to_date?: string | null
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          from_date?: string | null
          id?: string
          issued_date?: string
          patient_id?: string | null
          patient_name?: string | null
          reason?: string | null
          recommendation?: string | null
          to_date?: string | null
        }
        Relationships: []
      }
      patient_credits: {
        Row: {
          balance: number
          last_updated: string
          patient_id: string
          patient_name: string | null
        }
        Insert: {
          balance?: number
          last_updated?: string
          patient_id: string
          patient_name?: string | null
        }
        Update: {
          balance?: number
          last_updated?: string
          patient_id?: string
          patient_name?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: Json | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical_history: Json | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: Json | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          medical_history?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: Json | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical_history?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_items: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string
          expiry_date: string | null
          id: string
          name: string
          reorder_level: number
          stock: number
          supplier: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          name: string
          reorder_level?: number
          stock?: number
          supplier?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          name?: string
          reorder_level?: number
          stock?: number
          supplier?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      queue_tickets: {
        Row: {
          appointment_id: string | null
          called_at: string | null
          called_by: string | null
          code: string
          created_at: string
          dept: string
          done_at: string | null
          id: string
          number: number
          patient_id: string | null
          patient_name: string
          room: string | null
          served_at: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          called_at?: string | null
          called_by?: string | null
          code: string
          created_at?: string
          dept: string
          done_at?: string | null
          id?: string
          number: number
          patient_id?: string | null
          patient_name: string
          room?: string | null
          served_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          called_at?: string | null
          called_by?: string | null
          code?: string
          created_at?: string
          dept?: string
          done_at?: string | null
          id?: string
          number?: number
          patient_id?: string | null
          patient_name?: string
          room?: string | null
          served_at?: string | null
          status?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          cashier_id: string | null
          created_at: string
          customer_name: string | null
          id: string
          lines: Json
          payment_method: string
          receipt_number: string
          total: number
        }
        Insert: {
          cashier_id?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          lines?: Json
          payment_method?: string
          receipt_number: string
          total?: number
        }
        Update: {
          cashier_id?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          lines?: Json
          payment_method?: string
          receipt_number?: string
          total?: number
        }
        Relationships: []
      }
      service_prices: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          blood_pressure: string | null
          bmi: number | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string | null
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure?: string | null
          bmi?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure?: string | null
          bmi?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      issue_queue_ticket: {
        Args: {
          p_appointment_id: string
          p_dept: string
          p_patient_id: string
          p_patient_name: string
        }
        Returns: {
          appointment_id: string | null
          called_at: string | null
          called_by: string | null
          code: string
          created_at: string
          dept: string
          done_at: string | null
          id: string
          number: number
          patient_id: string | null
          patient_name: string
          room: string | null
          served_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "queue_tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
