-- ===========================================
-- 029: Atomic coin purchase + webhook idempotency
-- Fixes race conditions on coin credits and subscription upserts
-- ===========================================

-- ===========================================
-- 1. Atomic add_purchased_coins RPC
-- Uses SELECT ... FOR UPDATE to lock the row,
-- then atomically increments purchased_coins.
-- Returns the new balance.
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
  -- Lock the row (prefix column names to avoid ambiguity with return table)
  SELECT ac.weekly_coins, ac.purchased_coins
  INTO v_weekly, v_purchased
  FROM ai_coins ac
  WHERE ac.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ai_coins row not found for user %', p_user_id;
  END IF;

  -- Atomically increment
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
-- 2. Atomic upsert subscription + user in one transaction
-- Prevents inconsistent state between subscriptions and users tables
-- ===========================================
CREATE OR REPLACE FUNCTION upsert_subscription_atomic(
  p_user_id TEXT,
  p_plan TEXT,
  p_status TEXT,
  p_midtrans_subscription_id TEXT,
  p_midtrans_subscription_token TEXT,
  p_midtrans_payment_method TEXT,
  p_midtrans_account_id TEXT,
  p_currency TEXT,
  p_billing_day INTEGER,
  p_renews_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_recurring_frequency TEXT,
  p_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_subscription_id TEXT;
  v_is_lifetime BOOLEAN;
  v_existing_plan TEXT;
  v_existing_status TEXT;
BEGIN
  -- Check if user has lifetime subscription
  SELECT plan INTO v_existing_plan
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF v_existing_plan = 'lifetime' AND p_plan != 'lifetime' THEN
    RETURN jsonb_build_object('result', 'lifetime_preserved', 'message', 'Attempted to overwrite lifetime subscription');
  END IF;

  -- Upsert subscription
  INSERT INTO subscriptions (
    id, user_id, plan, status, midtrans_subscription_id,
    midtrans_subscription_token, midtrans_payment_method, midtrans_account_id,
    currency, billing_day, renews_at, ends_at, recurring_frequency,
    payment_failure_count, created_at, updated_at
  )
  VALUES (
    p_id, p_user_id, p_plan, p_status, p_midtrans_subscription_id,
    p_midtrans_subscription_token, p_midtrans_payment_method, p_midtrans_account_id,
    p_currency, p_billing_day, p_renews_at, p_ends_at, p_recurring_frequency,
    0, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    midtrans_subscription_id = EXCLUDED.midtrans_subscription_id,
    midtrans_subscription_token = EXCLUDED.midtrans_subscription_token,
    midtrans_payment_method = EXCLUDED.midtrans_payment_method,
    midtrans_account_id = EXCLUDED.midtrans_account_id,
    currency = EXCLUDED.currency,
    billing_day = EXCLUDED.billing_day,
    renews_at = EXCLUDED.renews_at,
    ends_at = EXCLUDED.ends_at,
    recurring_frequency = EXCLUDED.recurring_frequency,
    payment_failure_count = 0,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;

  -- Update users table in same transaction
  INSERT INTO users (id, subscription_plan, subscription_status, is_pro, created_at, updated_at)
  VALUES (p_user_id, p_plan, p_status, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_status = EXCLUDED.subscription_status,
    is_pro = true,
    updated_at = NOW();

  RETURN jsonb_build_object('result', 'success', 'subscription_id', v_subscription_id);
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 3. Atomic mark coin purchase as paid
-- Combines coin credit + coin_purchases status update + transaction log
-- into a single transaction to prevent double-crediting
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
  -- Check if already processed (idempotency guard)
  SELECT EXISTS (
    SELECT 1 FROM coin_transactions
    WHERE coin_transactions.reference_id = p_order_id AND coin_transactions.type = 'purchase'
  ) INTO v_already_processed;

  IF v_already_processed THEN
    -- Update coin_purchases status even if already processed
    UPDATE coin_purchases
    SET status = 'paid',
        payment_type = COALESCE(p_payment_type, coin_purchases.payment_type),
        credited_at = COALESCE(coin_purchases.credited_at, NOW()),
        midtrans_transaction_id = COALESCE(p_midtrans_transaction_id, coin_purchases.midtrans_transaction_id),
        updated_at = NOW()
    WHERE coin_purchases.order_id = p_order_id AND coin_purchases.status != 'paid';

    RETURN jsonb_build_object('result', 'already_processed', 'order_id', p_order_id);
  END IF;

  -- Check coin_purchases current status
  SELECT cp.status INTO v_cp_status
  FROM coin_purchases cp
  WHERE cp.order_id = p_order_id;

  IF v_cp_status = 'paid' THEN
    RETURN jsonb_build_object('result', 'already_paid', 'order_id', p_order_id);
  END IF;

  -- Atomically add coins
  SELECT * INTO v_balance FROM add_purchased_coins_atomic(p_user_id, p_coins);

  -- Record transaction
  INSERT INTO coin_transactions (user_id, amount, type, reference_id, metadata, created_at)
  VALUES (p_user_id, p_coins, 'purchase', p_order_id, jsonb_build_object('payment_type', p_payment_type), NOW());

  -- Update coin_purchases status
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
