# Debugging Vercel Deployment & Webhook Issues 🔍

## Quick Diagnostic Steps

### Step 1: Check Vercel Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `rydeon-dashboard` project
3. Click on the latest deployment
4. Look for any build errors or runtime errors

**What to check:**
- ✅ Build completed successfully?
- ✅ Any error messages in the logs?

---

### Step 2: Verify Environment Variables

Go to: Vercel Dashboard → Your Project → **Settings → Environment Variables**

**Required variables checklist:**

```bash
# Database & Auth
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=... 
OPENAI_API_KEY=sk-proj-...

# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Si7LnEgDcFCzWHF...
STRIPE_SECRET_KEY=sk_test_51Si7LnEgDcFCzWHF...
STRIPE_WEBHOOK_SECRET=whsec_9S3tKEB2XqkzdfbT8IJjuNix3A30wOPa

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1SiDL5EgDcFCzWHF9SF5T0M1
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_1SiDN3EgDcFCzWHFvgMFlI8m

# App URL
NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app
```

**Important:**
- ⚠️ Variables starting with `NEXT_PUBLIC_` must be added to **ALL environments** (Production, Preview, Development)
- ⚠️ After adding variables, you MUST redeploy

---

### Step 3: Check Stripe Webhook Logs

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your endpoint (`https://rydeon-dashboard.vercel.app/api/stripe/webhook`)
3. Check the "Events" tab

**Look for:**
- ✅ Recent events delivered
- ❌ Failed events (with error messages)
- ⚠️ Response codes (should be 200)

**Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Webhook secret mismatch | Update `STRIPE_WEBHOOK_SECRET` in Vercel |
| `500 Internal Error` | Code error in webhook handler | Check Vercel function logs |
| `Timeout` | Function taking too long | Check MongoDB connection |
| `Invalid signature` | Wrong webhook secret | Verify secret matches Stripe |

---

### Step 4: Test the Webhook Endpoint

Try accessing the webhook URL directly:

```bash
curl https://rydeon-dashboard.vercel.app/api/stripe/webhook
```

**Expected:** Should return an error (since it expects POST with signature)
**Bad:** 404 or deployment error

---

### Step 5: Check Vercel Function Logs

1. Vercel Dashboard → Your Project → **Deployments**
2. Click latest deployment
3. Go to **Functions** tab
4. Click on `/api/stripe/webhook`
5. Check logs for errors

**Look for:**
- Database connection errors
- Stripe API errors
- Missing environment variables

---

## Common Issues & Solutions

### Issue 1: "Stripe is not configured"

**Cause:** Environment variables not set or not deployed

**Fix:**
1. Add all Stripe variables to Vercel
2. Make sure they're in the **Production** environment
3. Redeploy:
   ```bash
   git commit --allow-empty -m "chore: redeploy"
   git push
   ```

---

### Issue 2: "Invalid request: No such price"

**Cause:** Price IDs are wrong or from different Stripe mode

**Fix:**
1. Verify Price IDs in [Stripe Products](https://dashboard.stripe.com/test/products)
2. Make sure you're using TEST price IDs with TEST keys
3. Update in Vercel and redeploy

---

### Issue 3: Webhook Events Failing

**Cause:** Webhook secret mismatch or code error

**Fix:**
1. Copy webhook secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Redeploy
4. Test again

---

### Issue 4: Plan Not Updating After Payment

**Cause:** Webhook not receiving events or failing

**Fix:**
1. Check webhook logs in Stripe Dashboard
2. Verify webhook endpoint is responding
3. Check Vercel function logs for errors
4. Ensure user ID is in checkout session metadata

---

### Issue 5: TypeError or Undefined Errors

**Cause:** Missing environment variables

**Fix:**
1. Check all `NEXT_PUBLIC_` vars are in Vercel
2. Redeploy after adding
3. Clear browser cache

---

## Manual Testing Steps

### Test 1: Check /pro Page Loads

```
Visit: https://rydeon-dashboard.vercel.app/pro
```

**Expected:** 
- ✅ Page loads
- ✅ Shows Free, Pro, Business plans
- ✅ Buttons enabled (except current plan)

**If fails:** Check browser console for errors

---

### Test 2: Test Checkout Flow

1. Click "Upgrade" on Pro plan
2. Should redirect to Stripe
3. Use test card: `4242 4242 4242 4242`
4. Complete payment

**Expected:**
- ✅ Redirects to Stripe checkout
- ✅ After payment, redirects back
- ✅ Shows success message

**If fails:** Check browser network tab for API errors

---

### Test 3: Verify Webhook Received

After completing payment:

1. Go to Stripe Dashboard → Webhooks → Your Endpoint
2. Check "Events" tab
3. Should see `checkout.session.completed`

**Expected:**
- ✅ Event status: Succeeded (green)
- ✅ Response code: 200

**If fails:** Check error message and Vercel logs

---

## Debug Commands

### Check if endpoint is accessible:

```bash
curl -X POST https://rydeon-dashboard.vercel.app/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

### View Vercel deployment details:

```bash
vercel inspect https://rydeon-dashboard.vercel.app
```

---

## Emergency Rollback

If issues persist:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

## Need Help?

**Share these details:**
1. Screenshot of Vercel deployment error (if any)
2. Screenshot of Stripe webhook error (if any)
3. Browser console errors (F12 → Console)
4. What step fails (page load, checkout, webhook)

I can help debug with specific error messages!
