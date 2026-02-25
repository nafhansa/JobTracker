-- Create table for storing pending Midtrans transactions
CREATE TABLE IF NOT EXISTS pending_midtrans_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  snap_token TEXT NOT NULL,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_pending_midtrans_order_id ON pending_midtrans_transactions(order_id);
CREATE INDEX idx_pending_midtrans_user_id ON pending_midtrans_transactions(user_id);
CREATE INDEX idx_pending_midtrans_expires_at ON pending_midtrans_transactions(expires_at);

ALTER TABLE pending_midtrans_transactions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (via API routes with service role key)
CREATE POLICY "Allow service role insert" ON pending_midtrans_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to select (via API routes with service role key)
CREATE POLICY "Allow service role select" ON pending_midtrans_transactions
FOR SELECT
TO service_role
USING (true);

-- Allow service role to delete (via API routes with service role key)
CREATE POLICY "Allow service role delete" ON pending_midtrans_transactions
FOR DELETE
TO service_role
USING (true);

-- Function to clean up expired transactions
CREATE OR REPLACE FUNCTION cleanup_expired_midtrans_transactions()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_midtrans_transactions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
