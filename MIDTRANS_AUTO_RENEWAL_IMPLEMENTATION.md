# Midtrans Auto-Renewal Subscription Implementation

## Overview
This document describes the implementation of Midtrans recurring subscription payments for JobTracker.

## Status
- ✅ Phase 1: Credit Card Auto-Renewal MVP (CURRENT)
- ⏳ Phase 2: GoPay Auto-Renewal (COMING AFTER TESTING)

## Phase 1: Credit Card Auto-Renewal MVP

### Features Implemented
1. ✅ Auto-renewal checkbox (checked by default for Indonesian users)
2. ✅ Capture saved_token_id from initial payment
3. ✅ Create Midtrans subscription using saved token
4. ✅ Webhook handles recurring payments
5. ✅ Subscription management (cancel, update)
6. ✅ 3-day grace period for failed payments

### Database Schema
The following columns are required in the `subscriptions` table (already in migration `012_add_recurring_subscription_fields.sql`):

```sql
midtrans_subscription_token TEXT        -- Subscription token from Midtrans
midtrans_payment_method VARCHAR(50)   -- 'credit_card', 'gopay_tokenization'
midtrans_account_id TEXT              -- Masked card number or GoPay account ID
recurring_frequency VARCHAR(20)       -- 'monthly', 'yearly'
```

### API Endpoints

#### 1. Create Payment with Auto-Renewal
```
POST /api/payment/midtrans/charge
```

**Request Body:**
```json
{
  "userId": "firebase_uid",
  "plan": "monthly" | "lifetime",
  "currency": "IDR" | "USD",
  "enableAutoRenew": true,  // NEW: Enable auto-renewal
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+62812345678"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "JT-xxx-xxx",
  "token": "snap_token",
  "redirectUrl": "snap_redirect_url"
}
```

**Behavior:**
- If `enableAutoRenew: true`, creates Snap transaction with `save_card: true`
- Stores intent to create subscription in `pending_midtrans_transactions`
- Midtrans returns `saved_token_id` after successful payment

#### 2. Webhook Handler
```
POST /api/payment/midtrans/webhook
```

**Webhook Response (First Payment with save_card):**
```json
{
  "order_id": "JT-xxx-xxx",
  "transaction_status": "settlement",
  "payment_type": "credit_card",
  "saved_token_id": "526422-4659",
  "masked_card": "526422-4659"
}
```

**Behavior:**
1. Captures `saved_token_id` from webhook
2. Creates/updates subscription in database
3. Stores `midtrans_subscription_token`, `midtrans_payment_method`, `midtrans_account_id`
4. Calls Midtrans Subscription API to create recurring subscription
5. Updates subscription with `midtrans_subscription_id` and `renews_at`

**Webhook Response (Recurring Payment):**
```json
{
  "order_id": "JT-xxx-xxx",
  "transaction_status": "settlement",
  "payment_type": "recurring",
  "subscription_id": "midtrans_subscription_id"
}
```

**Behavior:**
1. Finds subscription by `midtrans_subscription_id`
2. Updates `renews_at` to next month
3. Updates user status to active pro

**Webhook Response (Failed Payment):**
```json
{
  "order_id": "JT-xxx-xxx",
  "transaction_status": "deny",
  "subscription_id": "midtrans_subscription_id"
}
```

**Behavior:**
1. Records failed payment
2. Sets grace period (3 days)
3. Sends email notification (if configured)
4. Cancels subscription if not renewed within grace period

#### 3. Create Subscription (Internal)
```
POST /api/payment/midtrans/create-subscription
```

**Request Body:**
```json
{
  "userId": "firebase_uid",
  "savedTokenId": "526422-4659",
  "amount": 31988,
  "currency": "IDR",
  "paymentMethod": "credit_card",
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+62812345678"
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "midtrans_subscription_uuid",
  "nextExecutionAt": "2026-04-01 12:00:00"
}
```

**Behavior:**
- Calls Midtrans Subscription API
- Creates recurring subscription with monthly interval
- Returns subscription details

#### 4. Cancel Subscription
```
POST /api/subscription/cancel
```

**Request Body:**
```json
{
  "subscriptionId": "subscription_id",
  "userId": "firebase_uid",
  "provider": "midtrans"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "endsAt": "2026-04-01T12:00:00.000Z"
}
```

**Behavior:**
- Cancels subscription in Midtrans (if has subscription_id)
- Updates database status to 'cancelled'
- Sets `ends_at` to current `renews_at` (end of current billing period)
- Reverts user to free plan

#### 5. Update Payment Method (Future)
```
POST /api/payment/midtrans/update-payment-method
```

**Status:** ⏳ Not yet implemented (after GoPay)

### Frontend Components

#### Upgrade Page (`/src/app/upgrade/page.tsx`)
- Displays pricing cards with auto-renewal checkbox
- Auto-renewal checked by default for Indonesian users
- Passes `enableAutoRenew: true` when checkbox is checked

#### Pricing Page (`/src/app/pricing/page.tsx`)
- Same as upgrade page

#### Payment Page (`/src/app/payment/midtrans/page.tsx`)
- Displays payment summary
- Shows Snap popup for payment
- Displays success/error messages

#### Billing Page (`/src/app/dashboard/billing/page.tsx`)
- Displays current subscription status
- Shows next billing date
- Shows payment method (masked card)
- Cancel subscription button
- (Future) Update payment method button

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS SUBSCRIBE                        │
│                    (Auto-Renewal Checked)                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/payment/midtrans/charge                           │
│  { enableAutoRenew: true, save_card: true }                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Creates Snap Transaction with save_card: true                │
│  Stores in pending_midtrans_transactions                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Enters Card Details in Snap Popup                       │
│  Midtrans Validates Card                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Payment Successful + saved_token_id Returned                  │
│  Webhook POST /api/payment/midtrans/webhook                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Webhook Captures:                                          │
│  - saved_token_id                                           │
│  - masked_card                                              │
│  - subscription_id (if recurring)                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Creates/Updates Subscription in DB                        │
│     - status: active                                         │
│     - plan: monthly                                          │
│     - midtrans_subscription_token: saved_token_id             │
│     - midtrans_payment_method: 'credit_card'                 │
│     - midtrans_account_id: masked_card                       │
│     - renews_at: next_month                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Calls Midtrans Subscription API                          │
│     POST /v1/subscriptions                                  │
│     { token: saved_token_id, schedule: { interval: 1, ... } }│
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Updates Subscription in DB                               │
│     - midtrans_subscription_id: returned_from_api             │
│     - recurring_frequency: 'monthly'                          │
│     - renews_at: next_execution_at                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Updates User in DB                                      │
│     - subscription_plan: 'monthly'                           │
│     - subscription_status: 'active'                            │
│     - is_pro: true                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SUBSEQUENT MONTHLY CHARGES (Automatic by Midtrans)          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Midtrans Charges Card Automatically                         │
│  Webhook POST /api/payment/midtrans/webhook                 │
│  { payment_type: 'recurring', subscription_id: 'xxx' }      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Updates Subscription in DB                                   │
│  - renews_at: next_month                                   │
│  - updated_at: now                                          │
│  - status: active                                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Updates User in DB                                          │
│  - is_pro: true                                            │
│  - subscription_status: 'active'                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FAILED PAYMENT (3-Day Grace Period)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Midtrans Fails to Charge Card                               │
│  Webhook POST /api/payment/midtrans/webhook                 │
│  { payment_type: 'recurring', status: 'deny' }              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Records Failed Payment                                     │
│  - Sets grace_period_end = now + 3 days                    │
│  - status: 'grace_period'                                   │
│  - Sends email notification to user                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Can:                                                  │
│  - Update payment method                                     │
│  - Retry payment manually                                    │
│  - Cancel subscription                                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  After 3 Days:                                              │
│  - Subscription status: 'cancelled'                           │
│  - User reverts to free plan                                │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Variables Required

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false  # Set to true for production

# Midtrans API URLs (auto-detected, but can override)
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions
MIDTRANS_CORE_URL=https://api.sandbox.midtrans.com/v1
MIDTRANS_SUBSCRIPTION_URL=https://api.sandbox.midtrans.com/v1/subscriptions
```

## Testing Instructions

### 1. Test One-Time Payment (No Auto-Renewal)
1. Go to `/upgrade` or `/pricing`
2. Uncheck "Enable auto-renewal"
3. Click "Subscribe"
4. Complete payment with test card
5. Verify: Subscription created, no recurring subscription in Midtrans

### 2. Test Auto-Renewal (Credit Card)
1. Go to `/upgrade` or `/pricing`
2. Keep "Enable auto-renewal" checked (default)
3. Click "Subscribe"
4. Complete payment with test card
5. Verify:
   - Webhook receives `saved_token_id`
   - Subscription created with `midtrans_subscription_token`
   - Midtrans subscription created (check Midtrans dashboard)
   - `renews_at` set to next month

### 3. Test Recurring Payment
1. After subscription created, wait for next month
2. Midtrans should automatically charge the card
3. Webhook receives `payment_type: 'recurring'`
4. Verify: `renews_at` updated to next month

### 4. Test Failed Payment (Grace Period)
1. Change card to invalid test card in Midtrans dashboard
2. Wait for next monthly charge (or trigger manually)
3. Verify:
   - Webhook receives `status: 'deny'`
   - Subscription status set to 'grace_period'
   - Grace period end set to now + 3 days
   - User can still access pro features

### 5. Test Cancel Subscription
1. Go to `/dashboard/billing`
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Verify:
   - Subscription cancelled in Midtrans
   - Database status: 'cancelled'
   - `ends_at` set to next billing date
   - User still pro until `ends_at`
   - After `ends_at`, user downgraded to free

### 6. Test Update Payment Method
⏳ Coming after GoPay implementation

## Midtrans Test Cards (Sandbox)

### Successful Payments
```
Card Number: 4911 1111 1111 1113
CVV: 123
Expiry: Any future date
Result: Success
```

### Failed Payments
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
Result: Failed (deny)
```

### 3DS Auth Required
```
Card Number: 4000 0070 0000 0002
CVV: 123
Expiry: Any future date
Result: 3DS challenge
```

## Troubleshooting

### Issue: saved_token_id not received in webhook
**Cause:** Snap transaction created without `save_card: true`
**Solution:** Check that `enableAutoRenew` is passed to charge API

### Issue: Subscription not created in Midtrans
**Cause:** Webhook not calling Subscription API
**Solution:** Check webhook logs, verify Midtrans API credentials

### Issue: Recurring payment not received
**Cause:** Subscription not active in Midtrans
**Solution:** Check Midtrans dashboard, verify subscription status

### Issue: User downgraded before grace period ends
**Cause:** `renews_at` not updated correctly
**Solution:** Check webhook logic for recurring payments

### Issue: Cancel not working
**Cause:** `midtrans_subscription_id` not stored
**Solution:** Verify webhook captured `subscription_id` from Subscription API response

## Next Steps

After testing Phase 1:
1. Report any issues found during testing
2. We'll proceed to Phase 2: GoPay Auto-Renewal
3. Implement Phase 3: Update Payment Method
4. Implement Phase 4: Email Notifications
5. Implement Phase 5: Analytics Dashboard

## Support

For issues or questions:
- Check Supabase logs for webhook errors
- Check Midtrans dashboard for subscription status
- Review webhook responses in console logs
- Contact Midtrans support for API issues
