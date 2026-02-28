-- Add midtrans_subscription_token and midtrans_payment_method to subscriptions table
-- This migration supports recurring payment functionality

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS midtrans_subscription_token TEXT,
ADD COLUMN IF NOT EXISTS midtrans_payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS midtrans_account_id TEXT,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20) DEFAULT 'monthly';

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.midtrans_subscription_token IS 'Subscription token from Midtrans Subscription API';
COMMENT ON COLUMN subscriptions.midtrans_payment_method IS 'Payment method: credit_card, gopay_tokenization';
COMMENT ON COLUMN subscriptions.midtrans_account_id IS 'Masked card number or GoPay account ID';
COMMENT ON COLUMN subscriptions.recurring_frequency IS 'Frequency: monthly (default), yearly';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_token ON subscriptions(midtrans_subscription_token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_method ON subscriptions(midtrans_payment_method);
