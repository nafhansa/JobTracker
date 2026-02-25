# Midtrans Recurring Subscription Implementation Plan

## 📋 Overview

Implementasi sistem recurring subscription menggunakan Midtrans Subscription API untuk pembayaran otomatis berulang.

### Scope
- **Payment Methods Supported:**
  - Credit Card (Visa, Mastercard, JCB)
  - GoPay Tokenization
  - Debit Card dengan logo Visa/Mastercard (bisa dipakai seperti credit card)

- **Currency:** IDR only untuk recurring
- **Features:**
  - Auto-renew setiap bulan
  - Cancel subscription (via Midtrans API)
  - Backward compatible dengan existing one-time payment

- **NOT Supported:**
  - Pause/Resume subscription (hanya cancel)
  - BNI/Mandiri/BCA Autopay (tidak didukung Midtrans Subscription API)
  - Recurring untuk currency USD

---

## 🎯 Requirements

### Midtrans Subscription API Capabilities
Based on official documentation:

| Feature | Support |
|---------|---------|
| Payment Types | Credit Card, GoPay Tokenization |
| Currency | IDR only |
| Statuses | `active`, `inactive` |
| Cancel Endpoint | `POST /v1/subscriptions/{id}/cancel` |
| Disable Endpoint | `POST /v1/subscriptions/{id}/disable` |

### API Endpoints
```
POST   /v1/subscriptions              - Create subscription
GET    /v1/subscriptions/{id}         - Retrieve details
POST   /v1/subscriptions/{id}/disable - Disable subscription
POST   /v1/subscriptions/{id}/cancel  - Cancel subscription
```

---

## 🗄️ Database Schema Changes

### 1. Update `subscriptions` Table

**File:** `migrations/012_add_recurring_subscription_fields.sql`

```sql
-- Add recurring-specific fields to subscriptions table

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
```

### 2. Update `pending_midtrans_transactions` Table

**File:** `migrations/013_add_pending_transaction_fields.sql`

```sql
-- Add fields to support recurring subscription creation flow

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
```

### 3. Execution Commands

Run in Supabase SQL Editor:

```bash
# Migration 1
psql -h [HOST] -U [USER] -d [DB] -f migrations/012_add_recurring_subscription_fields.sql

# Migration 2
psql -h [HOST] -U [USER] -d [DB] -f migrations/013_add_pending_transaction_fields.sql
```

Or manually in Supabase Dashboard:
1. Go to SQL Editor
2. Paste each SQL block
3. Run and verify output

---

## 🔧 API Implementation

### A. Update `/api/payment/midtrans/charge/route.ts`

**Changes Required:**

1. **Accept `paymentMethod` parameter** (optional)
2. **Branch logic:** Subscription API vs Snap API
3. **Store payment metadata** in database

#### New Request Structure

```typescript
interface ChargeRequest {
  userId: string;
  plan: 'monthly' | 'lifetime';
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  currency: 'IDR' | 'USD';
  paymentMethod?: 'credit_card' | 'gopay_tokenization' | null; // null = one-time
}
```

#### Implementation Logic

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, plan, customerDetails, currency = 'IDR', paymentMethod } = body;

  // Validation
  if (!userId || !plan || !customerDetails) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // IMPORTANT: Recurring only supports IDR
  if (paymentMethod && currency !== 'IDR') {
    return NextResponse.json(
      { error: "Recurring payments only support IDR currency" },
      { status: 400 }
    );
  }

  const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';
  const amount = MIDTRANS_PRICES.monthlyIDR; // Always IDR for recurring

  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  const userIdShort = userId.substring(0, 12);
  const orderId = `JT-${userIdShort}-${timestamp}-${randomStr}`;

  // BRANCH: Recurring vs One-Time
  if (paymentMethod) {
    // ===== RECURRING: Create Subscription via Midtrans Subscription API =====
    return await createSubscription({
      userId,
      planType,
      amount,
      currency,
      paymentMethod,
      customerDetails,
      orderId,
    });
  } else {
    // ===== ONE-TIME: Use existing Snap API =====
    return await createSnapTransaction({
      userId,
      planType,
      amount,
      currency,
      customerDetails,
      orderId,
    });
  }
}

// ==================== Recurring Flow ====================
async function createSubscription({
  userId,
  planType,
  amount,
  currency,
  paymentMethod,
  customerDetails,
  orderId,
}: CreateSubscriptionParams) {
  const subscriptionId = crypto.randomUUID();
  const internalToken = crypto.randomUUID();

  // Build subscription request body
  const subscriptionBody = {
    name: "JobTracker Monthly Pro",
    amount: amount.toString(),
    currency: "IDR",
    payment_type: paymentMethod === 'credit_card' ? 'credit_card' : 'gopay_tokenization',
    interval: 1,
    interval_unit: "month",
    customer_details: {
      first_name: customerDetails.firstName || 'JobTracker',
      last_name: customerDetails.lastName || 'User',
      email: customerDetails.email || '',
      phone: customerDetails.phone || '',
    },
    token: internalToken, // Internal token for tracking
    user_id: userId,
    metadata: {
      user_id: userId,
      plan: planType,
      order_id: orderId,
    }
  };

  const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
  const subscriptionApiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com/v1/subscriptions'
    : 'https://api.sandbox.midtrans.com/v1/subscriptions';

  try {
    const response = await fetch(subscriptionApiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(subscriptionBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Midtrans Subscription API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Subscription API error: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const result = await response.json();

    // Store in pending_midtrans_transactions
    const { error: dbError } = await (supabaseAdmin as any)
      .from('pending_midtrans_transactions')
      .insert({
        id: subscriptionId,
        order_id: orderId,
        user_id: userId,
        plan: planType,
        amount: amount,
        snap_token: result.token, // Reuse this field for redirect URL
        customer_email: customerDetails.email || null,
        payment_method: paymentMethod,
        subscription_token: internalToken,
        is_recurring: true,
      });

    if (dbError) {
      console.error('Failed to store subscription in database:', dbError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      token: result.token,
      redirectUrl: result.redirect_url,
      subscriptionId: result.id,
      isRecurring: true,
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// ==================== One-Time Flow (Existing) ====================
async function createSnapTransaction({
  userId,
  planType,
  amount,
  currency,
  customerDetails,
  orderId,
}: CreateSnapTransactionParams) {
  // Use existing Snap API logic (lines 71-206 in current code)
  // ... (existing implementation)
}
```

---

### B. Update `/api/payment/midtrans/webhook/route.ts`

**Changes Required:**

1. **Handle recurring events:**
   - `payment.recurring` - Pembayaran bulanan berhasil
   - `subscription.cancelled` - User cancel via Midtrans
   - `subscription.expired` - Subscription expired

2. **Update subscription dates** on recurring payment

#### Implementation Logic

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  const {
    order_id,
    transaction_status,
    status_code,
    gross_amount,
    custom_field1: userId,
    custom_field2: plan,
    custom_field3: currency,
    signature_key,
    payment_type,  // NEW: payment type
    subscription_id,  // NEW: subscription ID for recurring
  } = body;

  // Signature verification (existing)
  // ...

  // Handle recurring payment success
  if (transaction_status === 'settlement' && payment_type === 'recurring') {
    await handleRecurringPayment({
      subscriptionId,
      userId,
      order_id,
      gross_amount,
    });
    return NextResponse.json({ status: 'OK' });
  }

  // Handle subscription cancellation from Midtrans
  if (body.event === 'subscription.cancelled' || body.event === 'subscription.expired') {
    await handleSubscriptionCancellation({
      subscriptionId,
      userId,
    });
    return NextResponse.json({ status: 'OK' });
  }

  // Existing one-time payment logic
  if (transaction_status === 'settlement' || transaction_status === 'capture') {
    // ... existing code
  }

  return NextResponse.json({ status: 'OK' });
}

// ==================== Recurring Payment Handler ====================
async function handleRecurringPayment({
  subscriptionId,
  userId,
  order_id,
  gross_amount,
}: RecurringPaymentParams) {
  console.log('Handling recurring payment:', { subscriptionId, userId, order_id });

  // Get subscription details
  const { data: subscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('midtrans_subscription_token', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found for recurring payment:', subscriptionId);
    return;
  }

  // Calculate next renewal date
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Update subscription
  const { error: updateError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      renews_at: nextMonth.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Failed to update subscription for recurring payment:', updateError);
  } else {
    console.log('Subscription renewed successfully until:', nextMonth.toISOString());
  }

  // Ensure user status is still active
  await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_status: 'active',
      is_pro: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

// ==================== Subscription Cancellation Handler ====================
async function handleSubscriptionCancellation({
  subscriptionId,
  userId,
}: SubscriptionCancellationParams) {
  console.log('Handling subscription cancellation:', { subscriptionId, userId });

  const now = new Date().toISOString();

  // Update subscription to cancelled
  const { error: updateError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      status: 'cancelled',
      ends_at: now,
      midtrans_subscription_token: null, // Clear token
      updated_at: now,
    })
    .eq('midtrans_subscription_token', subscriptionId);

  if (updateError) {
    console.error('Failed to cancel subscription:', updateError);
    return;
  }

  // Revert user to free plan
  const { error: userError } = await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_plan: 'free',
      subscription_status: 'active', // Free plan is still active
      is_pro: false,
      updated_at: now,
    })
    .eq('id', userId);

  if (userError) {
    console.error('Failed to revert user to free plan:', userError);
  }

  console.log('Subscription cancelled successfully');
}
```

---

### C. Update `/api/subscription/cancel/route.ts`

**Changes Required:**

1. **Add Midtrans support** (currently only supports Paddle)
2. **Call Midtrans Cancel API**
3. **Update database correctly**

#### Implementation Logic

```typescript
export async function POST(req: Request) {
  // ... existing authentication code (lines 5-29)

  // Determine provider
  const effectiveProvider = provider || "midtrans"; // Default to Midtrans now

  if (effectiveProvider === "paddle") {
    // Existing Paddle logic (lines 62-91)
    // ...
  } else if (effectiveProvider === "midtrans") {
    // ==================== MIDTRANS CANCELLATION ====================
    const { data: subscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('midtrans_subscription_id', subscriptionId)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (subscription.user_id !== requesterUid) {
      return NextResponse.json(
        { error: "Forbidden: subscription does not belong to current user" },
        { status: 403 }
      );
    }

    // If no subscription token, skip Midtrans API call (already cancelled or one-time)
    if (!subscription.midtrans_subscription_token) {
      console.log('No subscription token found, updating database only');
      endDate = subscription.renews_at || subscription.ends_at || new Date().toISOString();
    } else {
      // Call Midtrans Cancel API
      const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
      const MIDTRANS_API_URL = process.env.MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com';

      if (!MIDTRANS_SERVER_KEY) {
        return NextResponse.json(
          { error: "Midtrans configuration error" },
          { status: 500 }
        );
      }

      const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

      const cancelResponse = await fetch(
        `${MIDTRANS_API_URL}/v1/subscriptions/${subscription.midtrans_subscription_token}/cancel`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`,
          },
        }
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json().catch(() => ({}));
        console.error("❌ Midtrans cancel error:", errorData);
        throw new Error("Failed to cancel subscription in Midtrans");
      }

      console.log("✅ Subscription cancelled in Midtrans");
    }

    // Update Supabase
    endDate = subscription.renews_at || subscription.ends_at || new Date().toISOString();

    await (supabaseAdmin as any)
      .from('subscriptions')
      .update({
        status: 'cancelled',
        ends_at: endDate,
        midtrans_subscription_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    // Revert user to free plan
    await (supabaseAdmin as any)
      .from('users')
      .update({
        subscription_plan: 'free',
        subscription_status: 'active',
        is_pro: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.user_id);

  } else {
    throw new Error("Provider not supported");
  }

  return NextResponse.json({
    success: true,
    message: "Subscription cancelled successfully",
    endsAt: endDate,
  });
}
```

---

## 🎨 Frontend Changes

### A. Update `/app/upgrade/page.tsx`

**Changes Required:**

1. **Add payment method selector** (only for recurring monthly plan)
2. **Handle currency restriction** (recurring only IDR)
3. **Pass payment method to API**

#### Implementation

```typescript
// Add state for payment method selection
const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'gopay_tokenization'>('credit_card');

// In PricingCard component, add payment selector BEFORE subscribe button
{!isFree && !isLifetime && planType === 'monthly' && isIndonesia && (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
      ⚡ Auto-Renew (Recommended)
    </p>
    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
      Choose payment method for automatic monthly billing
    </p>

    <div className="space-y-2">
      <label className="flex items-center gap-3 p-2 border border-blue-200 dark:border-blue-800 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
        <input
          type="radio"
          name="paymentMethod"
          value="credit_card"
          checked={paymentMethod === 'credit_card'}
          onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'gopay_tokenization')}
          className="w-4 h-4 text-blue-600"
        />
        <div>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">💳 Kartu Kredit/Debit</span>
          <p className="text-xs text-blue-700 dark:text-blue-300">Visa, Mastercard, JCB</p>
        </div>
      </label>

      <label className="flex items-center gap-3 p-2 border border-blue-200 dark:border-blue-800 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
        <input
          type="radio"
          name="paymentMethod"
          value="gopay_tokenization"
          checked={paymentMethod === 'gopay_tokenization'}
          onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'gopay_tokenization')}
          className="w-4 h-4 text-blue-600"
        />
        <div>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">📱 GoPay</span>
          <p className="text-xs text-blue-700 dark:text-blue-300">Auto-deduct from GoPay balance</p>
        </div>
      </label>
    </div>

    <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 italic">
      Pembayaran akan otomatis diperpanjang setiap bulan sampai Anda cancel.
      Anda bisa cancel kapan saja di halaman Billing.
    </p>
  </div>
)}

// Update handleSubscribe function
const handleSubscribe = async () => {
  if (disabled) return;

  if (user) {
    // For non-Indonesian users OR lifetime plan: one-time payment only
    if (!isIndonesia || planType === 'lifetime') {
      // Use existing one-time flow (paymentMethod = null)
      const response = await fetch('/api/payment/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          plan: planType,
          currency: isIndonesia ? 'IDR' : 'USD',
          paymentMethod: null, // One-time
          customerDetails: { /* ... */ },
        }),
      });
      // ... existing logic
    }
    // For Indonesian monthly plan: recurring payment
    else {
      const response = await fetch('/api/payment/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          plan: 'monthly',
          currency: 'IDR', // Must be IDR for recurring
          paymentMethod: paymentMethod, // 'credit_card' or 'gopay_tokenization'
          customerDetails: { /* ... */ },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment API error:', response.status, errorText);
        alert(`Payment error: ${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        if (data.isRecurring) {
          // Redirect to Midtrans for subscription authorization
          router.push(data.redirectUrl);
        } else {
          // One-time flow
          router.push(`/payment/midtrans?orderId=${data.orderId}`);
        }
      } else {
        console.error('Failed to create transaction:', data.error);
        alert(`Failed to create payment: ${data.error}`);
      }
    }
  }
};

// Update subscribe button text
<button
  onClick={() => {
    // ...
    if (isFeatured && onLifetimeClick) {
      onLifetimeClick();
    } else if (!isFree) {
      handleSubscribe();
    }
  }}
  disabled={disabled}
  className={/* ... */}
>
  {disabled
    ? buttonText
    : user
    ? (isFree
        ? buttonText
        : isIndonesia && planType === 'monthly'
        ? `Subscribe with Auto-Renew (${paymentMethod === 'credit_card' ? 'Card' : 'GoPay'})`
        : isIndonesia ? "Bayar Sekarang" : "Pay Now")
    : buttonText}
</button>
```

---

### B. Update `/app/dashboard/billing/page.tsx`

**Changes Required:**

1. **Display payment method** for recurring subscriptions
2. **Show auto-renew indicator**
3. **Update cancel button** to work with Midtrans

#### Implementation

```typescript
// Add display for payment method
{!isFreePlan && subscription?.midtransPaymentMethod && (
  <div className="flex justify-between items-center py-3 border-b border-border">
    <span className="text-muted-foreground flex items-center gap-2">
      <CreditCard className="w-4 h-4" />
      Payment Method
    </span>
    <span className="font-semibold text-foreground">
      {subscription.midtransPaymentMethod === 'credit_card' && (
        <span className="flex items-center gap-2">
          💳 Kartu Kredit/Debit
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
            Auto-Renew Active
          </span>
        </span>
      )}
      {subscription.midtransPaymentMethod === 'gopay_tokenization' && (
        <span className="flex items-center gap-2">
          📱 GoPay
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
            Auto-Renew Active
          </span>
        </span>
      )}
    </span>
  </div>
)}

// Update cancel dialog description for recurring
{!isLifetime && !isFreePlan && isActive && subscription?.midtransPaymentMethod && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" className="w-full mt-4" disabled={cancelling}>
        {cancelling ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Cancelling...
          </>
        ) : (
          "Cancel Auto-Renew Subscription"
        )}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="bg-card border-border">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-foreground">
          Cancel Auto-Renew Subscription?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-muted-foreground">
          Your auto-renew subscription will be cancelled, but you&apos;ll keep access until the end
          of your current billing period ({formatDate(rawRenewsAt)}). After that, your account will
          revert to the free plan. You can subscribe again anytime.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep Auto-Renew</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleCancelSubscription}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Yes, Cancel Auto-Renew
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

---

## 🔐 Environment Variables

Add to `.env.local` (or verify existing):

```bash
# Midtrans Configuration (already exists)
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Subscription Configuration (NEW)
MIDTRANS_SUBSCRIPTION_ENABLED=true
```

---

## ⚙️ Midtrans Dashboard Setup

### 1. Enable Subscription Feature

1. Login to [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Navigate to **Settings** → **Payment Features**
3. Find **Subscription** section
4. Toggle **Enable Subscription** to ON

### 2. Configure Webhook

1. Go to **Settings** → **Webhook**
2. Verify webhook URL is set correctly:
   ```
   https://your-domain.com/api/payment/midtrans/webhook
   ```
3. Ensure webhook receives:
   - `payment.notification` (existing)
   - `payment.recurring` (new)
   - `subscription.cancelled` (new)
   - `subscription.expired` (new)

### 3. Test in Sandbox First

- Use Sandbox credentials
- Test full flow before going production

---

## 🧪 Testing Checklist

### Database Migrations
- [ ] Run migration `012_add_recurring_subscription_fields.sql`
- [ ] Run migration `013_add_pending_transaction_fields.sql`
- [ ] Verify columns added to `subscriptions` table
- [ ] Verify columns added to `pending_midtrans_transactions` table
- [ ] Check indexes created successfully

### API: Create Subscription (Recurring)
- [ ] POST to `/api/payment/midtrans/charge` with `paymentMethod: 'credit_card'`
- [ ] Verify Midtrans Subscription API called
- [ ] Check `pending_midtrans_transactions` has `is_recurring: true`
- [ ] Check `payment_method` stored correctly
- [ ] Verify response includes `subscriptionId` and `redirectUrl`

### API: Create Transaction (One-Time)
- [ ] POST to `/api/payment/midtrans/charge` without `paymentMethod`
- [ ] Verify existing Snap API flow still works
- [ ] Check `is_recurring: false` in DB

### API: Webhook - Recurring Payment
- [ ] Simulate `payment.recurring` webhook event
- [ ] Verify `renews_at` updated to next month
- [ ] Check user status remains active
- [ ] Verify logs show "Subscription renewed successfully"

### API: Webhook - Subscription Cancelled
- [ ] Simulate `subscription.cancelled` webhook event
- [ ] Verify status changed to "cancelled"
- [ ] Check `ends_at` set correctly
- [ ] Verify user reverted to free plan
- [ ] Check `midtrans_subscription_token` cleared

### API: Cancel Subscription
- [ ] POST to `/api/subscription/cancel` with `provider: 'midtrans'`
- [ ] Verify Midtrans Cancel API called
- [ ] Check Supabase status updated to "cancelled"
- [ ] Verify user reverted to free plan
- [ ] Check access still available until `ends_at`

### Frontend: Upgrade Page
- [ ] Verify payment method selector appears for Indonesian monthly plan
- [ ] Verify selector does NOT appear for:
  - Free plan
  - Lifetime plan
  - Non-Indonesian users
- [ ] Test "Subscribe with Auto-Renew" button text updates
- [ ] Verify paymentMethod passed correctly to API
- [ ] Test redirect to Midtrans authorization page

### Frontend: Billing Page
- [ ] Verify payment method displayed correctly
- [ ] Check "Auto-Renew Active" badge shown
- [ ] Verify cancel button text updated to "Cancel Auto-Renew"
- [ ] Test cancel dialog shows correct message
- [ ] Verify cancel button works with Midtrans provider

### Integration: Full Flow (Sandbox)
- [ ] User selects "Kartu Kredit" and clicks subscribe
- [ ] Redirected to Midtrans authorization page
- [ ] User authorizes card
- [ ] First payment succeeds
- [ ] Subscription created in Supabase with `midtrans_subscription_token`
- [ ] `renews_at` set to next month
- [ ] User marked as Pro
- [ ] Midtrans auto-charges next month
- [ ] Webhook receives `payment.recurring`
- [ ] `renews_at` updated to following month
- [ ] User remains Pro
- [ ] User cancels subscription
- [ ] Midtrans subscription cancelled
- [ ] Supabase status: "cancelled"
- [ ] User reverts to free after `ends_at`

### Edge Cases
- [ ] Cancel subscription with no `midtrans_subscription_token`
- [ ] Webhook retry on failure
- [ ] Invalid `subscriptionId` in cancel API
- [ ] Non-owner tries to cancel subscription
- [ ] Payment method = null (one-time) vs recurring
- [ ] User already has active subscription

---

## 🚀 Deployment & Rollout Plan

### Phase 1: Database (Day 1)
**Risk:** Zero
**Duration:** 1 hour

1. Run database migrations in staging
2. Verify schema changes
3. Test existing functionality still works
4. Run migrations in production
5. Monitor for any issues

### Phase 2: Backend API (Day 2)
**Risk:** Low (backward compatible)
**Duration:** 4 hours

1. Update `/api/payment/midtrans/charge/route.ts`
2. Add `paymentMethod` parameter (optional)
3. Test one-time payment still works
4. Test recurring payment creation
5. Deploy to staging
6. Deploy to production

### Phase 3: Webhook & Cancel API (Day 2-3)
**Risk:** Medium (webhook changes)
**Duration:** 3 hours

1. Update `/api/payment/midtrans/webhook/route.ts`
2. Add recurring event handlers
3. Add logging for debugging
4. Update `/api/subscription/cancel/route.ts`
5. Add Midtrans support
6. Deploy to staging
7. Test with Midtrans sandbox
8. Deploy to production

### Phase 4: Frontend (Day 3-4)
**Risk:** Medium (UI changes)
**Duration:** 4 hours

1. Update `/app/upgrade/page.tsx`
2. Update `/app/dashboard/billing/page.tsx`
3. Test in development environment
4. Test in staging
5. Deploy to production
6. Monitor user feedback

### Phase 5: Midtrans Configuration (Day 4)
**Risk:** Low
**Duration:** 1 hour

1. Enable subscription in Midtrans Dashboard
2. Configure webhook events
3. Test full sandbox flow
4. Monitor for issues

### Phase 6: Production Monitoring (Day 5-7)
**Risk:** N/A (monitoring)
**Duration:** 3 days

1. Monitor webhook delivery
2. Monitor subscription creation
3. Monitor payment failures
4. Check error logs
5. Collect user feedback
6. Fix any bugs found

---

## 🔄 Rollback Plan

### If Issues Detected

1. **Frontend Rollback:** Revert `/app/upgrade/page.tsx` and `/app/dashboard/billing/page.tsx`
   - Impact: Users won't see recurring option
   - Existing subscriptions still work

2. **Backend Rollback:** Revert API changes
   - Impact: No new recurring subscriptions
   - Existing subscriptions unaffected

3. **Database Rollback:** No rollback needed (schema changes are backward compatible)

4. **Midtrans Rollback:** Disable subscription in dashboard
   - Impact: No new recurring charges

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Webhook success rate > 99%
- [ ] Subscription creation success rate > 95%
- [ ] API response time < 500ms
- [ ] Zero database errors

### Business Metrics
- [ ] % of monthly users choosing recurring vs one-time
- [ ] Churn rate after implementation
- [ ] User satisfaction (feedback)
- [ ] Payment failure rate < 5%

---

## 🐛 Known Limitations

1. **Currency:** Recurring only supports IDR (Midtrans limitation)
2. **Payment Methods:** Only Credit Card and GoPay Tokenization (no BNI/Mandiri/BCA Autopay)
3. **Pause/Resume:** Not implemented (only cancel)
4. **Midtrans API:** No retry logic for failed webhook calls (rely on Midtrans retries)

---

## 📚 References

- [Midtrans Subscription API Documentation](https://docs.midtrans.com/reference/subscription-api)
- [Midtrans Cancel Subscription](https://docs.midtrans.com/reference/cancel-subscription)
- [Midtrans Webhook Documentation](https://docs.midtrans.com/docs/http-notification)
- Midtrans Sandbox Dashboard

---

## ✅ Pre-Implementation Checklist

Before starting implementation:

- [ ] All team members reviewed this plan
- [ ] Database migration scripts tested in staging
- [ ] Midtrans sandbox credentials available
- [ ] Webhook endpoint publicly accessible
- [ ] Error logging and monitoring set up
- [ ] Rollback procedures documented
- [ ] Support team trained on new flow
- [ ] User communication drafted

---

## 📞 Support & Questions

For questions or issues during implementation:

1. Check Midtrans API logs
2. Review Supabase logs
3. Check application error logs
4. Contact Midtrans support for API issues
5. Contact technical lead for code issues

---

**Document Version:** 1.0
**Last Updated:** 2026-02-25
**Author:** OpenCode Agent
