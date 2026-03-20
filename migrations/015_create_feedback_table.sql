-- Create feedback table for user feedback system
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'bug', 'feature')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Create index for faster queries by type
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);

-- Create index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow insert for all authenticated users (via service role)
CREATE POLICY "Allow insert for all users" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Allow read only for admin (via service role)
-- Regular users should not be able to read other users' feedback
CREATE POLICY "Allow read via service role only" ON feedback
  FOR SELECT
  USING (false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON feedback TO anon, authenticated;