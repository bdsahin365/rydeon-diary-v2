# Fix Price IDs Script
# This will help you replace Product IDs with correct Price IDs

Write-Host ""
Write-Host "🔧 Fix Stripe Price IDs" -ForegroundColor Red
Write-Host "========================" -ForegroundColor Red
Write-Host ""
Write-Host "❌ Problem: You're using Product IDs (prod_...) instead of Price IDs (price_...)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 How to find your Price IDs:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://dashboard.stripe.com/test/products" -ForegroundColor White
Write-Host "   2. Click on 'Rydeon Pro'" -ForegroundColor White
Write-Host "   3. Under 'Pricing' section, copy the ID (starts with 'price_')" -ForegroundColor White
Write-Host "   4. Repeat for 'Rydeon Business'" -ForegroundColor White
Write-Host ""
Write-Host "📝 Paste your Price IDs below:" -ForegroundColor Green
Write-Host ""

# Get correct Price IDs
Write-Host "Pro Plan Price ID (starts with price_...):" -ForegroundColor Yellow
$proPriceId = Read-Host "   "

Write-Host "Business Plan Price ID (starts with price_...):" -ForegroundColor Yellow
$businessPriceId = Read-Host "   "

# Validate
if (!$proPriceId.StartsWith("price_")) {
    Write-Host ""
    Write-Host "⚠️  Warning: Pro Price ID should start with 'price_'" -ForegroundColor Red
    Write-Host "You entered: $proPriceId" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

if (!$businessPriceId.StartsWith("price_")) {
    Write-Host ""
    Write-Host "⚠️  Warning: Business Price ID should start with 'price_'" -ForegroundColor Red
    Write-Host "You entered: $businessPriceId" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "💾 Updating .env.local..." -ForegroundColor Cyan

# Read current file
$envContent = Get-Content .env.local -Raw

# Replace the incorrect Product IDs with correct Price IDs
$envContent = $envContent -replace 'NEXT_PUBLIC_STRIPE_PRICE_PRO=prod_[^\r\n]*', "NEXT_PUBLIC_STRIPE_PRICE_PRO=$proPriceId"
$envContent = $envContent -replace 'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=prod_[^\r\n]*', "NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=$businessPriceId"

# Write back
$envContent | Set-Content .env.local -NoNewline

Write-Host "✅ Price IDs updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 New configuration:" -ForegroundColor Cyan
Write-Host "   Pro Price ID: $proPriceId" -ForegroundColor White
Write-Host "   Business Price ID: $businessPriceId" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your dev server (Ctrl+C in the terminal, then 'npm run dev')" -ForegroundColor White
Write-Host "   2. Visit http://localhost:3000/pro" -ForegroundColor White
Write-Host "   3. Click 'Upgrade' and test!" -ForegroundColor White
Write-Host ""
Write-Host "✨ Done! ✨" -ForegroundColor Green
