-- ===========================================
-- MIDTRANS RECURRING SUBSCRIPTION MIGRATIONS
-- ===========================================
-- Run these SQL commands in Supabase SQL Editor
-- Execute in order: Migration 1, then Migration 2
-- ===========================================

-- ===========================================
-- MIGRATION 1: Add recurring fields to subscriptions table
-- File: migrations/012_add_recurring_subscription_fields.sql
-- ===========================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS midtrans_subscription_token TEXT,
ADD COLUMN IF NOT EXISTS midtrans_payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS midtrans_account_id TEXT,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20) DEFAULT 'monthly';

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.midtrans_subscription_token IS 'Subscription token from Midtrans Subscription API (different from order_id)';
COMMENT ON COLUMN subscriptions.midtrans_payment_method IS 'Payment method: credit_card, gopay_tokenization';
COMMENT ON COLUMN subscriptions.midtrans_account_id IS 'Masked card number or GoPay account ID';
COMMENT ON COLUMN subscriptions.recurring_frequency IS 'Frequency: monthly (default), yearly';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_token ON subscriptions(midtrans_subscription_token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_method ON subscriptions(midtrans_payment_method);

-- Verify migration
SELECT
  column_name,
  data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN (
    'midtrans_subscription_token',
    'midtrans_payment_method',
    'midtrans_account_id',
    'recurring_frequency'
  )
ORDER BY ordinal_position;

-- ===========================================
-- MIGRATION 2: Add fields to pending_midtrans_transactions table
-- File: migrations/013_add_pending_transaction_fields.sql
-- ===========================================

ALTER TABLE pending_midtrans_transactions
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_token TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN pending_midtrans_transactions.payment_method IS 'Payment method selected: credit_card, gopay_tokenization, or null for one-time';
COMMENT ON COLUMN pending_midtrans_transactions.subscription_token IS 'Temp storage for subscription token before authorization';
COMMENT ON COLUMN pending_midtrans_transactions.is_recurring IS 'Whether this is a recurring subscription or one-time payment';

-- Create index for filtering by payment method
CREATE INDEX IF NOT EXISTS idx_pending_payment_method ON pending_midtrans_transactions(payment_method);

-- Verify migration
SELECT
  column_name,
  data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_midtrans_transactions'
  AND column_name IN (
    'payment_method',
    'subscription_token',
    'is_recurring'
  )
ORDER BY ordinal_position;

-- ===========================================
-- ROLLBACK COMMANDS (If needed)
-- ===========================================

-- To rollback Migration 2:
-- DROP INDEX IF EXISTS idx_pending_payment_method;
-- ALTER TABLE pending_midtrans_transactions
-- DROP COLUMN IF EXISTS payment_method,
-- DROP COLUMN IF EXISTS subscription_token,
-- DROP COLUMN IF EXISTS is_recurring;

-- To rollback Migration 1:
-- DROP INDEX IF EXISTS idx_subscriptions_token;
-- DROP INDEX IF EXISTS idx_subscriptions_payment_method;
-- ALTER TABLE subscriptions
-- DROP COLUMN IF EXISTS midtrans_subscription_token,
-- DROP COLUMN IF EXISTS midtrans_payment_method,
-- DROP COLUMN IF EXISTS midtrans_account_id,
-- DROP COLUMN IF EXISTS recurring_frequency;
