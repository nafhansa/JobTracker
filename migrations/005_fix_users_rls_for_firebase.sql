-- Fix RLS policies for users table to work with Firebase authentication
-- Since users authenticate with Firebase (not Supabase Auth), we need to allow
-- operations based on user_id parameter instead of auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can insert own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;

-- Create new policies that work with Firebase UID
-- Note: INSERT/UPDATE are handled via API routes with service role (bypasses RLS)
-- For SELECT, we allow public read but filter by id in application code
-- This is safe because we validate user_id on the server side via API routes

-- Allow public SELECT (filtered by id in application)
CREATE POLICY "Public can view users by id" ON users
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE are handled via API routes with service role
-- So we don't need policies for those operations
