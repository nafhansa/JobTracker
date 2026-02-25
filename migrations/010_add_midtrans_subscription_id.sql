-- Add midtrans_subscription_id column to subscriptions table
-- This column stores the Midtrans order ID for subscription management

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS midtrans_subscription_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.midtrans_subscription_id IS 'Midtrans order ID for subscription management and cancellation';

-- Create index for faster queries on midtrans_subscription_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_midtrans_subscription_id ON subscriptions(midtrans_subscription_id);