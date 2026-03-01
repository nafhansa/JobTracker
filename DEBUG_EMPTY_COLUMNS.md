# Debugging Guide: Empty Subscription Columns

## Problem
The `midtrans_subscription_token`, `midtrans_payment_method`, and `midtrans_account_id` columns in the `subscriptions` table are empty (NULL).

---

## Root Cause
The webhook is not properly handling credit card payments with `save_card: true` and saving the required fields.

---

## What Was Fixed

### 1. Webhook Handler Updated
**Before:**
- Webhook only checked `saved_token_id` existed
- If it didn't exist, columns remained empty
- Generic handler didn't save the fields

**After:**
- Webhook now explicitly handles credit card payments
- Checks if `saved_token_id` exists:
  - ✅ If YES: Handles as auto-renewal, saves all fields
  - ✅ If NO: Handles as one-time, sets fields to NULL
- Added detailed logging to track execution flow

### 2. New Functions Added
- `handleFirstPaymentWithSaveCard()` - Saves auto-renewal data
- `handleFirstPaymentWithoutSaveCard()` - Handles one-time payments

### 3. Enhanced Logging
Added extensive logging to track webhook execution:
```
=== CREDIT CARD PAYMENT DETECTED ===
Has saved_token_id: true/false
Has masked_card: true/false
=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ===
  OR
=== HANDLING WITHOUT SAVE CARD (ONE-TIME PAYMENT) ===
```

---

## How to Debug

### Step 1: Check Server Logs
Look for these specific log messages when webhook is triggered:

**Expected for Auto-Renewal:**
```
Midtrans webhook received: {
  order_id: 'JT-xxx',
  transaction_status: 'settlement',
  payment_type: 'credit_card',
  saved_token_id: '526422-4659',  ← SHOULD EXIST
  masked_card: '491111-1113'         ← SHOULD EXIST
}

=== CREDIT CARD PAYMENT DETECTED ===
Has saved_token_id: true
Has masked_card: true
=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ===
=== HANDLING FIRST PAYMENT WITH SAVE CARD ===
User ID: n7IBvV05j0VQ...
Saved Token ID: 526422-4659
Masked Card: 491111-1113
Upserting subscription with saved_token_id: {
  midtrans_subscription_token: '526422-4659',
  midtrans_payment_method: 'credit_card',
  midtrans_account_id: '491111-1113',
  ...
}
Subscription upserted successfully
```

**Expected for One-Time Payment:**
```
=== CREDIT CARD PAYMENT DETECTED ===
Has saved_token_id: false
=== HANDLING WITHOUT SAVE CARD (ONE-TIME PAYMENT) ===
Upserting subscription WITHOUT saved_token_id: {
  midtrans_subscription_token: null,
  midtrans_payment_method: 'credit_card',
  midtrans_account_id: null,
  ...
}
```

### Step 2: Verify Database Columns

After webhook runs, check the database:

```sql
SELECT
  id,
  user_id,
  plan,
  status,
  midtrans_subscription_id,
  midtrans_subscription_token,        ← Should be '526422-4659' for auto-renewal
  midtrans_payment_method,            ← Should be 'credit_card'
  midtrans_account_id,               ← Should be '491111-1113' for auto-renewal
  recurring_frequency,               ← Should be 'monthly' for auto-renewal
  renews_at,
  updated_at
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID';
```

**Expected for Auto-Renewal:**
- `midtrans_subscription_token`: NOT NULL (contains saved_token_id)
- `midtrans_payment_method`: 'credit_card'
- `midtrans_account_id`: NOT NULL (contains masked card)
- `recurring_frequency`: 'monthly'

### Step 3: Verify Snap API Request

Check if Snap API is being called with `save_card: true`:

**Server logs should show:**
```javascript
Creating Midtrans transaction: {
  orderId: 'JT-xxx',
  amount: 31988,
  requestBody: '{
    "transaction_details": {...},
    "credit_card": {
      "save_card": true          ← MUST BE TRUE
    }
  }'
}
```

### Step 4: Verify Midtrans Response

Check if Midtrans is returning `saved_token_id` in the webhook:

**Webhook payload should contain:**
```json
{
  "order_id": "JT-xxx",
  "transaction_status": "settlement",
  "payment_type": "credit_card",
  "saved_token_id": "526422-4659",    ← MUST EXIST
  "masked_card": "491111-1113"          ← MUST EXIST
}
```

---

## Common Issues & Solutions

### Issue 1: `save_card: true` not being sent

**Symptoms:**
- Logs show no `save_card` in Snap request
- Webhook receives no `saved_token_id`

**Check:**
```bash
# In charge/route.ts, line ~280
# Should have:
snapBody.credit_card = {
  save_card: true,
};
```

**Fix:**
- Verify `enableAutoRenew` is passed from frontend
- Check that `planType === 'monthly'` condition is met

### Issue 2: Webhook not being called

**Symptoms:**
- No webhook logs after payment
- Payment successful but no subscription created

**Check:**
```bash
# 1. Check Midtrans webhook URL is correct
# Should be: https://yourdomain.com/api/payment/midtrans/webhook

# 2. Check Midtrans dashboard
# Settings → Webhooks → Verify URL is set
```

**Fix:**
- Update webhook URL in Midtrans dashboard
- Verify server is accessible from internet
- Check firewall settings

### Issue 3: Payment succeeds but no `saved_token_id`

**Symptoms:**
- Payment successful
- Webhook received but `saved_token_id` is undefined
- Columns remain empty

**Possible Causes:**
1. User unchecked auto-renewal (not possible now)
2. Midtrans didn't save card for some reason
3. Test card doesn't support saving

**Check:**
```bash
# Look at Midtrans dashboard
# Transactions → Find the transaction
# Check if "Saved Token" is shown
```

**Fix:**
- Use correct test card: `4911 1111 1111 1113`
- Ensure `save_card: true` is sent to Snap API
- Check Midtrans test card documentation

### Issue 4: Database columns don't exist

**Symptoms:**
- Webhook logs show data being saved
- But database query shows columns are NULL

**Check:**
```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN (
    'midtrans_subscription_token',
    'midtrans_payment_method',
    'midtrans_account_id',
    'recurring_frequency'
  );
```

**Fix:**
- Run migration: `migrations/012_add_recurring_subscription_fields.sql`
- Or manually add columns:
```sql
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS midtrans_subscription_token TEXT,
ADD COLUMN IF NOT EXISTS midtrans_payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS midtrans_account_id TEXT,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20) DEFAULT 'monthly';
```

---

## Testing Steps

### Test 1: Clean Database
```sql
-- Clear test data
DELETE FROM subscriptions WHERE user_id = 'YOUR_TEST_USER_ID';
DELETE FROM pending_midtrans_transactions WHERE user_id = 'YOUR_TEST_USER_ID';
```

### Test 2: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Test 3: Test Monthly Plan
```
1. Go to http://localhost:3000/upgrade
2. Verify "Auto-Renewal Enabled" badge shown
3. Click "Subscribe" on monthly plan
4. Pay with: 4911 1111 1111 1113
5. IMMEDIATELY check server logs
6. Wait for webhook (1-30 seconds)
7. Check database columns
```

### Test 4: Verify Midtrans Dashboard
```
1. Login to Midtrans dashboard (sandbox)
2. Check Transactions → See the payment
3. Check Recurring → Subscriptions → See the subscription created
```

---

## Expected Flow

### With Auto-Renewal:
```
User subscribes
  ↓
Frontend: POST /api/payment/midtrans/charge
  { enableAutoRenew: true }
  ↓
Backend: Create Snap with save_card: true
  ↓
User pays with card
  ↓
Midtrans: Payment successful + saved_token_id
  ↓
Webhook: POST /api/payment/midtrans/webhook
  { saved_token_id: '526422-4659' }
  ↓
Webhook: Log "=== CREDIT CARD PAYMENT DETECTED ==="
  ↓
Webhook: Log "Has saved_token_id: true"
  ↓
Webhook: Call handleFirstPaymentWithSaveCard()
  ↓
Webhook: Save to database:
  - midtrans_subscription_token: '526422-4659'
  - midtrans_payment_method: 'credit_card'
  - midtrans_account_id: '491111-1113'
  - recurring_frequency: 'monthly'
  ↓
Webhook: Call Midtrans Subscription API
  ↓
Midtrans: Create recurring subscription
  ↓
Webhook: Update midtrans_subscription_id in database
  ✅ DONE
```

---

## Server Log Checklist

When testing, your logs should show:

- ✅ `Creating Midtrans transaction:` with `save_card: true`
- ✅ Payment successful
- ✅ Webhook received with `saved_token_id` present
- ✅ `=== CREDIT CARD PAYMENT DETECTED ===`
- ✅ `Has saved_token_id: true`
- ✅ `=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ===`
- ✅ `Upserting subscription with saved_token_id:`
- ✅ `Subscription upserted successfully`
- ✅ `Creating Midtrans recurring subscription for user:`
- ✅ `Midtrans subscription created:`
- ✅ `Subscription updated with Midtrans subscription ID:`

---

## If Still Having Issues

### Collect Debug Info:

1. **Server Logs:**
```bash
# Save all logs from test
npm run dev 2>&1 | tee webhook_debug.log
```

2. **Webhook Payload:**
```bash
# Add this temporarily to webhook to log full body
console.log('=== FULL WEBHOOK BODY ===', JSON.stringify(body, null, 2));
```

3. **Database State:**
```sql
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';
```

4. **Midtrans Dashboard:**
- Take screenshot of transaction details
- Take screenshot of subscription details

### Share With Us:

Please provide:
1. Server logs (especially webhook section)
2. Webhook payload (if available)
3. Database query results
4. Midtrans dashboard screenshots
5. Steps to reproduce

---

## Next Steps

1. Test the updated webhook
2. Check logs extensively
3. Verify database columns are populated
4. If working, test full subscription flow
5. Report back with results

---

## Quick Fix Summary

✅ Webhook now handles credit card payments explicitly
✅ Checks for `saved_token_id` existence
✅ Saves all required columns to database
✅ Added detailed logging for debugging
✅ Created two separate handlers:
   - With save card (auto-renewal)
   - Without save card (one-time)
✅ Returns early to prevent generic handler override

Good luck with debugging! 🔧
