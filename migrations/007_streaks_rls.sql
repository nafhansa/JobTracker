-- RLS Policies for User Streaks Table (Daily Only)
-- Row Level Security for streaks tracking

-- Enable RLS on user_streaks table
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own streaks
CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own streaks
CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Service role (for admin/analytics) can view all streaks
CREATE POLICY "Service role can view all streaks" ON user_streaks
  FOR SELECT TO authenticated
  USING (
    (SELECT EXISTS (
      SELECT 1 FROM pg_roles 
      WHERE rolname = current_user
      AND rolname IN ('service_role', 'postgres')
    ))
  );

-- Service role can update all streaks
CREATE POLICY "Service role can update all streaks" ON user_streaks
  FOR UPDATE TO authenticated
  USING (
    (SELECT EXISTS (
      SELECT 1 FROM pg_roles 
      WHERE rolname = current_user
      AND rolname IN ('service_role', 'postgres')
    ))
  );
