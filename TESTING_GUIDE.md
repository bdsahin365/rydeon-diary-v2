# Testing Your Stripe Subscription Flow 🧪

## Quick Test (5 minutes)

### 1. Setup Webhook Forwarding

Open a new terminal and run:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copy the webhook secret** from the output and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Restart Dev Server

```bash
# In your main terminal (Ctrl+C to stop)
npm run dev
```

### 3. Test the Upgrade Flow

**Step 1:** Visit `http://localhost:3000/pro`

**Step 2:** You should see:
- ✅ Free plan with "Current Plan" button (disabled)
- ✅ Pro and Business plans with "Upgrade" buttons

**Step 3:** Click **"Upgrade"** on Pro plan

**Step 4:** On Stripe checkout page, use test card:
```
Card:   4242 4242 4242 4242
Expiry: 12/34
CVC:    123
ZIP:    12345
Email:  test@example.com
```

**Step 5:** Complete payment

**Step 6:** Verify Success:
- ✅ Redirected back to `/pro?success=true`
- ✅ Success toast message appears
- ✅ Pro plan now shows "Current Plan" (disabled)
- ✅ Free plan shows "Upgrade" (if you want to downgrade)

### 4. Verify in Sidebar

**Check:** Sidebar should show:
- ✅ "Pro Plan" badge with crown icon
- ✅ "Manage" link to go to `/pro`

### 5. Verify in Database

Check that user plan was updated:

```javascript
// In MongoDB Compass or CLI
db.users.findOne({ email: "your-email@example.com" })

// Should show:
{
  plan: "pro",
  stripeSubscriptionId: "sub_...",
  stripeCustomerId: "cus_...",
  ...
}
```

---

## Webhook Events to Monitor

In the terminal running `stripe listen`, you should see:

```
✓ checkout.session.completed [evt_...]
  → User plan updated to 'pro'
```

---

## Test Scenarios

### ✅ Scenario 1: Free → Pro Upgrade
1. Start as Free user
2. Upgrade to Pro
3. Verify plan changed
4. Check unlimited jobs access

### ✅ Scenario 2: Pro → Business Upgrade  
1. Already on Pro
2. Upgrade to Business
3. Verify plan changed
4. Checknew features unlocked

### ✅ Scenario 3: Payment Failure
1. Use declined card: `4000 0000 0000 0002`
2. Verify error message shown
3. Verify plan NOT changed

### ✅ Scenario 4: Subscription Cancellation
```powershell
# Trigger webhook event
stripe trigger customer.subscription.deleted
```

---

## Common Issues & Fixes

### ❌ "Failed to create checkout session"
**Fix:** Check `.env.local` has correct Price IDs (start with `price_`)

### ❌ "Invalid request: No such price"
**Fix:** Verify Price IDs exist in Stripe Dashboard

### ❌ Webhook not receiving events
**Fix:** Ensure `stripe listen` is running

### ❌ Plan not updating after payment
**Fix:** Check webhook terminal for errors

### ❌ "Stripe is not configured yet"
**Fix:** Restart dev server after adding env vars

---

## Vercel Deployment Testing

### 1. Add Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_...
NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app
```

### 2. Add Production Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **+ Add endpoint**
3. URL: `https://rydeon-dashboard.vercel.app/api/stripe/webhook`
4. Events: `checkout.session.completed`, `invoice.payment_succeeded`
5. Copy webhook secret and update in Vercel

### 3. Deploy

```bash
git add .
git commit -m "feat: complete subscription system"
git push
```

### 4. Test on Production

1. Visit `https://rydeon-dashboard.vercel.app/pro`
2. Complete test upgrade
3. Verify webhook received in Stripe Dashboard
4. Check user plan updated

---

## Feature Access Testing

After upgrading, verify features work:

### Pro Features:
- [ ] Unlimited job entries
- [ ] Advanced analytics (if implemented)
- [ ] Priority support badge
- [ ] Data export (if implemented)

### Business Features:
- [ ] All Pro features
- [ ] Team management (if implemented)
- [ ] API access (if implemented)

---

## Success Checklist

- [ ] Can upgrade from Free to Pro
- [ ] Can upgrade from Pro to Business
- [ ] Plan badge shows correct plan
- [ ] "Current Plan" button disabled
- [ ] Webhook updates plan in database
- [ ] Job limit lifted after upgrade
- [ ] Success toast shown after payment
- [ ] Can access Pro/Business features
- [ ] Works on production (Vercel)

---

## Going Live (When Ready)

1. **Switch to Live Mode** in Stripe
2. Create products in **Live Mode**
3. Get **Live API keys**
4. Update Vercel with live keys
5. Test with **real card** (small amount)
6. Monitor closely for 24-48 hours
7. ✅ **Launch!**

---

**Need Help?**
- Check server logs for errors
- Review Stripe Dashboard webhook logs
- Check browser console for client errors
