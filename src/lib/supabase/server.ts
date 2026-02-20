import { createClient } from '@supabase/supabase-js';
import { Database } from './client';

// Server-side Supabase client with service role key for admin operations
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// For API routes that need admin access
export const supabaseAdmin = createServerClient();
