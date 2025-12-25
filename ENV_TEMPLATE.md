# Environment Variables Template
# Copy this file to .env.local and fill in your actual values

# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
AUTH_SECRET=your_auth_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration (TEST MODE - for development)
# Get these from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get this from: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from your products)
# Get these from: https://dashboard.stripe.com/test/products
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_...

# Application URL
# For local development:
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production (Vercel):
# NEXT_PUBLIC_APP_URL=https://rydeon-dashboard.vercel.app

# ==========================================
# PRODUCTION STRIPE (uncomment when ready)
# ==========================================
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
# NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_...
