# Quick Stripe Setup Guide

Follow these steps to get your Stripe integration working:

## Step 1: Get Stripe API Keys (5 minutes)

1. **Sign up/Login** to [Stripe](https://dashboard.stripe.com)

2. **Get Test Keys** (for development):
   - Go to [Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
   - Click "Create restricted key" OR use the existing test keys
   - Copy **Publishable key** (starts with `pk_test_`)
   - Click "Reveal test key" and copy **Secret key** (starts with `sk_test_`)

## Step 2: Create Products & Prices (5 minutes)

1. Go to [Products](https://dashboard.stripe.com/test/products)

2. **Create Pro Plan:**
   - Click **+ Add product**
   - Name: `Rydeon Pro`
   - Description: `Advanced features for growing businesses`
   - Price: `9.99 GBP`, Recurring: `Monthly`
   - Click **Save** and copy the **Price ID** (starts with `price_`)

3. **Create Business Plan:**
   - Click **+ Add product**
   - Name: `Rydeon Business`
   - Description: `Complete solution for fleets and teams`
   - Price: `29.99 GBP`, Recurring: `Monthly`
   - Click **Save** and copy the **Price ID**

## Step 3: Setup Webhook (5 minutes)

### For Local Development (Stripe CLI):

**Windows PowerShell:**
```powershell
# Install Stripe CLI (if not installed)
scoop install stripe
# OR download from: https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a **webhook signing secret** (starts with `whsec_`). Copy it!

### For Production (Vercel):

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **+ Add endpoint**
3. Endpoint URL: `https://rydeon-dashboard.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed` and `invoice.payment_succeeded`
5. Click **Add endpoint** and copy the **Signing secret**

## Step 4: Update .env.local

Open `.env.local` and add these lines:

```bash
# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Price IDs from Step 2
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_YOUR_PRO_ID
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_YOUR_BUSINESS_ID

# App URL (local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Test Locally

1. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Test checkout:**
   - Go to `http://localhost:3000/pro`
   - Click **Upgrade** on Pro plan
   - Use test card: `4242 4242 4242 4242`, any future date, any CVC

3. **Verify success:**
   - Should redirect back with success message
   - Check your Stripe Dashboard for the test payment

## Step 6: Deploy to Production

### Add Environment Variables to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `rydeon-dashboard` project
3. Go to **Settings → Environment Variables**
4. Add all the Stripe variables (same as `.env.local`)
5. **Important:** Update `NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app`

### Redeploy:

```bash
git add .
git commit -m "feat: add Stripe subscription integration"
git push
```

Vercel will automatically redeploy with the new environment variables.

## Test Cards Reference

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0027 6000 3184` | 🔐 Requires authentication |

[More test cards](https://stripe.com/docs/testing#cards)

## Troubleshooting

### "Stripe is not configured yet"
- Check that all env vars are set
- Restart dev server after adding env vars
- Ensure no typos in keys

### "Invalid request: No such price"
- Verify Price IDs are correct
- Make sure you're using TEST price IDs for TEST keys
- Price IDs should start with `price_`

### Webhook not working
- For local: Make sure `stripe listen` is running
- For production: Check webhook URL is correct
- Verify webhook secret matches

## Going Live

When ready for production:

1. Switch to **Live Mode** in Stripe Dashboard
2. Create products/prices in Live Mode
3. Get Live API keys (starts with `pk_live_` and `sk_live_`)
4. Update Vercel environment variables with live keys
5. Test with real card before announcing

---

**Quick Links:**
- [Stripe Dashboard](https://dashboard.stripe.com)
- [API Keys](https://dashboard.stripe.com/test/apikeys)
- [Products](https://dashboard.stripe.com/test/products)
- [Webhooks](https://dashboard.stripe.com/test/webhooks)
- [Test Cards](https://stripe.com/docs/testing#cards)
