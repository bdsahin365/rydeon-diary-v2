# Complete Your Stripe Setup - 5 More Minutes! 🚀

Your Stripe API keys are now configured! You just need to:

1. Create 2 products (Pro & Business)
2. Get their Price IDs
3. Set up webhook (optional for local testing)

---

## Step 1: Create Stripe Products (3 minutes)

### Open Stripe Dashboard
👉 [Create Pro Plan](https://dashboard.stripe.com/test/products/create)

### Pro Plan
1. **Name**: `Rydeon Pro`
2. **Description**: `Advanced features for growing businesses`
3. **Pricing**:
   - **Price**: `9.99`
   - **Currency**: `GBP`
   - **Billing period**: `Recurring` → `Monthly`
4. Click **Add product**
5. **Copy the Price ID** (starts with `price_`)

### Business Plan
👉 [Create Business Plan](https://dashboard.stripe.com/test/products/create)

1. **Name**: `Rydeon Business`
2. **Description**: `Complete solution for fleets and teams`
3. **Pricing**:
   - **Price**: `29.99`
   - **Currency**: `GBP`
   - **Billing period**: `Recurring` → `Monthly`
4. Click **Add product**
5. **Copy the Price ID**

---

## Step 2: Add Price IDs to .env.local

Add these two lines to your `.env.local` file:

```bash
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_YOUR_PRO_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_YOUR_BUSINESS_ID_HERE
```

**Quick method:** Run this command and paste your Price IDs:

```powershell
Write-Host "Enter Pro Price ID:" -ForegroundColor Yellow
$proPriceId = Read-Host
Write-Host "Enter Business Price ID:" -ForegroundColor Yellow
$businessPriceId = Read-Host

@"

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO=$proPriceId
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=$businessPriceId
"@ | Add-Content .env.local

Write-Host "✅ Price IDs added!" -ForegroundColor Green
```

---

## Step 3: Webhook Setup (Optional - for local testing)

### Option A: Stripe CLI (Recommended for local)

```powershell
# Install Stripe CLI
scoop install stripe

# Login
stripe login

# Forward webhooks (keep this running)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret from the output and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Option B: Skip for Now
You can test the checkout flow without webhooks. The subscription will be created, but the user won't be upgraded automatically. Set up webhooks later when deploying to production.

---

## Step 4: Test It! 🎉

1. **Restart your dev server:**
   ```bash
   # Press Ctrl+C in your terminal
   npm run dev
   ```

2. **Navigate to the Pro page:**
   ```
   http://localhost:3000/pro
   ```

3. **Click "Upgrade" on Pro plan**

4. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

5. **Verify:**
   - ✅ Should redirect to Stripe checkout
   - ✅ Complete payment
   - ✅ Redirect back with success message

---

## Quick Checklist

- [x] Stripe API keys added to .env.local
- [x] App URL configured
- [ ] Pro product created in Stripe
- [ ] Business product created in Stripe
- [ ] Price IDs added to .env.local
- [ ] Webhook configured (optional)
- [ ] Dev server restarted
- [ ] Checkout tested with test card

---

## Need Help?

**Can't find Price IDs?**
- Go to [Products](https://dashboard.stripe.com/test/products)
- Click on your product
- Price ID is under "Pricing" section

**Checkout not working?**
1. Check browser console for errors
2. Verify Price IDs start with `price_`
3. Ensure dev server was restarted
4. Check `.env.local` has all required vars

**Still stuck?**
Check the detailed guide: [STRIPE_SETUP.md](./STRIPE_SETUP.md)

---

## What's Next?

Once testing works locally, you'll need to:

1. **Add env vars to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Settings → Environment Variables
   - Add all Stripe variables
   - Set `NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app`

2. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: complete Stripe integration"
   git push
   ```

You're almost there! 🚀
