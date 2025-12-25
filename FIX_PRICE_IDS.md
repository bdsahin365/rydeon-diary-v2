# 🚨 URGENT: Get Your Price IDs (Not Product IDs!)

## The Problem

Your `.env.local` has **Product IDs** (starting with `prod_`) but Stripe needs **Price IDs** (starting with `price_`).

```diff
❌ WRONG:
- NEXT_PUBLIC_STRIPE_PRICE_PRO=prod_TfYRQ8nEh6A1vX
- NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=prod_TfYUR551zlJlpRc

✅ CORRECT:
+ NEXT_PUBLIC_STRIPE_PRICE_PRO=price_abc123...
+ NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_xyz789...
```

---

## 📋 How to Find Your Price IDs (2 minutes)

### Step 1: Open Your Products
👉 **[Open Stripe Products](https://dashboard.stripe.com/test/products)**

### Step 2: Click on "Rydeon Pro" Product

### Step 3: Find the Price ID
Under the **"Pricing"** section, you'll see:
- **Price**: £9.99 / month
- **ID**: `price_...` ← **THIS is what you need!**

Copy that ID (starts with `price_`)

### Step 4: Repeat for "Rydeon Business"
- Click on "Rydeon Business" product
- Copy the Price ID from the Pricing section

---

## 🔧 Quick Fix

### Option 1: Automatic Fix (Recommended)

Run this command:

```powershell
.\fix-price-ids.ps1
```

It will ask you to paste the correct Price IDs.

### Option 2: Manual Fix

1. **Open `.env.local`**
2. **Replace these lines:**

   ```bash
   # Change these lines:
   NEXT_PUBLIC_STRIPE_PRICE_PRO=prod_TfYRQ8nEh6A1vX
   NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=prod_TfYUR551zlJlpRc
   
   # To (with your actual Price IDs):
   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1SiDL5EgDcFCzWHF9SF5T0M1
   NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_1SiDN3EgDcFCzWHFvgMFlI8m
   ```

3. **Save the file**
4. **Restart dev server** (Ctrl+C then `npm run dev`)

---

## 📸 Visual Guide

When viewing a product in Stripe Dashboard:

```
┌─────────────────────────────────────┐
│ Rydeon Pro                          │
├─────────────────────────────────────┤
│ Product ID: prod_TfYRQ8nEh6A1vX     │ ← DON'T use this
│                                     │
│ Pricing:                            │
│ ├─ £9.99 per month                  │
│ └─ ID: price_1abc2def3ghi456        │ ← USE THIS!
└─────────────────────────────────────┘
```

---

## ✅ After Fixing

1. Restart your dev server
2. Go to http://localhost:3000/pro
3. Click "Upgrade"
4. Should now successfully redirect to Stripe checkout!

---

## Still Stuck?

**Can't find Price IDs?**
- Make sure you created the products with prices
- Look under "Pricing" section, NOT "Product ID"
- Price IDs always start with `price_`

**Need to create products?**
- Go to [Create Product](https://dashboard.stripe.com/test/products/create)
- Set price as recurring/monthly
- Price ID will be generated automatically
