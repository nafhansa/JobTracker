-- Subscription Improvements Migration
-- Adds subscription history, idempotency tracking, and reactivation support

-- 1. Subscription History Table
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('activated', 'cancelled', 'reactivated', 'expired', 'subscription_created')),
  previous_status TEXT,
  new_status TEXT,
  previous_plan TEXT,
  new_plan TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);

-- Enable RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own history
CREATE POLICY "Users view own history" ON subscription_history
  FOR SELECT USING (user_id = auth.uid()::text);

-- Service role can insert/update (for API routes and webhooks)
CREATE POLICY "Service role manage history" ON subscription_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pg_roles
      WHERE rolname = 'service_role'
      AND pg_has_role(current_user, rolname, 'MEMBER')
    )
  );

-- 2. Idempotency Keys Table
CREATE TABLE IF NOT EXISTS subscription_idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON subscription_idempotency_keys(expires_at);

-- 3. Add reactivation tracking fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_cancelled_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reactivation_count INT DEFAULT 0;

-- 4. Add unique constraint for active lifetime purchases per user
-- This prevents duplicate lifetime purchases from consuming limited slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_lifetime_active_user_id 
  ON lifetime_access_purchases(user_id) 
  WHERE order_id IS NOT NULL;

-- 5. Database trigger to auto-sync users table when subscriptions change
CREATE OR REPLACE FUNCTION sync_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET
    subscription_plan = NEW.plan,
    subscription_status = NEW.status,
    is_pro = (
      NEW.plan != 'free' AND (
        NEW.status = 'active' OR 
        (NEW.status IN ('cancelled', 'canceled') AND NEW.ends_at > NOW())
      )
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_user_subscription ON subscriptions;

CREATE TRIGGER trigger_sync_user_subscription
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_user_subscription();

-- 6. Add comments for documentation
COMMENT ON COLUMN subscriptions.last_cancelled_at IS 'Timestamp of last cancellation (for cooldown enforcement)';
COMMENT ON COLUMN subscriptions.reactivation_count IS 'Number of times user has reactivated subscription';
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription state changes';
COMMENT ON TABLE subscription_idempotency_keys IS 'Prevents duplicate subscription mutations';
