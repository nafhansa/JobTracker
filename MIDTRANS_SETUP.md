# Midtrans Setup Guide for JobTracker

## Overview
JobTracker now supports **location-based pricing**:
- 🇮🇩 **Indonesia users**: Pay with Midtrans (BCA, Mandiri, BNI, etc.) in IDR
- 🌍 **Other countries**: Pay with PayPal in USD

## Pricing Plans

### Indonesia (Midtrans - IDR)
- **Monthly**: Rp30.000
- **Lifetime**: Rp50.000 (Limited to 20 users only!)

### International (PayPal - USD)
- **Monthly**: $1.99 (from $2.99)
- **Lifetime**: $7.99 (from $17.99, Early Bird)

## Midtrans Setup

### 1. Create Midtrans Account

1. Go to [https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)
2. Sign up for a free account
3. Verify your email address
4. Complete your business profile

### 2. Get API Keys

#### For Sandbox (Testing):
1. Go to **Settings → API Keys**
2. Copy the **Server Key** (for backend use)
3. Copy the **Client Key** (for frontend use)

#### For Production:
1. Go to **Settings → API Keys**
2. Click on **Production** tab
3. Apply for production access (requires business verification)
4. Once approved, you'll get production keys

### 3. Set Environment Variables

#### Local Development (.env.local)
```bash
# Midtrans Configuration (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
```

#### Vercel Production
Add these environment variables in your Vercel project settings:

```bash
# Midtrans Configuration (Production)
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=true
```

### 4. Configure Webhook URL

Midtrans needs to send payment notifications to your server.

#### For Sandbox:
- Webhook URL: `https://your-domain.vercel.app/api/payment/midtrans/webhook`

#### For Production:
- Same webhook URL: `https://your-domain.vercel.app/api/payment/midtrans/webhook`

**To set webhook in Midtrans:**
1. Go to **Settings → Configuration**
2. Scroll to **Payment Notification URL**
3. Enter your webhook URL
4. Save changes

### 5. Enable Payment Methods

#### For Sandbox (BCA Virtual Account):
1. Go to **Settings → Payment Channels**
2. Enable **BCA Virtual Account** (already enabled by default in sandbox)
3. You can also enable other methods like Mandiri Bill, BNI Virtual Account, etc.

#### For Production:
1. You need to apply for each payment method
2. Midtrans will verify your business documents
3. Once approved, enable the payment channels you want

## Database Setup

Run the SQL migration to create the `lifetime_access_purchases` table:

```sql
-- This file is already in: supabase/migrations/20240225_create_lifetime_access_purchases.sql

-- Create lifetime_access_purchases table
CREATE TABLE IF NOT EXISTS public.lifetime_access_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lifetime_access_purchases_user_id ON public.lifetime_access_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_lifetime_access_purchases_order_id ON public.lifetime_access_purchases(order_id);

-- Enable RLS
ALTER TABLE public.lifetime_access_purchases ENABLE ROW LEVEL SECURITY;

-- Allow admins to read
CREATE POLICY "Admins can read all lifetime purchases" ON public.lifetime_access_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email IN ('nafhan1723@gmail.com', 'nafhan.sh@gmail.com')
    )
  );
```

Run this in your Supabase SQL Editor.

## Testing

### Test Sandbox Payment
1. Visit `/pricing` page
2. Use VPN to connect to Indonesian server (or change IP)
3. You should see pricing in IDR
4. Click "Bayar Sekarang" on Monthly or Lifetime plan
5. You'll get a Virtual Account number
6. In sandbox, you can simulate payment using Midtrans simulator

### Midtrans Simulator
- URL: `https://simulator.midtrans.com/`
- Use the VA number provided to simulate payment

## Production Checklist

Before going live:
- [ ] Production Server Key added to Vercel
- [ ] Production Client Key added to Vercel
- [ ] MIDTRANS_IS_PRODUCTION=true set in Vercel
- [ ] Webhook URL configured in Midtrans dashboard
- [ ] Payment methods enabled (BCA, Mandiri, etc.)
- [ ] Database migration run in production Supabase
- [ ] Test payment flow in production (small amount first)

## Important Notes

### Security
- **NEVER** commit `MIDTRANS_SERVER_KEY` to Git
- **NEVER** expose Server Key to frontend (only Client Key)
- Always use HTTPS for webhooks
- Validate webhook signatures in your backend

### Lifetime Access Limit
- Limited to 20 users only
- After 20 purchases, lifetime plan will be hidden
- Admin can monitor purchases in `/admin` dashboard
- Counter is automatically tracked in `lifetime_access_purchases` table

### Location Detection
- Automatically detects user's country using IP
- Indonesian users see IDR + Midtrans
- Non-Indonesian users see USD + PayPal
- Location is cached for performance

### Payment Flow
1. User clicks "Bayar Sekarang"
2. Backend creates Midtrans transaction
3. User gets Virtual Account number
4. User pays to VA number
5. Midtrans sends webhook notification
6. Backend verifies signature
7. Subscription is activated
8. Lifetime purchase is recorded

## Troubleshooting

### Pricing Not Showing in IDR
- Check `/api/location/detect` endpoint
- Verify location detection is working
- Clear browser cache

### Payment Not Working
- Check Midtrans dashboard for transaction status
- Verify webhook is receiving notifications
- Check server logs for errors
- Ensure Server Key is correct

### Lifetime Slots Not Updating
- Check `lifetime_access_purchases` table
- Verify webhook is recording purchases
- Check admin dashboard for real-time count

## Support

For Midtrans-related issues:
- Documentation: [https://api-docs.midtrans.com/](https://api-docs.midtrans.com/)
- Support: [https://support.midtrans.com/](https://support.midtrans.com/)

For JobTracker issues:
- Check the code in `src/app/api/payment/midtrans/`
- Check the code in `src/lib/midtrans-config.ts`
- Check the code in `src/app/pricing/page.tsx`
