-- Add recurring payment fields to pending_midtrans_transactions table
-- This migration supports subscription token storage before authorization

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
