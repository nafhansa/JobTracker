# Midtrans Auto-Renewal Testing Checklist

## Prerequisites

1. ✅ Database migration run (`migrations/012_add_recurring_subscription_fields.sql`)
2. ✅ Environment variables configured
3. ✅ Midtrans sandbox account ready
4. ✅ Test credit card ready (see test cards below)

---

## Test Case 1: Monthly Subscription (Auto-Renewal Enabled by Default)

### Steps:
1. Navigate to `/upgrade` or `/pricing`
2. Locate to monthly plan card
3. Verify "Auto-Renewal Enabled" badge is shown
4. Click "Subscribe" button
5. Complete payment using test card: `4911 1111 1111 1113`
6. Wait for redirect to payment success page

### Expected Results:
- ✅ Payment successful
- ✅ User upgraded to Pro
- ✅ Subscription created in database with status 'active'
- ✅ `midtrans_subscription_token` is set (saved_token_id from Midtrans)
- ✅ `midtrans_payment_method` is set to 'credit_card'
- ✅ `midtrans_account_id` is set (masked card number)
- ✅ `renewal_frequency` is set to 'monthly'
- ✅ `renews_at` is set to next month
- ✅ `midtrans_subscription_id` is set (subscription ID from Midtrans)
- ✅ Recurring subscription created in Midtrans dashboard

### Server Logs to Check:
```bash
# Look for these log messages:
# - "=== HANDLING FIRST PAYMENT WITH SAVE CARD ==="
# - "Saved Token ID: 526422-4659"
# - "Creating Midtrans recurring subscription for user: xxx"
# - "Midtrans subscription created: {...}"
```

### Verification Queries:
```sql
-- Check subscription
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';

-- Expected:
-- - status: 'active'
-- - midtrans_subscription_token: '526422-4659' (or similar)
-- - midtrans_payment_method: 'credit_card'
-- - midtrans_account_id: '491111-1113' (masked card)
-- - recurring_frequency: 'monthly'
-- - renews_at: '2026-04-01T...' (next month)
-- - midtrans_subscription_id: 'uuid-from-midtrans'

-- Check user status
SELECT * FROM users WHERE id = 'YOUR_USER_ID';

-- Expected:
-- - subscription_plan: 'monthly'
-- - subscription_status: 'active'
-- - is_pro: true
```

### Midtrans Dashboard Check:
1. Login to Midtrans dashboard (sandbox)
2. Navigate to **Recurring** → **Subscriptions**
3. Find the subscription by user email
4. Verify:
   - Status: Active
   - Amount: 31988
   - Interval: Monthly
   - Next execution date: Next month

---

## Test Case 2: Lifetime Subscription (No Auto-Renewal)

### Steps:
1. Navigate to `/upgrade` or `/pricing`
2. Locate to lifetime plan card
3. Click "Subscribe" button
4. Complete payment using test card: `4911 1111 1111 1113`
5. Wait for redirect to payment success page

### Expected Results:
- ✅ Payment successful
- ✅ User upgraded to Pro (lifetime)
- ✅ Subscription created in database with status 'active'
- ✅ `plan` is set to 'lifetime'
- ✅ `renews_at` is `NULL`
- ✅ `ends_at` is `NULL`
- ✅ Lifetime purchase recorded in `lifetime_access_purchases`
- ✅ No recurring subscription created

### Verification Queries:
```sql
-- Check subscription
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';

-- Expected:
-- - plan: 'lifetime'
-- - renews_at: NULL
-- - ends_at: NULL

-- Check lifetime purchase
SELECT * FROM lifetime_access_purchases WHERE user_id = 'YOUR_USER_ID';
```

---

## Test Case 3: Cancel Subscription

### Steps:
1. Ensure user has active subscription (from Test Case 2)
2. Navigate to `/dashboard/billing`
3. Click "Cancel Subscription" button
4. Confirm cancellation

### Expected Results:
- ✅ Subscription cancelled in Midtrans dashboard
- ✅ Database status updated to 'cancelled'
- ✅ `ends_at` set to next billing date
- ✅ `midtrans_subscription_token` set to `NULL`
- ✅ User `is_pro` still `true` until `ends_at`
- ✅ User can still access Pro features until `ends_at`

### Verification Queries:
```sql
-- Check subscription
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';

-- Expected:
-- - status: 'cancelled'
-- - ends_at: '2026-04-01T...' (original renews_at date)
-- - midtrans_subscription_token: NULL

-- Check user status
SELECT * FROM users WHERE id = 'YOUR_USER_ID';

-- Expected:
-- - subscription_plan: 'free'
-- - is_pro: true (until ends_at)
```

### Midtrans Dashboard Check:
1. Login to Midtrans dashboard
2. Navigate to **Recurring** → **Subscriptions**
3. Find the subscription
4. Verify:
   - Status: Disabled/Cancelled

---

## Test Case 4: Recurring Payment (Simulation)

### Steps:
1. After subscription created (from Test Case 2)
2. In Midtrans dashboard, manually trigger next charge:
   - Go to Recurring → Subscriptions
   - Find the subscription
   - Click "Execute Now" (if available)
   - Or wait for next month

### Expected Results:
- ✅ Webhook receives `payment_type: 'recurring'`
- ✅ `subscription_id` matches `midtrans_subscription_id`
- ✅ `renews_at` updated to next month
- ✅ User `is_pro` remains `true`
- ✅ Subscription status remains 'active'

### Server Logs to Check:
```bash
# Look for:
# - "Handling recurring payment: {...}"
# - "Subscription renewed successfully until: 2026-05-01T..."
```

### Verification Queries:
```sql
-- Check updated renews_at
SELECT renews_at FROM subscriptions WHERE user_id = 'YOUR_USER_ID';

-- Expected: Next month date (e.g., '2026-05-01T...')
```

---

## Test Case 5: Failed Payment (Grace Period)

### Steps:
1. Ensure user has active recurring subscription
2. In Midtrans dashboard, change card to invalid card: `4111 1111 1111 1111`
3. Trigger next charge or wait for next month
4. Wait for webhook to process

### Expected Results:
- ✅ Webhook receives `status: 'deny'` or `status: 'expire'`
- ⚠️ Subscription status updated to 'grace_period' (if implemented)
- ⚠️ Grace period end set to now + 3 days
- ⚠️ User can still access Pro features during grace period

### Verification Queries:
```sql
-- Check subscription status
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';

-- Expected (if grace period implemented):
-- - status: 'grace_period'
-- - grace_period_end: now + 3 days
```

---

## Test Case 6: Multiple Subscriptions (Same User)

### Steps:
1. Create first monthly subscription with auto-renewal
2. After first payment completes
3. Navigate to `/upgrade` again
4. Try to create another monthly subscription

### Expected Results:
- ✅ Database upserts existing subscription
- ✅ Plan updates to new plan
- ✅ No duplicate subscriptions created

---

## Test Case 7: Webhook Signature Verification

### Steps:
1. Complete a payment
2. Check server logs
3. Look for signature verification messages

### Expected Results:
- ✅ Signature matches
- ✅ No "Invalid signature" errors
- ✅ Webhook processes successfully

### Server Logs to Check:
```bash
# Look for:
# - "Signature verification: { received: '...', calculated: '...' }"
# - If they match, webhook proceeds
# - If mismatch, returns 403
```

---

## Midtrans Test Cards (Sandbox)

### Successful Payment
```
Card Number: 4911 1111 1111 1113
CVV: 123
Expiry: Any future date (e.g., 12/25)
Result: Success, returns saved_token_id if save_card: true
```

### Failed Payment (Deny)
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Result: Denied by bank
```

### 3DS Authentication Required
```
Card Number: 4000 0070 0000 0002
CVV: 123
Expiry: Any future date (e.g., 12/25)
Result: 3DS challenge (user must approve)
```

---

## Troubleshooting

### Issue: saved_token_id not received in webhook

**Symptoms:**
- Payment successful but no recurring subscription created
- Logs show "saved_token_id: undefined"

**Solutions:**
1. Check that "Enable Auto-Renewal" was checked
2. Check server logs for "save_card: true" in Snap API call
3. Verify webhook is receiving all fields from Midtrans
4. Check Midtrans dashboard for the transaction details

**Debug Queries:**
```sql
-- Check pending transaction
SELECT * FROM pending_midtrans_transactions WHERE order_id = 'ORDER_ID';
```

---

### Issue: Subscription not created in Midtrans

**Symptoms:**
- saved_token_id captured but no subscription in Midtrans dashboard
- Logs show error when calling Subscription API

**Solutions:**
1. Check Midtrans API credentials
2. Check subscription API request body in logs
3. Verify `saved_token_id` is valid
4. Check Midtrans dashboard for API errors

**Debug Commands:**
```bash
# Check webhook logs for:
# - "Creating Midtrans recurring subscription for user: xxx"
# - "Midtrans subscription created: {...}"
# - "Failed to create Midtrans subscription: {...}"
```

---

### Issue: User downgraded before grace period ends

**Symptoms:**
- User loses access immediately after failed payment
- Should have 3-day grace period

**Solutions:**
1. Check webhook logic for handling `deny` status
2. Verify grace period calculation
3. Check user status update logic

---

### Issue: Cancel not working

**Symptoms:**
- User clicks cancel but nothing happens
- Subscription remains active in Midtrans

**Solutions:**
1. Check `midtrans_subscription_id` is stored
2. Verify cancel API request is being made
3. Check Midtrans API response for errors
4. Verify user ID matches

**Debug Commands:**
```bash
# Check cancel API logs:
# - "Cancelling subscription: { subscriptionId: xxx, userId: xxx }"
# - "❌ Midtrans cancel error: {...}"
# - "✅ Subscription cancelled in Midtrans"
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Test Case 1: Monthly auto-renewal works (saved_token_id captured)
- ✅ Test Case 2: Lifetime subscription works (no auto-renewal)
- ✅ Test Case 3: Cancel works
- ✅ Test Case 4: Recurring payment updates renews_at
- ✅ All server logs show expected behavior
- ✅ Midtrans dashboard shows correct subscription data

---

## Next Steps After Testing

### If All Tests Pass:
1. Proceed to Phase 2: GoPay Auto-Renewal
2. Implement Phase 3: Update Payment Method
3. Implement Phase 4: Grace Period Logic
4. Implement Phase 5: Email Notifications
5. Implement Phase 6: Analytics Dashboard

### If Issues Found:
1. Document the issue in detail
2. Share server logs and error messages
3. Provide reproduction steps
4. We'll debug and fix before proceeding

---

## Contact & Support

### For Issues During Testing:
1. Check browser console for frontend errors
2. Check server terminal for backend errors
3. Check Supabase logs for database errors
4. Check Midtrans dashboard for payment errors
5. Review webhook payloads in logs

### Useful Commands:
```bash
# Watch server logs in real-time
npm run dev

# Check database directly (if psql available)
psql $DATABASE_URL -c "SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';"

# Test webhook manually (if needed)
curl -X POST http://localhost:3000/api/payment/midtrans/webhook \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test","transaction_status":"settlement",...}'
```

---

## Notes

- ⏰ **Webhook Processing:** Webhooks may take 1-30 seconds to arrive after payment
- 🔄 **Retries:** Midtrans retries failed webhooks 3 times
- 🧪 **Sandbox Only:** All testing is in sandbox environment
- 💳 **Test Cards:** Use only the provided test cards
- 📊 **Dashboard:** Always verify in Midtrans dashboard after each test
- 📝 **Logs:** Always check server logs for debugging
