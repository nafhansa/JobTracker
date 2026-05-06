-- ===========================================
-- 025: Verify & fix JPs database schema
-- Idempotent: safe to re-run
-- ===========================================

-- ===========================================
-- 1. ai_coins: ensure unique constraint on user_id
-- ===========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_coins_user_id_key') THEN
    CREATE UNIQUE INDEX ai_coins_user_id_key ON ai_coins(user_id);
  END IF;
END $$;

-- ===========================================
-- 2. coin_transactions: unique index on reference_id for idempotent webhooks
-- ===========================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_transactions_reference_id
  ON coin_transactions(reference_id) WHERE reference_id IS NOT NULL;

-- ===========================================
-- 3. coin_packages: add slug column + unique constraint + seed data
-- ===========================================
ALTER TABLE coin_packages ADD COLUMN IF NOT EXISTS slug TEXT;

-- Drop any old partial index (won't work with ON CONFLICT)
DROP INDEX IF EXISTS idx_coin_packages_slug;

-- Add unique constraint idempotently
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coin_packages_slug_key') THEN
    ALTER TABLE coin_packages ADD CONSTRAINT coin_packages_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Backfill slug from name for existing rows
UPDATE coin_packages SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Upsert seed data
INSERT INTO coin_packages (slug, name, coins, price_idr, price_usd, is_active)
VALUES
  ('jalur-doa', 'Jalur Doa', 1000, 10000, NULL, true),
  ('mulai-panik', 'Mulai Panik', 2200, 20000, NULL, true),
  ('budak-korporat', 'Budak Korporat', 4500, 40000, NULL, true)
ON CONFLICT (slug) DO UPDATE SET
  coins = EXCLUDED.coins,
  price_idr = EXCLUDED.price_idr,
  is_active = EXCLUDED.is_active;

-- ===========================================
-- 4. pending_midtrans_transactions: ensure columns + unique order_id
-- ===========================================
ALTER TABLE pending_midtrans_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR';
ALTER TABLE pending_midtrans_transactions ADD COLUMN IF NOT EXISTS billing_day INT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_midtrans_order_id_unique
  ON pending_midtrans_transactions(order_id);

-- ===========================================
-- 5. RLS Policies: service_role full access on JPs tables
-- ===========================================
ALTER TABLE ai_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_midtrans_transactions ENABLE ROW LEVEL SECURITY;

-- ai_coins
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on ai_coins') THEN
    CREATE POLICY "Service role full access on ai_coins" ON ai_coins FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- coin_transactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on coin_transactions') THEN
    CREATE POLICY "Service role full access on coin_transactions" ON coin_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- coin_packages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on coin_packages') THEN
    CREATE POLICY "Service role full access on coin_packages" ON coin_packages FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- pending_midtrans_transactions: add UPDATE policy (insert/select/delete already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role update') THEN
    CREATE POLICY "Allow service role update" ON pending_midtrans_transactions FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- User-facing SELECT policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own coins') THEN
    CREATE POLICY "Users can view own coins" ON ai_coins FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active coin packages') THEN
    CREATE POLICY "Anyone can view active coin packages" ON coin_packages FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ===========================================
-- 6. Trigger: auto-create coins on new user
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

-- ===========================================
-- 7. Backfill: ensure all existing users have ai_coins rows
-- ===========================================
INSERT INTO ai_coins (user_id, weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at)
SELECT
  u.id,
  CASE
    WHEN u.subscription_plan = 'lifetime' THEN 400
    WHEN u.subscription_plan = 'monthly' THEN 400
    ELSE 240
  END,
  0,
  CASE
    WHEN u.subscription_plan = 'lifetime' THEN 400
    WHEN u.subscription_plan = 'monthly' THEN 400
    ELSE 240
  END,
  NOW() + INTERVAL '7 days'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM ai_coins ac WHERE ac.user_id = u.id
);

-- ===========================================
-- 8. Indexes
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_ai_coins_user_id ON ai_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_packages_active ON coin_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pending_midtrans_order_id ON pending_midtrans_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pending_midtrans_user_id ON pending_midtrans_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_midtrans_expires_at ON pending_midtrans_transactions(expires_at);