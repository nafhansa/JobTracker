# Quick Reference: Midtrans Auto-Renewal Implementation

## What's Implemented (Phase 1 - Credit Card MVP)

✅ Monthly plans automatically have auto-renewal enabled
✅ Shows "Auto-Renewal Enabled" badge (no checkbox)
✅ Capture `saved_token_id` from initial payment
✅ Create Midtrans subscription using saved token
✅ Handle recurring payments in webhook
✅ Update subscription `renews_at` automatically
✅ Cancel subscription support
✅ 3-day grace period (framework ready)
✅ Database migrations ready

---

## Files Changed

### Backend
- `/src/app/api/payment/midtrans/webhook/route.ts`
  - Added `saved_token_id` and `masked_card` capture
  - Added `handleFirstPaymentWithSaveCard()` function
  - Calls Midtrans Subscription API automatically

- `/src/app/api/payment/midtrans/charge/route.ts`
  - Added `enableAutoRenew` parameter support
  - Added `save_card: true` to Snap API when enabled

### Frontend
- `/src/app/upgrade/page.tsx`
  - Monthly plans automatically enable auto-renewal
  - Shows "Auto-Renewal Enabled" badge
  - Automatically passes `enableAutoRenew: true` for monthly plans
  - Lifetime plans do not have auto-renewal

- `/src/app/pricing/page.tsx`
  - Same changes as upgrade page

- `/src/app/payment/midtrans/page.tsx`
  - No changes needed (works as-is)

### Documentation
- `MIDTRANS_AUTO_RENEWAL_IMPLEMENTATION.md` - Full documentation
- `MIDTRANS_AUTO_RENEWAL_TESTING_CHECKLIST.md` - Testing guide

---

## How It Works

### User Flow:
1. User goes to `/upgrade` or `/pricing`
2. Monthly plans show "Auto-Renewal Enabled" badge automatically
3. User clicks "Subscribe" on monthly plan
4. Midtrans Snap popup opens
5. User enters card details and pays
6. Payment successful → Midtrans returns `saved_token_id`
7. Webhook receives `saved_token_id`
8. Webhook:
   - Creates/updates subscription in database
   - Stores `saved_token_id`, `masked_card`, `payment_method`
   - Calls Midtrans Subscription API
   - Updates `renews_at` to next month
9. User is now Pro with auto-renewal enabled

### Monthly Auto-Charge:
1. Next month → Midtrans automatically charges card
2. Webhook receives `payment_type: 'recurring'`
3. Webhook updates `renews_at` to next month
4. User remains Pro

---

## Test Cards

### Success (Auto-Renewal)
```
Card: 4911 1111 1111 1113
CVV: 123
Expiry: 12/25
Result: Success + saved_token_id
```

### Fail (Grace Period)
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Result: Denied
```

---

## Database Columns Required

Already in `migrations/012_add_recurring_subscription_fields.sql`:

```sql
midtrans_subscription_token TEXT        -- The saved_token_id from Midtrans
midtrans_payment_method VARCHAR(50)   -- 'credit_card'
midtrans_account_id TEXT              -- '491111-1113' (masked card)
recurring_frequency VARCHAR(20)       -- 'monthly'
```

---

## Server Logs to Watch

### Successful Auto-Renewal:
```
=== HANDLING FIRST PAYMENT WITH SAVE CARD ===
User ID: n7IBvV05j0VQ...
Saved Token ID: 526422-4659
Masked Card: 491111-1113
Upserting subscription with saved_token_id: {...}
Subscription upserted successfully
Creating Midtrans recurring subscription for user: n7IBvV05j0VQ...
Midtrans subscription created: { id: '...', status: 'active', ... }
Subscription updated with Midtrans subscription ID: ...
=== FIRST PAYMENT WITH SAVE CARD HANDLED ===
```

### Recurring Payment:
```
Handling recurring payment: { subscriptionId: '...', userId: '...', ... }
Subscription renewed successfully until: 2026-04-01T...
```

---

## Quick Testing Steps

### Test Monthly Auto-Renewal:
1. Go to `/upgrade`
2. Verify "Auto-Renewal Enabled" badge is shown
3. Click "Subscribe" on monthly plan
4. Pay with card: `4911 1111 1111 1113`
5. Check logs for `saved_token_id`
6. Check Midtrans dashboard for subscription

### Test Lifetime (No Auto-Renewal):
1. Go to `/upgrade`
2. Click "Subscribe" on lifetime plan
3. Pay with card: `4911 1111 1111 1113`
5. Check database → `midtrans_subscription_token` should be NULL

### Test Cancel:
1. Go to `/dashboard/billing`
2. Click "Cancel Subscription"
3. Confirm
4. Check Midtrans dashboard → subscription should be cancelled

---

## Common Issues & Fixes

### Issue: No `saved_token_id` in logs
**Fix:** Check if "Enable Auto-Renewal" was checked
**Fix:** Check if Snap API call includes `save_card: true`

### Issue: Subscription not created in Midtrans
**Fix:** Check server logs for Subscription API call
**Fix:** Verify Midtrans API credentials
**Fix:** Check `saved_token_id` is valid

### Issue: Cancel not working
**Fix:** Check if `midtrans_subscription_id` is stored
**Fix:** Check cancel API logs for errors

---

## Next Steps (After Testing)

### Phase 2: GoPay Auto-Renewal
- GoPay tokenization flow
- Link GoPay account
- Create GoPay subscription
- Update payment method

### Phase 3: Update Payment Method
- Allow changing card without cancelling
- Graceful migration to new subscription

### Phase 4: Grace Period Logic
- Implement 3-day grace period
- Email notifications
- Manual retry option

### Phase 5: Email Notifications
- Payment success email
- Payment failed email
- Grace period warning
- Subscription cancelled email

### Phase 6: Analytics
- Subscription churn rate
- Revenue metrics
- Renewal success rate

---

## Environment Variables

```env
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
```

---

## Midtrans Dashboard

Sandbox URL: https://dashboard.sandbox.midtrans.com/
Production URL: https://dashboard.midtrans.com/

Check:
- Transactions → See payment history
- Recurring → Subscriptions → See recurring subscriptions
- Settings → API Keys → Get credentials

---

## Support

- **Documentation:** `MIDTRANS_AUTO_RENEWAL_IMPLEMENTATION.md`
- **Testing Guide:** `MIDTRANS_AUTO_RENEWAL_TESTING_CHECKLIST.md`
- **This Guide:** `QUICK_REFERENCE.md`

Need help? Check server logs first, then review testing guide.
