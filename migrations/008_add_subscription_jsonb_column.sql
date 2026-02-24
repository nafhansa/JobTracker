-- Add subscription JSONB column to users table
-- This stores the subscription in same format as Firebase for easier syncing

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{"plan": "free", "status": "active"}';

-- Update existing users to populate subscription column from individual columns
UPDATE users 
SET subscription = jsonb_build_object(
  'plan', COALESCE(subscription_plan, 'free'),
  'status', COALESCE(subscription_status, 'active')
)
WHERE subscription IS NULL OR subscription = '{}'::jsonb OR subscription = '{"plan": "free", "status": "active"}'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users USING GIN(subscription);

-- Add updated_at column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
