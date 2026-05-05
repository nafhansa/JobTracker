-- ===========================================
-- AI Writer: Credits, User Profiles, Generated Documents
-- ===========================================

-- 1. User Professional Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  skills TEXT[] DEFAULT '{}',
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  resume_url TEXT,
  extracted_resume_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Credits (per user)
CREATE TABLE IF NOT EXISTS ai_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weekly_credits INTEGER DEFAULT 0,
  purchased_credits INTEGER DEFAULT 0,
  weekly_allocation INTEGER DEFAULT 1,
  weekly_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Credit Transactions (audit trail)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'weekly_reset', 'admin_adjust')),
  reference_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Credit Packages (config)
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_idr INTEGER NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Generated Documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('cover_letter', 'cold_email', 'cold_dm_instagram', 'cold_wa', 'cold_linkedin')),
  target_name TEXT,
  target_company TEXT,
  target_role TEXT,
  content TEXT NOT NULL,
  prompt_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Indexes
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credits_user_id ON ai_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(type);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at DESC);

-- ===========================================
-- RLS Policies
-- ===========================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- user_profiles: users can read/write their own
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

-- ai_credits: users can read their own, server can manage
CREATE POLICY "Users can view own credits" ON ai_credits FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

-- credit_transactions: users can read their own
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

-- credit_packages: anyone can read active packages
CREATE POLICY "Anyone can view active credit packages" ON credit_packages FOR SELECT USING (is_active = true);

-- generated_documents: users can read/write their own
CREATE POLICY "Users can view own documents" ON generated_documents FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
CREATE POLICY "Users can insert own documents" ON generated_documents FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

-- ===========================================
-- Seed default credit packages
-- ===========================================
INSERT INTO credit_packages (name, credits, price_idr, price_usd, is_active) VALUES
  ('Starter', 5, 9900, 0.99, true),
  ('Popular', 15, 24900, 2.49, true),
  ('Best Value', 50, 64900, 5.99, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Function to initialize credits for new user
-- ===========================================
CREATE OR REPLACE FUNCTION initialize_ai_credits(p_user_id TEXT, p_plan TEXT DEFAULT 'free')
RETURNS VOID AS $$
DECLARE
  v_allocation INTEGER;
BEGIN
  CASE p_plan
    WHEN 'lifetime' THEN v_allocation := 10;
    WHEN 'monthly' THEN v_allocation := 5;
    ELSE v_allocation := 1;
  END CASE;

  INSERT INTO ai_credits (user_id, weekly_credits, purchased_credits, weekly_allocation, weekly_reset_at)
  VALUES (p_user_id, v_allocation, 0, v_allocation, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- Trigger: auto-create profile & credits on user insert
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user_ai_writer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM initialize_ai_credits(NEW.id, COALESCE(NEW.subscription_plan, 'free'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_user_ai_writer ON users;
CREATE TRIGGER on_new_user_ai_writer
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_ai_writer();