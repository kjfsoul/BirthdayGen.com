#!/bin/bash

# Clear Browser Cookies Script
# This script provides instructions to clear old Supabase cookies

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                    🍪 CLEAR OLD SUPABASE COOKIES                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

🚨 PROBLEM DETECTED:

Your browser has cookies from an OLD Supabase project:
  ❌ sb-pqfsbxcbsxuyfgqrxdob-auth-token (OLD project)

But your app expects cookies from:
  ✓ sb-pezchazchhnmygpdgzma-auth-token (CURRENT project)

This mismatch is causing the "Auth session missing!" error.

──────────────────────────────────────────────────────────────────────────────

✅ HOW TO FIX (2 MINUTES):

OPTION 1: Clear Cookies via Browser DevTools (RECOMMENDED)
───────────────────────────────────────────────────────────

1. Open your browser with http://localhost:3000
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. In left sidebar, expand "Cookies"
5. Click on "http://localhost:3000"
6. Look for cookies starting with "sb-"
7. Delete ALL cookies starting with "sb-" (especially sb-pqfsbxcbsxuyfgqrxdob-*)
8. Close DevTools
9. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

──────────────────────────────────────────────────────────────────────────────

OPTION 2: Clear All Cookies for localhost:3000
───────────────────────────────────────────────

Chrome:
  1. Go to: chrome://settings/cookies
  2. Click "See all site data and permissions"
  3. Search for "localhost"
  4. Click trash icon next to "localhost:3000"
  5. Refresh the page

Firefox:
  1. Go to: about:preferences#privacy
  2. Scroll to "Cookies and Site Data"
  3. Click "Manage Data..."
  4. Search for "localhost"
  5. Remove "localhost:3000"
  6. Click "Save Changes"

Safari:
  1. Go to: Safari → Settings → Privacy
  2. Click "Manage Website Data..."
  3. Search for "localhost"
  4. Remove "localhost"
  5. Click "Done"

──────────────────────────────────────────────────────────────────────────────

OPTION 3: Use Incognito/Private Window
───────────────────────────────────────

Fastest way to test with clean slate:
  1. Open Incognito/Private window (Cmd+Shift+N or Ctrl+Shift+N)
  2. Go to http://localhost:3000
  3. Test login flow

──────────────────────────────────────────────────────────────────────────────

🧪 AFTER CLEARING COOKIES, TEST:

1. Go to: http://localhost:3000/auth
2. Click: "Continue with Google"
3. Complete Google OAuth
4. You should be redirected to: /contacts
5. Check DevTools → Application → Cookies
6. Verify you now have: sb-pezchazchhnmygpdgzma-auth-token ✓

──────────────────────────────────────────────────────────────────────────────

🔍 HOW TO VERIFY IT'S FIXED:

Open DevTools → Console and run:
  document.cookie

You should see cookies with:
  ✓ sb-pezchazchhnmygpdgzma-auth-token
  ❌ NO sb-pqfsbxcbsxuyfgqrxdob-auth-token

──────────────────────────────────────────────────────────────────────────────

💡 WHY THIS HAPPENED:

You likely:
  • Switched Supabase projects
  • Changed Supabase configuration
  • Had multiple test projects

The old cookies remained in your browser and are conflicting with the new
project.

──────────────────────────────────────────────────────────────────────────────

🎯 SUMMARY:

1. Clear all "sb-*" cookies for localhost:3000
2. Clear all "sb-pqfsbxcbsxuyfgqrxdob-*" cookies specifically
3. Test login flow again
4. Verify cookies are now "sb-pezchazchhnmygpdgzma-*"

EOF

# Pause so user can read
echo ""
read -p "Press Enter after you've cleared the cookies to continue..."

echo ""
echo "✅ Great! Now restart your dev server and test the login flow."
echo ""
echo "Run:"
echo "  pnpm dev"
echo ""
echo "Then go to http://localhost:3000/auth and click 'Continue with Google'"
