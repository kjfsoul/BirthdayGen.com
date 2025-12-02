#!/bin/bash

# Supabase OAuth Configuration Diagnostic Script
# This helps verify your Supabase and Google OAuth setup

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║              SUPABASE OAUTH CONFIGURATION DIAGNOSTIC                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check environment variables
echo "📋 Checking Environment Variables..."
echo ""

if [ -f .env.local ]; then
    echo "✓ .env.local file exists"

    # Check Supabase vars
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2)
    SUPABASE_ID=$(grep "NEXT_PUBLIC_SUPABASE_ID" .env.local | cut -d '=' -f2)

    echo "  Supabase Project ID: $SUPABASE_ID"
    echo "  Supabase URL: $SUPABASE_URL"
    echo ""

    # Check Google OAuth vars
    GOOGLE_CLIENT_ID=$(grep "^GOOGLE_CLIENT_ID=" .env.local | cut -d '=' -f2)
    GOOGLE_REDIRECT=$(grep "GOOGLE_OAUTH_REDIRECT_URI" .env.local | cut -d '=' -f2)
    GOOGLE_SCOPES=$(grep "GOOGLE_PEOPLE_SCOPES" .env.local | cut -d '=' -f2)

    echo "  Google Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
    echo "  Google Redirect URI: $GOOGLE_REDIRECT"
    echo "  Google Scopes: $GOOGLE_SCOPES"
    echo ""
else
    echo "❌ .env.local file not found"
    exit 1
fi

echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

# Display required configuration
echo "🔧 REQUIRED CONFIGURATION:"
echo ""
echo "1️⃣  SUPABASE DASHBOARD (https://app.supabase.com/project/$SUPABASE_ID)"
echo ""
echo "   Navigate to: Authentication → URL Configuration"
echo ""
echo "   ✓ Site URL should be:"
echo "     • Development: http://localhost:3000"
echo "     • Production: https://birthdaygen.com"
echo ""
echo "   ✓ Redirect URLs should include (one per line):"
echo "     • http://localhost:3000/auth/callback"
echo "     • https://birthdaygen.com/auth/callback"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "2️⃣  GOOGLE CLOUD CONSOLE (https://console.cloud.google.com/apis/credentials)"
echo ""
echo "   You need TWO OAuth 2.0 clients:"
echo ""
echo "   📌 Client A: Supabase Login (managed by Supabase)"
echo "      Find this in Supabase Dashboard → Authentication → Providers → Google"
echo "      Authorized redirect URIs:"
echo "        • https://pezchazchhnmygpdgzma.supabase.co/auth/v1/callback"
echo ""
echo "   📌 Client B: Google Contacts Import (your app)"
echo "      Client ID: ${GOOGLE_CLIENT_ID:0:40}..."
echo "      Authorized redirect URIs:"
echo "        • http://localhost:3000/api/import/callback/google"
echo "        • https://birthdaygen.com/api/import/callback/google"
echo ""
echo "      OAuth consent screen scopes:"
echo "        • https://www.googleapis.com/auth/contacts.readonly"
echo "        • (Remove contacts.other.readonly if present)"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "🧪 TESTING CHECKLIST:"
echo ""
echo "After configuring the above, test with these steps:"
echo ""
echo "  □ 1. Clear browser cookies for localhost:3000"
echo "  □ 2. Go to http://localhost:3000/auth"
echo "  □ 3. Click 'Continue with Google'"
echo "  □ 4. Verify redirect goes to: http://localhost:3000/auth/callback?code=..."
echo "  □ 5. Should then redirect to: http://localhost:3000/contacts"
echo "  □ 6. You should be logged in (check for user info in UI)"
echo ""
echo "  If you see redirect to '/#' instead:"
echo "    → Redirect URLs in Supabase are NOT configured correctly"
echo "    → Double-check step 1️⃣  above"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "🔍 COMMON ISSUES:"
echo ""
echo "  Issue: Redirect to '/#' after Google login"
echo "  Fix: Add redirect URLs in Supabase Dashboard (step 1️⃣ )"
echo ""
echo "  Issue: 'Unauthorized' error"
echo "  Fix: Ensure cookies are being set (check browser dev tools → Application → Cookies)"
echo ""
echo "  Issue: Contacts import doesn't work"
echo "  Fix: Check Google OAuth Client B redirect URIs (step 2️⃣ )"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "📚 For detailed fixes, see:"
echo "   → SUPABASE_REDIRECT_FIX.md"
echo "   → GOOGLE_OAUTH_SETUP.md"
echo ""

echo "✨ Done! Follow the configuration steps above."
