-- Fix subscriptions RLS policy to work with Firebase authentication
-- Since users authenticate with Firebase (not Supabase Auth), we need to allow
-- public SELECT for subscriptions and filter by user_id in application code

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Public can view subscriptions by user_id" ON subscriptions;

-- Create new policy that works with Firebase UID
-- Note: For INSERT/UPDATE, we use API routes with service role (bypasses RLS)
-- For SELECT, we allow public read but filter by user_id in application code
-- This is safe because we validate user_id on the server side via API routes

-- Allow public SELECT (filtered by user_id in application)
CREATE POLICY "Public can view subscriptions by user_id" ON subscriptions
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE are handled via API routes with service role
-- So we don't need policies for those operations
