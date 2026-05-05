import { createClient } from '@supabase/supabase-js';
import { JobApplication } from '@/types';

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          company: string;
          industry: string;
          recruiter_email: string | null;
          application_url: string | null;
          job_type: string | null;
          location: string | null;
          potential_salary: number | null;
          potential_salary_min: number | null;
          potential_salary_max: number | null;
          salary_type: string | null;
          currency: string;
          status_applied: boolean;
          status_emailed: boolean;
          status_cv_responded: boolean;
          status_interview_email: boolean;
          status_contract_email: boolean;
          status_rejected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          subscription_plan: string;
          subscription_status: string;
          is_pro: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          renews_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      pending_midtrans_transactions: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          plan: string;
          amount: number;
          snap_token: string;
          customer_email: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pending_midtrans_transactions']['Row'], 'id' | 'created_at' | 'expires_at'>;
        Update: Partial<Database['public']['Tables']['pending_midtrans_transactions']['Insert']>;
      };
      analytics_micro_conversions: {
        Row: {
          id: string;
          type: string;
          value: number | null;
          session_id: string | null;
          page: string | null;
          timestamp: string;
        };
        Insert: Omit<Database['public']['Tables']['analytics_micro_conversions']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['analytics_micro_conversions']['Insert']>;
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          rating: number | null;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feedback']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          skills: string[];
          experience: any;
          education: any;
          summary: string | null;
          resume_url: string | null;
          extracted_resume_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      ai_coins: {
        Row: {
          id: string;
          user_id: string;
          weekly_coins: number;
          purchased_coins: number;
          weekly_coin_allocation: number;
          weekly_reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_coins']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ai_coins']['Insert']>;
      };
      coin_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          reference_id: string | null;
          metadata: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coin_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['coin_transactions']['Insert']>;
      };
      coin_purchases: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          package_id: string;
          coins: number;
          amount_idr: number;
          status: string;
          payment_type: string | null;
          midtrans_transaction_id: string | null;
          snap_token: string | null;
          credited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coin_purchases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['coin_purchases']['Insert']>;
      };
      coin_packages: {
        Row: {
          id: string;
          name: string;
          coins: number;
          price_idr: number;
          price_usd: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coin_packages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['coin_packages']['Insert']>;
      };
      generated_documents: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          type: string;
          target_name: string | null;
          target_company: string | null;
          target_role: string | null;
          content: string;
          prompt_data: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['generated_documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['generated_documents']['Insert']>;
      };
    };
  };
};

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
