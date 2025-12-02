#!/bin/bash
# Script to import environment variables to Vercel using file upload

echo "📤 Importing environment variables to Vercel..."

if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found!"
  exit 1
fi

# Create temporary files for each environment
cp .env.local .env.production.local
cp .env.local .env.preview.local
cp .env.local .env.development.local

echo "✅ Created environment-specific files"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://vercel.com/kjfsouls-projects/birthdaygen/settings/environment-variables"
echo "2. Click 'Add New' → 'Plaintext'"
echo "3. Paste the contents of .env.local"
echo "4. Select all environments (Production, Preview, Development)"
echo "5. Click 'Save'"
echo ""
echo "Or use the Vercel CLI to add them one by one:"
echo ""
echo "For each variable in .env.local, run:"
echo '  echo "VALUE" | vercel env add VARIABLE_NAME production preview development'
echo ""
echo "Example:"
echo '  echo "pezchazchhnmygpdgzma" | vercel env add NEXT_PUBLIC_SUPABASE_ID production preview development'
