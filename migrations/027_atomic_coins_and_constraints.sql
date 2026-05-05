-- ===========================================
-- 027: Atomic coin deduction + CHECK constraints
-- Fixes race conditions and negative balance prevention
-- ===========================================

-- ===========================================
-- 1. CHECK constraints: prevent negative balances
-- ===========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_coins_weekly_coins_non_negative'
  ) THEN
    ALTER TABLE ai_coins ADD CONSTRAINT ai_coins_weekly_coins_non_negative
      CHECK (weekly_coins >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_coins_purchased_coins_non_negative'
  ) THEN
    ALTER TABLE ai_coins ADD CONSTRAINT ai_coins_purchased_coins_non_negative
      CHECK (purchased_coins >= 0);
  END IF;
END $$;

-- ===========================================
-- 2. Atomic deduct_coins RPC function
-- Uses SELECT ... FOR UPDATE to lock the row,
-- then atomically deducts coins in a single UPDATE.
-- Returns: true if deduction succeeded, false if insufficient coins.
-- ===========================================
CREATE OR REPLACE FUNCTION deduct_coins_atomic(
  p_user_id TEXT,
  p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_weekly INTEGER;
  v_purchased INTEGER;
  v_total INTEGER;
BEGIN
  -- Lock the row for this user
  SELECT weekly_coins, purchased_coins
  INTO v_weekly, v_purchased
  FROM ai_coins
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If no row found, return false (caller should handle creation)
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  v_total := v_weekly + v_purchased;

  -- Insufficient coins
  IF v_total < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct from weekly first, then purchased
  IF v_weekly >= p_amount THEN
    UPDATE ai_coins
    SET weekly_coins = weekly_coins - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE ai_coins
    SET weekly_coins = 0,
        purchased_coins = purchased_coins - (p_amount - v_weekly),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 3. Atomic refund_coins RPC function
-- Refunds coins to the same bucket they were deducted from.
-- Uses the transaction log to determine original source.
-- Falls back to weekly-first refund if no recent transaction found.
-- ===========================================
CREATE OR REPLACE FUNCTION refund_coins_atomic(
  p_user_id TEXT,
  p_amount INTEGER
) RETURNS VOID AS $$
DECLARE
  v_weekly INTEGER;
  v_purchased INTEGER;
  v_last_type TEXT;
  v_weekly_before INTEGER;
  v_purchased_before INTEGER;
BEGIN
  -- Lock the row
  SELECT weekly_coins, purchased_coins
  INTO v_weekly, v_purchased
  FROM ai_coins
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Try to determine original deduction source from last usage transaction
  SELECT metadata->>'deducted_from_weekly'
  INTO v_last_type
  FROM coin_transactions
  WHERE user_id = p_user_id AND type = 'usage'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_type = 'weekly_only' THEN
    -- All came from weekly
    UPDATE ai_coins
    SET weekly_coins = weekly_coins + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF v_last_type = 'mixed' THEN
    -- Split: restore both buckets
    v_weekly_before := (metadata->>'weekly_before')::INTEGER
      FROM coin_transactions
      WHERE user_id = p_user_id AND type = 'usage'
      ORDER BY created_at DESC
      LIMIT 1;

    IF v_weekly_before IS NOT NULL THEN
      UPDATE ai_coins
      SET weekly_coins = v_weekly_before,
          purchased_coins = purchased_coins + (p_amount - v_weekly_before),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      -- Fallback: refund to weekly
      UPDATE ai_coins
      SET weekly_coins = weekly_coins + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
  ELSIF v_last_type = 'purchased_only' THEN
    -- All came from purchased
    UPDATE ai_coins
    SET purchased_coins = purchased_coins + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- No transaction metadata found, fallback to weekly-first refund
    -- (mimics original deduction logic in reverse)
    IF v_weekly + p_amount <= (
      SELECT weekly_coin_allocation FROM ai_coins WHERE user_id = p_user_id
    ) THEN
      UPDATE ai_coins
      SET weekly_coins = weekly_coins + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      UPDATE ai_coins
      SET weekly_coins = (SELECT weekly_coin_allocation FROM ai_coins WHERE user_id = p_user_id),
          purchased_coins = purchased_coins + (p_amount - ((SELECT weekly_coin_allocation FROM ai_coins WHERE user_id = p_user_id) - v_weekly)),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 4. Atomic get_or_create_coins RPC
-- Handles concurrent first-time creation safely.
-- ===========================================
CREATE OR REPLACE FUNCTION get_or_create_coins_atomic(
  p_user_id TEXT,
  p_plan TEXT DEFAULT 'free'
) RETURNS TABLE (
  weekly_coins INTEGER,
  purchased_coins INTEGER,
  weekly_coin_allocation INTEGER,
  weekly_reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_allocation INTEGER;
  v_result RECORD;
BEGIN
  -- Determine allocation based on plan
  CASE p_plan
    WHEN 'lifetime' THEN v_allocation := 400;
    WHEN 'monthly' THEN v_allocation := 400;
    ELSE v_allocation := 240;
  END CASE;

  -- Try to insert with ON CONFLICT DO NOTHING
  INSERT INTO ai_coins (user_id, weekly_coins, purchased_coins, weekly_coin_allocation, weekly_reset_at)
  VALUES (p_user_id, v_allocation, 0, v_allocation, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;

  -- Now select (will always find a row after the upsert)
  SELECT ac.weekly_coins, ac.purchased_coins, ac.weekly_coin_allocation, ac.weekly_reset_at
  INTO v_result
  FROM ai_coins ac
  WHERE ac.user_id = p_user_id;

  IF NOT FOUND THEN
    -- Extremely unlikely, but handle it
    RAISE EXCEPTION 'Failed to get or create coins for user %', p_user_id;
  END IF;

  weekly_coins := v_result.weekly_coins;
  purchased_coins := v_result.purchased_coins;
  weekly_coin_allocation := v_result.weekly_coin_allocation;
  weekly_reset_at := v_result.weekly_reset_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
