# Stripe Setup Guide for Rydeon Pro

This guide will help you set up Stripe for your Rydeon Pro subscription feature.

## Prerequisites

- A Stripe account (sign up at [stripe.com](https://stripe.com))
- Access to your Stripe Dashboard

## Step 1: Create Products and Prices

### 1.1 Navigate to Products

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Products** in the left sidebar
3. Click **+ Add product**

### 1.2 Create Pro Plan

**Product Details:**
- **Name**: Rydeon Pro
- **Description**: Advanced features for growing businesses
- **Pricing Model**: Standard pricing
- **Price**: £9.99 GBP
- **Billing period**: Recurring - Monthly

Click **Save product** and copy the **Price ID** (starts with `price_...`)

### 1.3 Create Business Plan

**Product Details:**
- **Name**: Rydeon Business
- **Description**: Complete solution for fleets and teams
- **Pricing Model**: Standard pricing
- **Price**: £29.99 GBP
- **Billing period**: Recurring - Monthly

Click **Save product** and copy the **Price ID** (starts with `price_...`)

---

## Step 2: Get Your API Keys

### 2.1 Navigate to Developers Section

1. In the Stripe Dashboard, click **Developers** in the top right
2. Click **API keys** in the left sidebar

### 2.2 Copy Your Keys

You'll see two types of keys:

**Test Mode** (for development):
- **Publishable key**: Starts with `pk_test_...`
- **Secret key**: Starts with `sk_test_...` (click "Reveal test key")

**Live Mode** (for production - use later):
- **Publishable key**: Starts with `pk_live_...`
- **Secret key**: Starts with `sk_live_...`

> [!CAUTION]
> **Never commit your Secret Key to version control!** Keep it in `.env.local` which is gitignored.

---

## Step 3: Set Up Webhook Endpoint

Webhooks notify your application when subscription events occur (e.g., successful payment).

### 3.1 Add Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**

**For Local Development:**
- **Endpoint URL**: `http://localhost:3000/api/stripe/webhook`
- You'll need to use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing

**For Production:**
- **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`

### 3.2 Select Events to Listen

Select these events:
- `checkout.session.completed`
- `invoice.payment_succeeded`

Click **Add endpoint**

### 3.3 Copy Webhook Secret

After creating the endpoint, click on it to view details.

Copy the **Signing secret** (starts with `whsec_...`)

---

## Step 4: Configure Environment Variables

Open your `.env.local` file and add the following:

```bash
# Stripe Configuration (TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_YOUR_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_YOUR_BUSINESS_PRICE_ID

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the placeholders with your actual values from Steps 1-3.

---

## Step 5: Test Your Integration

### 5.1 Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 5.2 Test the Checkout Flow

1. Navigate to `http://localhost:3000/pro`
2. Click **Upgrade** on the Pro plan
3. You should be redirected to Stripe Checkout

### 5.3 Use Test Card

Use Stripe's test cards to complete payment:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0027 6000 3184`

[Full list of test cards](https://stripe.com/docs/testing#cards)

### 5.4 Verify Success

After successful payment, you should:
- Be redirected back to `/pro?success=true`
- See a success toast message
- Have your user plan updated in the database

---

## Step 6: Local Webhook Testing (Optional)

To test webhooks locally, use the Stripe CLI:

### 6.1 Install Stripe CLI

**Windows:**
```bash
scoop install stripe
```

Or download from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases)

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

### 6.2 Login to Stripe

```bash
stripe login
```

### 6.3 Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret. Copy it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 6.4 Trigger Test Events

In another terminal:
```bash
stripe trigger checkout.session.completed
```

---

## Step 7: Production Deployment

When ready to go live:

1. **Switch to Live Mode** in Stripe Dashboard
2. Create products/prices in Live Mode (repeat Step 1)
3. Get Live API keys (Step 2)
4. Create webhook for production URL (Step 3)
5. Update `.env.local` (or Vercel environment variables) with live keys
6. **Test thoroughly** before announcing to users

> [!WARNING]
> Live mode processes real payments. Always test in Test Mode first!

---

## Troubleshooting

### "Failed to create checkout session"

**Check:**
- All environment variables are set correctly
- No typos in API keys
- Using correct Price IDs from your Stripe dashboard
- Dev server was restarted after adding env vars

### Webhook not receiving events

**Check:**
- Webhook endpoint URL is correct
- Selected the right events (`checkout.session.completed`, `invoice.payment_succeeded`)
- Using Stripe CLI for local development
- Webhook secret matches the one in `.env.local`

### User plan not updating

**Check:**
- Webhook is receiving events (check server logs)
- Database connection is working
- User ID is being passed correctly in metadata

---

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe API Reference](https://stripe.com/docs/api)

---

## Security Best Practices

1. ✅ Never commit `.env.local` to version control
2. ✅ Always validate webhook signatures
3. ✅ Use environment variables for all keys
4. ✅ Test thoroughly in Test Mode before going live
5. ✅ Monitor your Stripe Dashboard for unusual activity
