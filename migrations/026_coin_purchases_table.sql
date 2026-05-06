-- ===========================================
-- 026: Coin purchases order table
-- Permanent record of every JP purchase attempt,
-- replaces reliance on pending_midtrans_transactions for coin orders
-- ===========================================

CREATE TABLE IF NOT EXISTS coin_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  package_id TEXT NOT NULL,
  coins INTEGER NOT NULL,
  amount_idr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  payment_type TEXT,
  midtrans_transaction_id TEXT,
  snap_token TEXT,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_purchases_user_id ON coin_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_order_id ON coin_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_status ON coin_purchases(status);

-- RLS: service_role full access, users can read own
ALTER TABLE coin_purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on coin_purchases') THEN
    CREATE POLICY "Service role full access on coin_purchases" ON coin_purchases FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own purchases') THEN
    CREATE POLICY "Users can view own purchases" ON coin_purchases FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));
  END IF;
END $$;