#!/bin/bash

# Update Vercel environment variables for Google OAuth
# This ensures the production environment uses the correct scopes

set -e

echo "🔧 Updating Vercel Environment Variables for Google OAuth..."

# Update the GOOGLE_PEOPLE_SCOPES to only include contacts.readonly
vercel env add GOOGLE_PEOPLE_SCOPES production preview development << EOF
https://www.googleapis.com/auth/contacts.readonly
EOF

echo "✅ Updated GOOGLE_PEOPLE_SCOPES in Vercel"
echo ""
echo "Current configuration:"
echo "- contacts.readonly ✓ (kept)"
echo "- contacts.other.readonly ✗ (removed)"
echo ""
echo "This matches your local .env.local configuration."
echo ""
echo "To verify, run:"
echo "  vercel env ls"
