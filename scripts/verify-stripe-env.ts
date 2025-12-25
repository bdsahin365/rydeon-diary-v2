
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn("⚠️  .env.local file not found context.");
}

const REQUIRED_VARS = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO',
    'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS',
    'NEXT_PUBLIC_APP_URL'
];

let hasError = false;

console.log("🔍 Verifying Stripe Environment Variables...\n");

REQUIRED_VARS.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
        console.error(`❌ Missing: ${varName}`);
        hasError = true;
    } else {
        // Simple format checks
        if (varName.includes('PUBLISHABLE_KEY') && !value.startsWith('pk_')) {
            console.error(`❌ Invalid format for ${varName}: Should start with 'pk_'`);
            hasError = true;
        } else if (varName === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
            console.error(`❌ Invalid format for ${varName}: Should start with 'sk_'`);
            hasError = true;
        } else if (varName === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_')) {
            console.error(`❌ Invalid format for ${varName}: Should start with 'whsec_'`);
            hasError = true;
        } else if (varName.includes('PRICE') && !value.startsWith('price_')) {
            console.warn(`⚠️  Warning for ${varName}: Usually starts with 'price_', but might be custom.`);
        } else {
            console.log(`✅ ${varName} is set`);
        }
    }
});

console.log("\n");

if (hasError) {
    console.error("❌ Verification Failed. Please fix the missing or invalid variables in .env.local or Vercel settings.");
    process.exit(1);
} else {
    console.log("✅ Verification Passed! All Stripe variables look correct.");
    process.exit(0);
}
