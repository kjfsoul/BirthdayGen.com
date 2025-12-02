#!/bin/bash

# Supabase Configuration Verification Script

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║              SUPABASE OAUTH CALLBACK - VERIFICATION                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

🔍 CHECKING YOUR CONFIGURATION...

EOF

# Check environment variables
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2)
SUPABASE_ID=$(grep "NEXT_PUBLIC_SUPABASE_ID" .env.local | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f2)

echo "📋 Your Supabase Configuration:"
echo ""
echo "  Project ID: $SUPABASE_ID"
echo "  Supabase URL: $SUPABASE_URL"
echo "  Anon Key: ${SUPABASE_ANON_KEY:0:30}..."
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

# Show what needs to be configured
echo "✅ REQUIRED SUPABASE DASHBOARD SETTINGS:"
echo ""
echo "**MUST GO HERE:**"
echo "  https://app.supabase.com/project/$SUPABASE_ID/auth/url-configuration"
echo ""
echo "1️⃣  SITE URL should be:"
echo ""
echo "    http://localhost:3000"
echo ""
echo "    (Change to https://birthdaygen.com for production)"
echo ""
echo "2️⃣  REDIRECT URLs must include (click 'Add URL' for each):"
echo ""
echo "    http://localhost:3000/auth/callback"
echo "    https://birthdaygen.com/auth/callback"
echo ""
echo "3️⃣  Click SAVE button at bottom of page!"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

# Check if callback route exists
if [ -f "src/app/auth/callback/route.ts" ]; then
    echo "✅ Auth callback route exists: src/app/auth/callback/route.ts"
else
    echo "❌ WARNING: Auth callback route NOT found!"
fi
echo ""

# Test if server is running
if nc -z localhost 3000 2>/dev/null; then
    echo "✅ Dev server is running on port 3000"
    echo ""
    echo "Testing callback route..."
    CALLBACK_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/callback 2>/dev/null)
    if [ "$CALLBACK_TEST" = "302" ] || [ "$CALLBACK_TEST" = "307" ]; then
        echo "✅ Callback route responds (HTTP $CALLBACK_TEST - redirect as expected)"
    else
        echo "⚠️  Callback route returned HTTP $CALLBACK_TEST"
    fi
else
    echo "⚠️  Dev server NOT running on port 3000"
    echo "    Run: pnpm dev"
fi
echo ""

echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "🧪 TESTING STEPS:"
echo ""
echo "  1. Make sure redirect URLs are configured (above)"
echo "  2. Clear browser cookies for localhost:3000"
echo "  3. Go to: http://localhost:3000/auth"
echo "  4. Click: 'Continue with Google'"
echo "  5. Watch terminal for: [Auth Callback] logs"
echo "  6. Expected result: Redirect to /contacts"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "📊 WHAT TO LOOK FOR IN TERMINAL:"
echo ""
echo "After clicking Google OAuth, you should see:"
echo ""
echo "  [Auth Callback] Received request: {"
echo "    code: 'abc123...',    ← Should NOT be 'MISSING'"
echo "    error: null,          ← Should be null"
echo "  }"
echo ""
echo "  [Auth Callback] Session exchanged successfully. User: <user-id>"
echo ""
echo "  [Auth Callback] Redirecting to: http://localhost:3000/contacts"
echo ""
echo "If you see 'code: MISSING':"
echo "  → Redirect URLs in Supabase NOT configured correctly"
echo "  → Double-check step 2️⃣  above"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────"
echo ""

echo "🎯 QUICK FIX CHECKLIST:"
echo ""
echo "  □ Opened Supabase dashboard URL (shown above)"
echo "  □ Set Site URL to: http://localhost:3000"
echo "  □ Added redirect URL: http://localhost:3000/auth/callback"
echo "  □ Clicked SAVE button"
echo "  □ Cleared browser cookies"
echo "  □ Restarted dev server"
echo "  □ Tested login flow"
echo ""

echo "✨ Try the login again and check your terminal output!"
echo ""
