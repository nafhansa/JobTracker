-- ===========================================
-- JPs (Job Points) System: Replace credits with coins
-- Cost per generation: 80 JPs
-- Free: 240 JPs/week, Monthly: 400 JPs/week, Lifetime: 400 JPs/week
-- ===========================================

-- Drop old tables (feature is in dev, no production data)
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS ai_credits CASCADE;

-- Drop old trigger & function
DROP TRIGGER IF EXISTS on_new_user_ai_writer ON users;
DROP FUNCTION IF EXISTS handle_new_user_ai_writer();
DROP FUNCTION IF EXISTS initialize_ai_credits(TEXT, TEXT);

-- ===========================================
-- 1. AI Coins (per user) - replaces ai_credits
-- ===========================================
CREATE TABLE ai_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weekly_coins INTEGER DEFAULT 0,
  purchased_coins INTEGER DEFAULT 0,
  weekly_coin_allocation INTEGER DEFAULT 240,
  weekly_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 2. Coin Transactions (audit trail) - replaces credit_transactions
-- ===========================================
CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'weekly_reset', 'admin_adjust')),
  reference_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 3. Coin Packages (config) - replaces credit_packages
-- ===========================================
CREATE TABLE coin_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  price_idr INTEGER NOT NULL,
  price_usd NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 4. Generated Documents (unchanged but ensured)
-- ===========================================
-- (already exists, no changes needed)

-- ===========================================
-- Indexes
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_ai_coins_user_id ON ai_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_packages_active ON coin_packages(is_active) WHERE is_active = true;

-- ===========================================
-- RLS Policies
-- ===========================================
ALTER TABLE ai_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coins" ON ai_coins FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

CREATE POLICY "Anyone can view active coin packages" ON coin_packages FOR SELECT USING (is_active = true);

-- ===========================================
-- Seed coin packages (IDR only)
-- ===========================================
INSERT INTO coin_packages (name, coins, price_idr, price_usd, is_active) VALUES
  ('Jalur Doa', 1000, 10000, NULL, true),
  ('Mulai Panik', 2200, 20000, NULL, true),
  ('Budak Korporat', 4500, 40000, NULL, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Function to initialize coins for new user
-- ===========================================
CREATE OR REPLACE FUNCTION initialize_ai_coins(p_user_id TEXT, p_plan TEXT DEFAULT 'free')
RETURNS VOID AS $$
DECLARE
  v_allocation INTEGER;
BEGIN
  CASE p_plan
    WHEN 'lifetime' THEN v_allocation := 400;
    WHEN 'monthly' THEN v_allocation := 400;
    ELSE v_allocation := 240;
  END CASE;

  INSERT INTO ai_coins (user_id, weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at)
  VALUES (p_user_id, v_allocation, 0, v_allocation, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- Trigger: auto-create profile & coins on user insert
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user_ai_writer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM initialize_ai_coins(NEW.id, COALESCE(NEW.subscription_plan, 'free'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_user_ai_writer ON users;
CREATE TRIGGER on_new_user_ai_writer
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_ai_writer();