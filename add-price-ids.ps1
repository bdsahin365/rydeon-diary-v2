# Quick Price ID Setup
# Run this after creating your Stripe products

Write-Host ""
Write-Host "🎯 Add Stripe Price IDs to .env.local" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "First, create your products in Stripe:" -ForegroundColor Yellow
Write-Host "👉 https://dashboard.stripe.com/test/products/create" -ForegroundColor Blue
Write-Host ""
Write-Host "Then enter the Price IDs below:" -ForegroundColor Yellow
Write-Host ""

# Get Price IDs
Write-Host "Pro Plan Price ID (price_...):" -ForegroundColor Green
$proPriceId = Read-Host "   "

Write-Host "Business Plan Price ID (price_...):" -ForegroundColor Green
$businessPriceId = Read-Host "   "

# Optional: Webhook Secret
Write-Host ""
Write-Host "Webhook Secret (optional - press Enter to skip):" -ForegroundColor Green
Write-Host "   If using Stripe CLI, run: stripe listen --forward-to localhost:3000/api/stripe/webhook" -ForegroundColor DarkGray
$webhookSecret = Read-Host "   "

Write-Host ""
Write-Host "💾 Adding to .env.local..." -ForegroundColor Cyan

# Build configuration
$config = @"

# Stripe Price IDs (Added $(Get-Date -Format "yyyy-MM-dd HH:mm"))
NEXT_PUBLIC_STRIPE_PRICE_PRO=$proPriceId
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=$businessPriceId
"@

if (![string]::IsNullOrWhiteSpace($webhookSecret)) {
    $config += @"

STRIPE_WEBHOOK_SECRET=$webhookSecret
"@
}

# Append to .env.local
Add-Content -Path ".env.local" -Value $config

Write-Host "✅ Configuration added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Pro Price ID: $proPriceId" -ForegroundColor White
Write-Host "   Business Price ID: $businessPriceId" -ForegroundColor White
if (![string]::IsNullOrWhiteSpace($webhookSecret)) {
    Write-Host "   Webhook Secret: ****" -ForegroundColor White
}
Write-Host ""
Write-Host "🔄 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
Write-Host "   2. Test at http://localhost:3000/pro" -ForegroundColor White
Write-Host "   3. Use test card: 4242 4242 4242 4242" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup complete! ✨" -ForegroundColor Green
