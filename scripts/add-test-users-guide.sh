#!/bin/bash

# Google OAuth - Add Test Users Guide
# This script provides instructions for adding test users to your Google OAuth consent screen

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                    ADD TEST USERS TO GOOGLE OAUTH                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 STEP-BY-STEP INSTRUCTIONS:

1️⃣  Open Google Cloud Console:
   → https://console.cloud.google.com/

2️⃣  Select Your Project:
   → Click the project dropdown at the top
   → Select your BirthdayGen project

3️⃣  Navigate to OAuth Consent Screen:
   → Left sidebar: "APIs & Services"
   → Click: "OAuth consent screen"

4️⃣  Scroll to "Test Users" Section:
   → You'll see a section labeled "Test users"
   → Click the "+ ADD USERS" button

5️⃣  Add Email Addresses:
   → Enter Gmail addresses (one per line):

     your.email@gmail.com
     tester1@gmail.com
     tester2@gmail.com

   → Click "SAVE"

6️⃣  Verify Test Users Added:
   → You should see the emails listed under "Test users"
   → Each user will now get smooth OAuth experience with no warnings

──────────────────────────────────────────────────────────────────────────────

✅ WHAT HAPPENS AFTER ADDING TEST USERS:

Test Users (added above):
  ✓ See normal Google OAuth consent screen
  ✓ No "unverified app" warning
  ✓ One-click approval
  ✓ Smooth contacts import

Other Users (not added as test users):
  ⚠ See "This app isn't verified" warning
  ⚠ Must click "Advanced" → "Go to [App Name] (unsafe)"
  ⚠ Can still proceed but experience is not ideal
  ✓ Can always use file upload instead

──────────────────────────────────────────────────────────────────────────────

📝 TESTING CHECKLIST:

After adding test users, test the flow:

□ 1. Log in to BirthdayGen as a test user (via Supabase OAuth)
□ 2. Navigate to Contacts page
□ 3. Click "Import from Google"
□ 4. Should redirect to Google OAuth (smooth, no warnings)
□ 5. Approve access to contacts
□ 6. Should redirect back and import contacts
□ 7. Verify contacts appear in your contacts list

──────────────────────────────────────────────────────────────────────────────

🔧 CURRENT CONFIGURATION:

Scopes Requested:
  ✓ https://www.googleapis.com/auth/contacts.readonly

OAuth Client:
  ✓ GOOGLE_CLIENT_ID: 574632048158-rp9ohave3rgqp003bhuc09f1e6v9ci60...
  ✓ Redirect URI: http://localhost:3000/api/import/callback/google

──────────────────────────────────────────────────────────────────────────────

🚀 WHEN TO APPLY FOR FULL VERIFICATION:

You should apply for Google verification when:
  □ Ready for public launch
  □ Have privacy policy published
  □ Have terms of service published
  □ App branding/logo ready
  □ Ready to handle 2-6 week review process

Until then:
  ✓ Use test users for internal testing
  ✓ Use file upload as fallback
  ✓ Everything works, just with warnings for non-test users

──────────────────────────────────────────────────────────────────────────────

📚 DOCUMENTATION:

For more details, see:
  → GOOGLE_OAUTH_SETUP.md (in project root)

EOF
