# Midtrans Recurring Implementation Checklist

Use this checklist to track implementation progress.

## Phase 1: Database Migrations (Day 1)

- [ ] Review migration script: `migrations/midtrans_recurring_migrations.sql`
- [ ] Backup production database
- [ ] Run Migration 1 in staging: `ALTER TABLE subscriptions ADD COLUMN...`
- [ ] Run Migration 2 in staging: `ALTER TABLE pending_midtrans_transactions ADD COLUMN...`
- [ ] Verify columns added in staging
- [ ] Test existing functionality in staging
- [ ] Run Migration 1 in production
- [ ] Run Migration 2 in production
- [ ] Verify columns added in production

**Files Modified:**
- `migrations/midtrans_recurring_migrations.sql` (NEW)

---

## Phase 2: Backend API - Charge Route (Day 2)

- [ ] Read current implementation: `/src/app/api/payment/midtrans/charge/route.ts`
- [ ] Add `paymentMethod` parameter to `ChargeRequest` interface
- [ ] Implement `createSubscription()` function
- [ ] Branch logic: `if (paymentMethod) { createSubscription() } else { createSnapTransaction() }`
- [ ] Store `payment_method` and `is_recurring` in database
- [ ] Add currency validation: recurring only supports IDR
- [ ] Add error handling for Midtrans Subscription API
- [ ] Test locally with curl/Postman
- [ ] Deploy to staging
- [ ] Test one-time payment still works
- [ ] Test recurring payment creation
- [ ] Deploy to production

**Files Modified:**
- `/src/app/api/payment/midtrans/charge/route.ts`

---

## Phase 3: Backend API - Webhook Route (Day 2-3)

- [ ] Read current implementation: `/src/app/api/payment/midtrans/webhook/route.ts`
- [ ] Add `payment_type` and `subscription_id` to webhook body parsing
- [ ] Implement `handleRecurringPayment()` function
- [ ] Implement `handleSubscriptionCancellation()` function
- [ ] Add branch for `payment_type === 'recurring'`
- [ ] Add branch for `event === 'subscription.cancelled'`
- [ ] Update `renews_at` to next month on recurring payment
- [ ] Revert user to free on subscription cancelled
- [ ] Add logging for debugging
- [ ] Test webhook locally (use ngrok)
- [ ] Test with Midtrans sandbox
- [ ] Deploy to staging
- [ ] Monitor webhook delivery logs
- [ ] Deploy to production

**Files Modified:**
- `/src/app/api/payment/midtrans/webhook/route.ts`

---

## Phase 4: Backend API - Cancel Route (Day 2-3)

- [ ] Read current implementation: `/src/app/api/subscription/cancel/route.ts`
- [ ] Update default provider to "midtrans"
- [ ] Add Midtrans cancellation logic after Paddle logic
- [ ] Fetch subscription from Supabase using `midtrans_subscription_id`
- [ ] Verify subscription ownership
- [ ] Call Midtrans Cancel API: `POST /v1/subscriptions/{token}/cancel`
- [ ] Update Supabase: status='cancelled', ends_at=renews_at
- [ ] Revert user to free plan
- [ ] Handle case where `midtrans_subscription_token` is null
- [ ] Add error handling for Midtrans API failures
- [ ] Test locally
- [ ] Test in staging with sandbox
- [ ] Deploy to production

**Files Modified:**
- `/src/app/api/subscription/cancel/route.ts`

---

## Phase 5: Frontend - Upgrade Page (Day 3-4)

- [ ] Read current implementation: `/src/app/upgrade/page.tsx`
- [ ] Add state: `const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'gopay_tokenization'>('credit_card')`
- [ ] Add payment method selector UI (Credit Card vs GoPay)
- [ ] Show selector ONLY for:
  - Indonesian users (`isIndonesia === true`)
  - Monthly plan (`planType === 'monthly'`)
  - Not free plan (`!isFree`)
  - Not lifetime plan (`!isLifetime`)
- [ ] Add auto-renew badge text
- [ ] Update `handleSubscribe()` to pass `paymentMethod`
- [ ] Branch logic: recurring vs one-time based on `isIndonesia` and `planType`
- [ ] Force IDR currency for recurring
- [ ] Update button text to show payment method
- [ ] Test payment method selection
- [ ] Test API call with `paymentMethod`
- [ ] Test redirect to Midtrans authorization
- [ ] Test in development environment
- [ ] Deploy to staging
- [ ] Test full flow in staging
- [ ] Deploy to production

**Files Modified:**
- `/src/app/upgrade/page.tsx`

---

## Phase 6: Frontend - Billing Page (Day 3-4)

- [ ] Read current implementation: `/src/app/dashboard/billing/page.tsx`
- [ ] Display payment method for recurring subscriptions
- [ ] Show "Auto-Renew Active" badge
- [ ] Update cancel button text: "Cancel Auto-Renew Subscription"
- [ ] Update cancel dialog message
- [ ] Ensure `provider: 'midtrans'` is passed to cancel API
- [ ] Test payment method display
- [ ] Test cancel button for recurring subscriptions
- [ ] Test cancel button for one-time subscriptions
- [ ] Test in development environment
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production

**Files Modified:**
- `/src/app/dashboard/billing/page.tsx`

---

## Phase 7: Environment Variables (Day 4)

- [ ] Add to `.env.local`:
  ```bash
  MIDTRANS_SUBSCRIPTION_ENABLED=true
  ```
- [ ] Verify existing variables:
  - `MIDTRANS_SERVER_KEY`
  - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
  - `MIDTRANS_IS_PRODUCTION`
- [ ] Add to production environment variables
- [ ] Restart application to load new env vars

---

## Phase 8: Midtrans Dashboard Setup (Day 4)

- [ ] Login to [Midtrans Dashboard](https://dashboard.midtrans.com)
- [ ] Navigate to Settings → Payment Features
- [ ] Enable Subscription feature
- [ ] Configure webhook URL: `https://your-domain.com/api/payment/midtrans/webhook`
- [ ] Verify webhook receives:
  - `payment.notification`
  - `payment.recurring`
  - `subscription.cancelled`
  - `subscription.expired`
- [ ] Test webhook delivery
- [ ] Check Sandbox credentials are correct

---

## Phase 9: Testing & Validation (Day 5-7)

### Integration Tests (Sandbox)

- [ ] **Test 1: Create Recurring Subscription (Credit Card)**
  - [ ] Go to `/upgrade` page
  - [ ] Select "Monthly Pro" plan
  - [ ] Select "Kartu Kredit/Debit" payment method
  - [ ] Click "Subscribe with Auto-Renew (Card)"
  - [ ] Verify redirect to Midtrans authorization page
  - [ ] Authorize card with test card
  - [ ] Verify first payment succeeds
  - [ ] Check Supabase: subscription created with `midtrans_subscription_token`
  - [ ] Check Supabase: `renews_at` set to next month
  - [ ] Check user marked as Pro

- [ ] **Test 2: Create Recurring Subscription (GoPay)**
  - [ ] Same as Test 1 but select "GoPay" payment method
  - [ ] Verify redirect to GoPay authorization
  - [ ] Verify first payment succeeds

- [ ] **Test 3: Recurring Payment (Simulated)**
  - [ ] Simulate Midtrans webhook `payment.recurring`
  - [ ] Verify `renews_at` updated to next month
  - [ ] Verify user remains Pro
  - [ ] Check logs show "Subscription renewed successfully"

- [ ] **Test 4: Cancel Subscription**
  - [ ] Go to `/dashboard/billing` page
  - [ ] Click "Cancel Auto-Renew Subscription"
  - [ ] Confirm cancel
  - [ ] Verify Midtrans Cancel API called
  - [ ] Verify Supabase status = "cancelled"
  - [ ] Verify `ends_at` = previous `renews_at`
  - [ ] Verify user reverted to free

- [ ] **Test 5: One-Time Payment (Backward Compatibility)**
  - [ ] Go to `/upgrade` page
  - [ ] Select "Lifetime Pro" plan (no recurring)
  - [ ] Click "Pay Now"
  - [ ] Verify existing Snap flow works
  - [ ] Verify payment succeeds
  - [ ] Verify user marked as Pro

### Regression Tests

- [ ] Verify all existing features still work
- [ ] Verify no breaking changes to database
- [ ] Verify error handling works correctly
- [ ] Verify webhook retries on failure

---

## Phase 10: Monitoring & Support (Day 5-7)

- [ ] Set up monitoring for webhook delivery
- [ ] Monitor subscription creation rate
- [ ] Monitor payment failure rate
- [ ] Check error logs regularly
- [ ] Collect user feedback
- [ ] Document common issues
- [ ] Create FAQ for support team
- [ ] Train support team on new flow

---

## Deployment Commands

### Database Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manual: Copy SQL from migrations/midtrans_recurring_migrations.sql
# and run in Supabase SQL Editor
```

### Backend Deployment

```bash
# Deploy to production
git add .
git commit -m "feat: Add Midtrans recurring subscription support"
git push origin main
```

### Frontend Deployment

```bash
# Build and deploy
npm run build
# Then deploy to your hosting (Vercel, Netlify, etc.)
```

---

## Rollback Procedure

If issues are detected:

1. **Frontend Only:** Revert `/app/upgrade/page.tsx` and `/app/dashboard/billing/page.tsx`
2. **Backend API:** Revert API changes to `/api/payment/midtrans/charge/route.ts`, `/api/payment/midtrans/webhook/route.ts`, `/api/subscription/cancel/route.ts`
3. **Database:** No rollback needed (schema changes are backward compatible)
4. **Midtrans:** Disable subscription in dashboard

---

## Success Criteria

- [ ] All database migrations completed
- [ ] All API changes deployed and tested
- [ ] All frontend changes deployed and tested
- [ ] Full sandbox integration test passed
- [ ] Production deployment successful
- [ ] Monitoring active for 3 days
- [ ] Zero critical bugs reported
- [ ] User adoption rate tracked
- [ ] Support team trained

---

## Notes

- Test thoroughly in sandbox before production
- Monitor webhook delivery for first few days
- Collect user feedback and iterate
- Document any edge cases encountered
- Keep rollback plan ready

---

**Checklist Version:** 1.0
**Created:** 2026-02-25
