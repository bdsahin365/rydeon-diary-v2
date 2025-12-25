# Configure Production Webhook for Stripe

## Quick Setup (2 minutes)

### Step 1: Add Webhook Endpoint in Stripe

1. **Go to Stripe Dashboard:**
   👉 [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)

2. **Click "+ Add endpoint"**

3. **Enter Endpoint URL:**
   ```
   https://rydeon-dashboard.vercel.app/api/stripe/webhook
   ```

4. **Select Events to Listen:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.deleted` (optional - for cancellations)
   - ✅ `customer.subscription.updated` (optional - for plan changes)

5. **Click "Add endpoint"**

### Step 2: Copy Webhook Signing Secret

After creating the endpoint, you'll see:
- **Signing secret**: `whsec_...`

**Copy this secret!**

### Step 3: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   👉 [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Select your project:** `rydeon-dashboard`

3. **Go to Settings → Environment Variables**

4. **Add new variable:**
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (paste the secret from Step 2)
   - **Environment**: Production (and Preview if testing)

5. **Click "Save"**

### Step 4: Redeploy

Vercel needs to rebuild with the new environment variable:

**Option A: Automatic (if you have new commits)**
```bash
git commit --allow-empty -m "chore: trigger redeploy for webhook secret"
git push
```

**Option B: Manual**
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "..." → "Redeploy"

---

## Testing Production Webhook

### 1. Test a Real Subscription

1. Visit `https://rydeon-dashboard.vercel.app/pro`
2. Click "Upgrade" on Pro plan
3. Use test card: `4242 4242 4242 4242`
4. Complete payment

### 2. Verify Webhook Received

1. Go back to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your endpoint
3. Check "Events" tab
4. You should see:
   - ✅ `checkout.session.completed` event
   - ✅ Status: "Succeeded" (green)

### 3. Verify Database Updated

Check your MongoDB database:
```javascript
db.users.findOne({ email: "your-test-email@example.com" })

// Should show:
{
  plan: "pro",
  stripeSubscriptionId: "sub_...",
  ...
}
```

---

## Troubleshooting

### ❌ Webhook shows "Failed" status

**Check:**
1. Endpoint URL is correct (no typos)
2. Webhook secret is added to Vercel
3. App was redeployed after adding secret
4. Check Vercel function logs for errors

### ❌ Plan not updating after payment

**Check:**
1. Webhook secret matches between Stripe and Vercel
2. User ID is being passed in metadata
3. MongoDB connection is working in production

### ❌ "Webhook signature verification failed"

**Fix:**
- Webhook secret in Vercel doesn't match Stripe
- Redeploy after adding correct secret

---

## Complete Environment Variables Checklist

Make sure ALL these are in Vercel:

```bash
# Required
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_auth_secret
OPENAI_API_KEY=your_openai_key

# Stripe (TEST MODE for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1SiDL5EgDcFCzWHF9SF5T0M1
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_1SiDN3EgDcFCzWHFvgMFlI8m
NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app
```

---

## Going Live (Switch to Production Mode)

When ready to accept real payments:

### 1. Create Products in Stripe LIVE Mode

Switch to Live Mode in Stripe Dashboard and create products

### 2. Update Environment Variables

Replace test keys with live keys in Vercel:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_live_...
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_live_...
```

### 3. Add Live Webhook

1. Create new webhook in LIVE mode
2. Same URL: `https://rydeon-dashboard.vercel.app/api/stripe/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` with live secret

### 4. Test with Small Amount

Use a real card with small amount first to verify everything works!

---

## Quick Reference

**Webhook URL:**
```
https://rydeon-dashboard.vercel.app/api/stripe/webhook
```

**Events to Subscribe:**
- `checkout.session.completed`
- `invoice.payment_succeeded`

**Stripe Dashboard:**
- [Test Webhooks](https://dashboard.stripe.com/test/webhooks)
- [Live Webhooks](https://dashboard.stripe.com/webhooks)

**Vercel Dashboard:**
- [Environment Variables](https://vercel.com/dashboard) → Your Project → Settings
