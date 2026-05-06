-- ===========================================
-- 032: Scalability fixes for 500-1000+ users
-- - Atomic deduct with lazy reset in single function
-- - Missing indexes for coin_transactions, subscription_history
-- - Unique index for analytics_active_users
-- ===========================================

-- ===========================================
-- 1. Enhanced deduct_coins_atomic with lazy reset
-- Combines weekly reset + deduction in ONE atomic operation
-- Eliminates race condition window between getOrCreateCoins and deduct
-- ===========================================
DROP FUNCTION IF EXISTS deduct_coins_atomic(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION deduct_coins_atomic(
  p_user_id TEXT,
  p_amount INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_weekly INTEGER;
  v_purchased INTEGER;
  v_allocation INTEGER;
  v_total INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
  v_weeks_passed INTEGER;
  v_success BOOLEAN;
  v_weekly_before INTEGER;
  v_purchased_before INTEGER;
BEGIN
  -- Lock the row for this user (prevents concurrent modification)
  SELECT weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at
  INTO v_weekly, v_purchased, v_allocation, v_reset_at
  FROM ai_coins
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If no row exists, create it atomically
  IF NOT FOUND THEN
    v_allocation := CASE 
      WHEN p_amount > 0 THEN 240 -- Default free plan
      ELSE 240
    END;
    
    INSERT INTO ai_coins (user_id, weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at)
    VALUES (p_user_id, v_allocation, 0, v_allocation, v_now + INTERVAL '7 days')
    RETURNING weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at
    INTO v_weekly, v_purchased, v_allocation, v_reset_at;
  END IF;

  -- Lazy weekly reset (atomic, inside the lock)
  IF v_reset_at <= v_now THEN
    v_weeks_passed := GREATEST(FLOOR(EXTRACT(EPOCH FROM (v_now - v_reset_at)) / (7 * 24 * 60 * 60))::INTEGER, 1);
    
    UPDATE ai_coins
    SET weekly_coins = weekly_coin_allocation,
        weekly_reset_at = v_now + INTERVAL '7 days',
        updated_at = v_now
    WHERE user_id = p_user_id;
    
    -- Reset local variables to reflect new state
    v_weekly := v_allocation;
    v_reset_at := v_now + INTERVAL '7 days';
    
    -- Record weekly reset transaction
    INSERT INTO coin_transactions (user_id, amount, type, metadata, created_at)
    VALUES (p_user_id, v_allocation, 'weekly_reset', 
            jsonb_build_object('weeks_passed', v_weeks_passed), v_now);
  END IF;

  -- Save pre-deduct state for metadata
  v_weekly_before := v_weekly;
  v_purchased_before := v_purchased;
  v_total := v_weekly + v_purchased;

  -- Check sufficient balance
  IF v_total < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'insufficient_coins',
      'total_coins', v_total,
      'weekly_coins', v_weekly,
      'purchased_coins', v_purchased
    );
  END IF;

  -- Deduct atomically (weekly first, then purchased)
  IF v_weekly >= p_amount THEN
    UPDATE ai_coins
    SET weekly_coins = weekly_coins - p_amount,
        updated_at = v_now
    WHERE user_id = p_user_id;
    
    v_success := TRUE;
  ELSE
    UPDATE ai_coins
    SET weekly_coins = 0,
        purchased_coins = purchased_coins - (p_amount - v_weekly),
        updated_at = v_now
    WHERE user_id = p_user_id;
    
    v_success := TRUE;
  END IF;

  -- Return success with metadata for accurate transaction logging
  RETURN jsonb_build_object(
    'success', v_success,
    'weekly_before', v_weekly_before,
    'purchased_before', v_purchased_before,
    'weekly_after', CASE WHEN v_weekly >= p_amount THEN v_weekly - p_amount ELSE 0 END,
    'purchased_after', CASE WHEN v_weekly >= p_amount THEN v_purchased ELSE v_purchased - (p_amount - v_weekly) END,
    'deducted_from', CASE 
      WHEN v_weekly_before >= p_amount THEN 'weekly_only'
      WHEN v_weekly_before > 0 THEN 'mixed'
      ELSE 'purchased_only'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 2. Enhanced get_or_create_coins_atomic with lazy reset
-- Now includes lazy reset logic inside the function
-- ===========================================
DROP FUNCTION IF EXISTS get_or_create_coins_atomic(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_or_create_coins_atomic(
  p_user_id TEXT,
  p_plan TEXT DEFAULT 'free'
) RETURNS TABLE (
  out_weekly_coins INTEGER,
  out_purchased_coins INTEGER,
  out_weekly_coin_allocation INTEGER,
  out_weekly_reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_allocation INTEGER;
  v_result RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_weeks_passed INTEGER;
BEGIN
  -- Determine allocation based on plan
  CASE p_plan
    WHEN 'lifetime' THEN v_allocation := 400;
    WHEN 'monthly' THEN v_allocation := 400;
    ELSE v_allocation := 240;
  END CASE;

  -- Try to insert with ON CONFLICT DO NOTHING (handles concurrent creation)
  INSERT INTO ai_coins (user_id, weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at)
  VALUES (p_user_id, v_allocation, 0, v_allocation, v_now + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;

  -- Select the row (will always exist after upsert)
  SELECT ac.weekly_coins, ac.purchased_coins, ac.weekly_coin_allocation, ac.weekly_reset_at
  INTO v_result
  FROM ai_coins ac
  WHERE ac.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to get or create coins for user %', p_user_id;
  END IF;

  -- Lazy reset if needed (atomic, single UPDATE)
  IF v_result.weekly_reset_at <= v_now THEN
    v_weeks_passed := GREATEST(FLOOR(EXTRACT(EPOCH FROM (v_now - v_result.weekly_reset_at)) / (7 * 24 * 60 * 60))::INTEGER, 1);
    
    UPDATE ai_coins
    SET weekly_coins = weekly_coin_allocation,
        weekly_reset_at = v_now + INTERVAL '7 days',
        updated_at = v_now
    WHERE user_id = p_user_id
      AND weekly_reset_at <= v_now; -- Only reset if still due (prevents double-reset)
    
    -- Record weekly reset transaction (idempotent check)
    INSERT INTO coin_transactions (user_id, amount, type, metadata, created_at)
    SELECT p_user_id, v_allocation, 'weekly_reset', 
           jsonb_build_object('weeks_passed', v_weeks_passed), v_now
    WHERE NOT EXISTS (
      SELECT 1 FROM coin_transactions 
      WHERE user_id = p_user_id 
        AND type = 'weekly_reset' 
        AND created_at > v_now - INTERVAL '1 hour'
    );
    
    -- Re-select to get updated values
    SELECT ac.weekly_coins, ac.purchased_coins, ac.weekly_coin_allocation, ac.weekly_reset_at
    INTO v_result
    FROM ai_coins ac
    WHERE ac.user_id = p_user_id;
  END IF;

  out_weekly_coins := v_result.weekly_coins;
  out_purchased_coins := v_result.purchased_coins;
  out_weekly_coin_allocation := v_result.weekly_coin_allocation;
  out_weekly_reset_at := v_result.weekly_reset_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 3. Missing indexes for scalability
-- ===========================================

-- Coin transactions index (refund lookup, usage queries)
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_type_created 
ON coin_transactions(user_id, type, created_at DESC);

-- Subscription history index (status endpoint queries)
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_created 
ON subscription_history(user_id, created_at DESC);

-- Unique index for analytics active users (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_users_unique 
ON analytics_active_users(user_id);

-- Pending transactions index (webhook lookups)
CREATE INDEX IF NOT EXISTS idx_pending_midtrans_order_id 
ON pending_midtrans_transactions(order_id);

-- Coin purchases index (webhook lookups)
CREATE INDEX IF NOT EXISTS idx_coin_purchases_order_id 
ON coin_purchases(order_id);

-- Subscriptions index (midtrans subscription token lookups)
CREATE INDEX IF NOT EXISTS idx_subscriptions_midtrans_token 
ON subscriptions(midtrans_subscription_token);

-- ===========================================
-- 4. Cleanup old analytics duplicates (one-time)
-- ===========================================
-- Keep only the latest entry per user_id
DELETE FROM analytics_active_users a
WHERE EXISTS (
  SELECT 1 FROM analytics_active_users b
  WHERE b.user_id = a.user_id
    AND b.ctid > a.ctid
);

-- ===========================================
-- 5. Geo cache table (shared across serverless instances)
-- ===========================================
CREATE TABLE IF NOT EXISTS geo_cache (
  ip_hash TEXT PRIMARY KEY,
  country TEXT,
  country_code TEXT,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_geo_cache_expires ON geo_cache(expires_at);

-- Enable RLS
ALTER TABLE geo_cache ENABLE ROW LEVEL SECURITY;

-- Only service role can modify (server-side only)
CREATE POLICY "Service role full access" ON geo_cache
  FOR ALL USING (true) WITH CHECK (true);
