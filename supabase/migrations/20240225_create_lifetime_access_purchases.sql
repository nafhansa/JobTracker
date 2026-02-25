-- Create lifetime_access_purchases table to track limited lifetime access purchases
-- Note: Changed user_id to TEXT to match the existing users table structure
CREATE TABLE IF NOT EXISTS public.lifetime_access_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lifetime_access_purchases_user_id ON public.lifetime_access_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_lifetime_access_purchases_order_id ON public.lifetime_access_purchases(order_id);

-- Enable Row Level Security
ALTER TABLE public.lifetime_access_purchases ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all rows (you can add a separate admin check)
CREATE POLICY "Admins can read all lifetime purchases" ON public.lifetime_access_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.email IN ('nafhan1723@gmail.com', 'nafhan.sh@gmail.com')
    )
  );

-- Allow service role to insert (for webhook)
CREATE POLICY "Service role can insert lifetime purchases" ON public.lifetime_access_purchases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pg_roles
      WHERE rolname = 'service_role'
      AND pg_has_role(current_user, rolname, 'MEMBER')
    )
  );
