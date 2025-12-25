# Stripe Configuration Helper
# This script helps you add Stripe configuration to your .env.local file

Write-Host "🚀 Rydeon Stripe Configuration Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Creating .env.local from existing configuration..." -ForegroundColor Yellow
}

Write-Host "📋 Please provide your Stripe credentials (from Stripe Dashboard)" -ForegroundColor Green
Write-Host ""

# Get Stripe keys
Write-Host "1️⃣  Stripe Publishable Key (pk_test_...):" -ForegroundColor Yellow
$publishableKey = Read-Host "   "

Write-Host "2️⃣  Stripe Secret Key (sk_test_...):" -ForegroundColor Yellow
$secretKey = Read-Host "   "

Write-Host "3️⃣  Stripe Webhook Secret (whsec_...):" -ForegroundColor Yellow
$webhookSecret = Read-Host "   "

Write-Host "4️⃣  Pro Price ID (price_...):" -ForegroundColor Yellow
$proPriceId = Read-Host "   "

Write-Host "5️⃣  Business Price ID (price_...):" -ForegroundColor Yellow
$businessPriceId = Read-Host "   "

Write-Host ""
Write-Host "6️⃣  App URL (press Enter for http://localhost:3000):" -ForegroundColor Yellow
$appUrl = Read-Host "   "
if ([string]::IsNullOrWhiteSpace($appUrl)) {
    $appUrl = "http://localhost:3000"
}

Write-Host ""
Write-Host "💾 Adding Stripe configuration to .env.local..." -ForegroundColor Cyan

# Stripe configuration to append
$stripeConfig = @"

# Stripe Configuration (Added $(Get-Date -Format "yyyy-MM-dd HH:mm"))
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$publishableKey
STRIPE_SECRET_KEY=$secretKey
STRIPE_WEBHOOK_SECRET=$webhookSecret
NEXT_PUBLIC_STRIPE_PRICE_PRO=$proPriceId
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=$businessPriceId
NEXT_PUBLIC_APP_URL=$appUrl
"@

# Append to .env.local
Add-Content -Path ".env.local" -Value $stripeConfig

Write-Host "✅ Stripe configuration added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
Write-Host "   2. Navigate to http://localhost:3000/pro" -ForegroundColor White
Write-Host "   3. Test with card: 4242 4242 4242 4242" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed setup guide, see QUICK_STRIPE_SETUP.md" -ForegroundColor Yellow
Write-Host ""

# Ask if they want to restart dev server
Write-Host "Would you like to view the .env.local file? (Y/N)" -ForegroundColor Cyan
$viewFile = Read-Host "   "

if ($viewFile -eq "Y" -or $viewFile -eq "y") {
    Write-Host ""
    Write-Host "📄 Current .env.local contents:" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Get-Content ".env.local" | ForEach-Object {
        # Mask sensitive values
        if ($_ -match "^(.*?=)(.+)$") {
            $key = $matches[1]
            $value = $matches[2]
            if ($key -match "SECRET|KEY|URI") {
                Write-Host "$key****" -ForegroundColor DarkGray
            } else {
                Write-Host $_ -ForegroundColor White
            }
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "✨ Setup complete! Happy coding! ✨" -ForegroundColor Cyan
