-- Subscription Edge Cases Migration
-- Adds fields for payment failure tracking, billing consistency, and operation retry queue

-- 1. Add payment failure tracking to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_failure_count INT DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMPTZ;

-- 2. Add billing day for consistent monthly billing dates
-- This prevents month-length issues (e.g., 31 Jan -> 28 Feb -> 3 Mar)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_day INT;

-- 3. Add currency tracking (IDR for now, USD ready)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR';

-- 4. Add currency to pending transactions for consistency
ALTER TABLE pending_midtrans_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR';
ALTER TABLE pending_midtrans_transactions ADD COLUMN IF NOT EXISTS billing_day INT;

-- 5. Create pending_midtrans_operations table for retry queue
-- Used when Midtrans API is down during cancel/update operations
CREATE TABLE IF NOT EXISTS pending_midtrans_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('cancel', 'update', 'verify')),
  subscription_id TEXT,
  payload JSONB,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  next_retry_at TIMESTAMPTZ DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_ops_next_retry ON pending_midtrans_operations(next_retry_at) WHERE retry_count < max_retries;
CREATE INDEX IF NOT EXISTS idx_pending_ops_user_id ON pending_midtrans_operations(user_id);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan ON subscriptions(status, plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renews_at ON subscriptions(renews_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_day ON subscriptions(billing_day) WHERE plan = 'monthly';

-- 7. Add comments for documentation
COMMENT ON COLUMN subscriptions.payment_failure_count IS 'Number of consecutive failed recurring payments';
COMMENT ON COLUMN subscriptions.last_payment_attempt_at IS 'Timestamp of last recurring payment attempt';
COMMENT ON COLUMN subscriptions.billing_day IS 'Day of month for billing (1-31), prevents month-length issues';
COMMENT ON COLUMN subscriptions.currency IS 'Subscription currency (IDR/USD)';
COMMENT ON TABLE pending_midtrans_operations IS 'Queue for retrying failed Midtrans API operations';
