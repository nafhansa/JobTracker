# Fix Summary: Empty Subscription Columns

## Issue Fixed
The `midtrans_subscription_token`, `midtrans_payment_method`, and `midtrans_account_id` columns in the `subscriptions` table were empty (NULL) after payment.

---

## Root Cause Identified

The webhook was not properly handling credit card payments:

1. **Condition Too Strict**: Webhook only processed payments if `saved_token_id` existed AND `payment_type === 'credit_card'`
2. **No Fallback**: If conditions didn't match, webhook fell through to generic handler which didn't save the required fields
3. **Missing Logging**: Hard to debug which path was being taken

---

## What Was Fixed

### 1. Webhook Logic Improved

**File:** `/src/app/api/payment/midtrans/webhook/route.ts`

**Changes:**
```typescript
// NEW: Explicit credit card handling
if (transaction_status === 'settlement' && payment_type === 'credit_card') {
  console.log('=== CREDIT CARD PAYMENT DETECTED ===');
  console.log('Has saved_token_id:', !!saved_token_id);
  console.log('Has masked_card:', !!masked_card);

  if (saved_token_id) {
    // Auto-renewal: Save all fields
    await handleFirstPaymentWithSaveCard({...});
  } else {
    // One-time: Set fields to NULL
    await handleFirstPaymentWithoutSaveCard({...});
  }
  return NextResponse.json({ status: 'OK' });
}
```

**Benefits:**
- ✅ All credit card payments are now handled explicitly
- ✅ Checks for `saved_token_id` existence
- ✅ Saves appropriate data based on payment type
- ✅ Returns early to prevent generic handler interference

### 2. New Function Added

**Function:** `handleFirstPaymentWithoutSaveCard()`

**Purpose:** Handles one-time credit card payments (no auto-renewal)

**Saves to Database:**
```javascript
{
  midtrans_subscription_token: null,
  midtrans_payment_method: 'credit_card',
  midtrans_account_id: null,
  recurring_frequency: null,
  renews_at: next_month,  // For monthly plans
  ends_at: null,           // For monthly plans
}
```

### 3. Enhanced Logging

**Added Debug Logs:**
```bash
=== CREDIT CARD PAYMENT DETECTED ===
Has saved_token_id: true/false
Has masked_card: true/false
=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ===
  OR
=== HANDLING WITHOUT SAVE CARD (ONE-TIME PAYMENT) ===
=== HANDLING FIRST PAYMENT WITH SAVE CARD ===
User ID: xxx
Saved Token ID: 526422-4659
Masked Card: 491111-1113
Upserting subscription with saved_token_id: {...}
```

### 4. Generic Handler Protection

Added explicit check to prevent duplicate processing:

```typescript
if (transaction_status === 'settlement' &&
    payment_type !== 'credit_card' &&
    payment_type !== 'recurring') {
  console.log('=== OTHER PAYMENT TYPE DETECTED ===');
  console.log('Payment type:', payment_type);
}
```

---

## How It Works Now

### Auto-Renewal Flow (Monthly Plan)
```
User subscribes to monthly plan
  ↓
Frontend: enableAutoRenew = true (automatic)
  ↓
Backend: POST /api/payment/midtrans/charge
  { enableAutoRenew: true, plan: 'monthly' }
  ↓
Backend: Check (enableAutoRenew && planType === 'monthly') → TRUE
  ↓
Backend: Set snapBody.credit_card = { save_card: true }
  ↓
Backend: Send to Midtrans Snap API
  ↓
Midtrans: Process payment with save_card: true
  ↓
Midtrans: Return success + saved_token_id
  ↓
Webhook: POST /api/payment/midtrans/webhook
  {
    transaction_status: 'settlement',
    payment_type: 'credit_card',
    saved_token_id: '526422-4659',  ← PRESENT
    masked_card: '491111-1113'          ← PRESENT
  }
  ↓
Webhook: Check (payment_type === 'credit_card') → TRUE
  ↓
Webhook: Check (saved_token_id) → TRUE
  ↓
Webhook: Call handleFirstPaymentWithSaveCard()
  ↓
Webhook: Save to database:
  - midtrans_subscription_token: '526422-4659'  ✅
  - midtrans_payment_method: 'credit_card'           ✅
  - midtrans_account_id: '491111-1113'            ✅
  - recurring_frequency: 'monthly'                    ✅
  - renews_at: next_month                           ✅
  ↓
Webhook: Call Midtrans Subscription API
  ↓
Midtrans: Create recurring subscription
  ↓
Webhook: Update midtrans_subscription_id
  ✅ DONE
```

### One-Time Payment Flow (Lifetime Plan)
```
User subscribes to lifetime plan
  ↓
Frontend: enableAutoRenew = false (or plan is lifetime)
  ↓
Backend: POST /api/payment/midtrans/charge
  { enableAutoRenew: false, plan: 'lifetime' }
  ↓
Backend: Check (enableAutoRenew && planType === 'monthly') → FALSE
  ↓
Backend: Don't set save_card: true
  ↓
Midtrans: Process payment
  ↓
Midtrans: Return success (NO saved_token_id)
  ↓
Webhook: POST /api/payment/midtrans/webhook
  {
    transaction_status: 'settlement',
    payment_type: 'credit_card',
    saved_token_id: undefined          ← NOT PRESENT
  }
  ↓
Webhook: Check (payment_type === 'credit_card') → TRUE
  ↓
Webhook: Check (saved_token_id) → FALSE
  ↓
Webhook: Call handleFirstPaymentWithoutSaveCard()
  ↓
Webhook: Save to database:
  - midtrans_subscription_token: null          ✅
  - midtrans_payment_method: 'credit_card'       ✅
  - midtrans_account_id: null                 ✅
  - recurring_frequency: null                  ✅
  - renews_at: null                          ✅
  - ends_at: null                             ✅
  ✅ DONE
```

---

## Database Schema After Fix

### After Auto-Renewal Payment:
```sql
SELECT * FROM subscriptions WHERE user_id = 'xxx';

-- Expected result:
{
  id: 'uuid',
  user_id: 'firebase_uid',
  plan: 'monthly',
  status: 'active',
  midtrans_subscription_id: 'JT-xxx-xxx',      ← Order ID
  midtrans_subscription_token: '526422-4659', ← SAVED ✅
  midtrans_payment_method: 'credit_card',           ← SAVED ✅
  midtrans_account_id: '491111-1113',            ← SAVED ✅
  recurring_frequency: 'monthly',                    ← SAVED ✅
  renews_at: '2026-04-01T12:00:00.000Z',   ← SAVED ✅
  ends_at: null,
  created_at: '2026-03-01T12:00:00.000Z',
  updated_at: '2026-03-01T12:00:00.000Z'
}
```

### After One-Time Payment:
```sql
SELECT * FROM subscriptions WHERE user_id = 'xxx';

-- Expected result:
{
  id: 'uuid',
  user_id: 'firebase_uid',
  plan: 'monthly' (or 'lifetime'),
  status: 'active',
  midtrans_subscription_id: 'JT-xxx-xxx',      ← Order ID
  midtrans_subscription_token: null,               ← NULL ✅
  midtrans_payment_method: 'credit_card',           ← SAVED ✅
  midtrans_account_id: null,                     ← NULL ✅
  recurring_frequency: null,                      ← NULL ✅
  renews_at: '2026-04-01T12:00:00.000Z',   ← For monthly ✅
  ends_at: null,
  created_at: '2026-03-01T12:00:00.000Z',
  updated_at: '2026-03-01T12:00:00.000Z'
}
```

---

## Testing Instructions

### Clean Test Database:
```sql
DELETE FROM subscriptions WHERE user_id = 'YOUR_TEST_USER_ID';
DELETE FROM pending_midtrans_transactions WHERE user_id = 'YOUR_TEST_USER_ID';
```

### Test Auto-Renewal:
```bash
# 1. Restart server
npm run dev

# 2. Go to http://localhost:3000/upgrade
# 3. Click "Subscribe" on monthly plan
# 4. Pay with: 4911 1111 1111 1113
# 5. IMMEDIATELY check server logs

# Expected logs:
✓ "=== CREDIT CARD PAYMENT DETECTED ==="
✓ "Has saved_token_id: true"
✓ "=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ==="
✓ "Upserting subscription with saved_token_id: {...}"
✓ "midtrans_subscription_token: '526422-4659'"

# 6. Check database:
SELECT midtrans_subscription_token, midtrans_payment_method, midtrans_account_id
FROM subscriptions WHERE user_id = 'YOUR_TEST_USER_ID';

# Expected: NOT NULL for all three columns
```

### Check Logs:
Watch for these specific log messages:

```bash
# SUCCESS indicators:
✓ "=== CREDIT CARD PAYMENT DETECTED ==="
✓ "Has saved_token_id: true"
✓ "=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ==="
✓ "Upserting subscription with saved_token_id: {...}"

# If you see this instead, problem still exists:
✗ "=== HANDLING WITHOUT SAVE CARD (ONE-TIME PAYMENT) ==="
```

---

## Debugging Checklist

If columns are still empty after this fix:

- [ ] Server logs show "=== CREDIT CARD PAYMENT DETECTED ==="
- [ ] Server logs show "Has saved_token_id: true"
- [ ] Server logs show "Upserting subscription with saved_token_id:"
- [ ] Database actually has the columns (run migration)
- [ ] Midtrans webhook URL is correct
- [ ] Webhook is receiving webhook calls
- [ ] Snap API request includes "save_card: true"

---

## Files Modified

1. `/src/app/api/payment/midtrans/webhook/route.ts`
   - Enhanced credit card payment handling
   - Added `handleFirstPaymentWithoutSaveCard()` function
   - Added extensive debug logging
   - Fixed early return logic

2. `/src/app/api/payment/midtrans/charge/route.ts`
   - No changes needed (already correct)

---

## Build Status

✅ Build successful
✅ No TypeScript errors
✅ Ready for testing

---

## Next Steps

1. **Restart dev server:** `npm run dev`
2. **Clear test data:** Delete from subscriptions table
3. **Test monthly plan:** Subscribe and check logs
4. **Verify database:** Check columns are populated
5. **Report results:** Let us know if it works or if issues persist

---

## Documentation Files

- `DEBUG_EMPTY_COLUMNS.md` - Detailed debugging guide
- `FIX_SUMMARY.md` - This file
- `MIDTRANS_AUTO_RENEWAL_IMPLEMENTATION.md` - Full implementation
- `MIDTRANS_AUTO_RENEWAL_TESTING_CHECKLIST.md` - Testing guide

---

## Support

If still having issues after this fix:

1. Check server logs for the messages listed above
2. Follow `DEBUG_EMPTY_COLUMNS.md` for detailed debugging steps
3. Verify database columns exist by running migration
4. Check Midtrans dashboard for transaction details
5. Share logs and database state with us

Good luck! 🚀
