-- Create lifetime_access_purchases table to track limited lifetime access purchases
CREATE TABLE IF NOT EXISTS public.lifetime_access_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
      WHERE users.id = auth.uid()
      AND users.email IN ('nafhan1723@gmail.com', 'nafhan.sh@gmail.com')
    )
  );
