/**
 * Feature Flags for Migration
 * 
 * Control which database to use during migration period
 */

export const USE_SUPABASE_READ = process.env.NEXT_PUBLIC_USE_SUPABASE_READ === 'true';
export const USE_SUPABASE_WRITE = process.env.NEXT_PUBLIC_USE_SUPABASE_WRITE === 'true';

// Default: use Firebase (backward compatible)
export const shouldReadFromSupabase = () => USE_SUPABASE_READ;
export const shouldWriteToSupabase = () => USE_SUPABASE_WRITE;
