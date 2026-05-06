-- ===========================================
-- 030: Fix ambiguous column names in RPC functions
-- Drops and recreates functions with prefixed return columns
-- ===========================================

-- Drop existing functions first (required when changing return type)
DROP FUNCTION IF EXISTS add_purchased_coins_atomic(TEXT, INTEGER);
DROP FUNCTION IF EXISTS process_coin_purchase_atomic(TEXT, TEXT, INTEGER, TEXT, TEXT);

-- ===========================================
-- 1. Atomic add_purchased_coins RPC (fixed)
-- ===========================================
CREATE OR REPLACE FUNCTION add_purchased_coins_atomic(
  p_user_id TEXT,
  p_amount INTEGER
) RETURNS TABLE (
  out_weekly_coins INTEGER,
  out_purchased_coins INTEGER,
  out_total_coins INTEGER
) AS $$
DECLARE
  v_weekly INTEGER;
  v_purchased INTEGER;
BEGIN
  SELECT ac.weekly_coins, ac.purchased_coins
  INTO v_weekly, v_purchased
  FROM ai_coins ac
  WHERE ac.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ai_coins row not found for user %', p_user_id;
  END IF;

  UPDATE ai_coins
  SET purchased_coins = purchased_coins + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  out_weekly_coins := v_weekly;
  out_purchased_coins := v_purchased + p_amount;
  out_total_coins := v_weekly + v_purchased + p_amount;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 2. Atomic process coin purchase RPC (fixed)
-- ===========================================
CREATE OR REPLACE FUNCTION process_coin_purchase_atomic(
  p_user_id TEXT,
  p_order_id TEXT,
  p_coins INTEGER,
  p_payment_type TEXT,
  p_midtrans_transaction_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_already_processed BOOLEAN;
  v_cp_status TEXT;
  v_balance RECORD;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM coin_transactions
    WHERE coin_transactions.reference_id = p_order_id AND coin_transactions.type = 'purchase'
  ) INTO v_already_processed;

  IF v_already_processed THEN
    UPDATE coin_purchases
    SET status = 'paid',
        payment_type = COALESCE(p_payment_type, coin_purchases.payment_type),
        credited_at = COALESCE(coin_purchases.credited_at, NOW()),
        midtrans_transaction_id = COALESCE(p_midtrans_transaction_id, coin_purchases.midtrans_transaction_id),
        updated_at = NOW()
    WHERE coin_purchases.order_id = p_order_id AND coin_purchases.status != 'paid';

    RETURN jsonb_build_object('result', 'already_processed', 'order_id', p_order_id);
  END IF;

  SELECT cp.status INTO v_cp_status
  FROM coin_purchases cp
  WHERE cp.order_id = p_order_id;

  IF v_cp_status = 'paid' THEN
    RETURN jsonb_build_object('result', 'already_paid', 'order_id', p_order_id);
  END IF;

  SELECT * INTO v_balance FROM add_purchased_coins_atomic(p_user_id, p_coins);

  INSERT INTO coin_transactions (user_id, amount, type, reference_id, metadata, created_at)
  VALUES (p_user_id, p_coins, 'purchase', p_order_id, jsonb_build_object('payment_type', p_payment_type), NOW());

  UPDATE coin_purchases
  SET status = 'paid',
      payment_type = p_payment_type,
      midtrans_transaction_id = p_midtrans_transaction_id,
      credited_at = NOW(),
      updated_at = NOW()
  WHERE order_id = p_order_id;

  RETURN jsonb_build_object(
    'result', 'success',
    'order_id', p_order_id,
    'coins_credited', p_coins,
    'new_balance', v_balance.out_total_coins
  );
END;
$$ LANGUAGE plpgsql;
