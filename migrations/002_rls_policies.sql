-- Row Level Security (RLS) Policies
-- Enable RLS on all tables and create policies

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboard_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_micro_conversions ENABLE ROW LEVEL SECURITY;

-- Jobs Policies
-- Users can only see their own jobs
-- Note: user_id is TEXT (Firebase UID), so we compare as text
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid()::text = user_id);

-- Users Policies
-- Users can view their own user record
CREATE POLICY "Users can view own user data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can insert their own user record
CREATE POLICY "Users can insert own user data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users can update their own user record
CREATE POLICY "Users can update own user data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Subscriptions Policies
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Analytics Policies
-- Public insert for analytics (anyone can track)
CREATE POLICY "Public can insert analytics visits" ON analytics_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert analytics logins" ON analytics_logins
  FOR INSERT WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics logins" ON analytics_logins
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Public can insert dashboard visits" ON analytics_dashboard_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own dashboard visits" ON analytics_dashboard_visits
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Public can insert active users" ON analytics_active_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own active user record" ON analytics_active_users
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Public can insert micro conversions" ON analytics_micro_conversions
  FOR INSERT WITH CHECK (true);

-- Admin function to check if user is admin
-- This will be used in service role queries
CREATE OR REPLACE FUNCTION is_admin_user(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email IN ('nafhan1723@gmail.com', 'nafhan.sh@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
