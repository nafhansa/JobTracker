-- ===========================================
-- 034: Fix ambiguous column reference in get_or_create_coins_atomic
-- PostgreSQL 42702 error: "column reference weekly_reset_at is ambiguous"
-- caused by RETURNS TABLE columns sharing names with ai_coins table columns.
-- Fix: use RETURN QUERY SELECT instead of individual assignments.
-- ===========================================

DROP FUNCTION IF EXISTS get_or_create_coins_atomic(TEXT, TEXT);

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
    SET weekly_coins = ai_coins.weekly_coin_allocation,
        weekly_reset_at = v_now + INTERVAL '7 days',
        updated_at = v_now
    WHERE user_id = p_user_id
      AND ai_coins.weekly_reset_at <= v_now; -- Only reset if still due (prevents double-reset)
    
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

  -- Use RETURN QUERY SELECT to avoid PL/pgSQL variable vs table column ambiguity
  RETURN QUERY SELECT
    v_result.weekly_coins,
    v_result.purchased_coins,
    v_result.weekly_coin_allocation,
    v_result.weekly_reset_at;
END;
$$ LANGUAGE plpgsql;
