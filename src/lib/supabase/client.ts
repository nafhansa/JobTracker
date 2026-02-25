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
    };
  };
};

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
