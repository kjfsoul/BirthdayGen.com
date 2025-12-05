#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Starting Master Reconciliation..."

# 1. Archive "Ghost" Tasks (Clean Slate)
# We create temporary tasks to log past work, then close them instantly
bd create "Migrate to Vite" -d "Replaced Next.js with Vite/React Router" -p 0 -t task --json | jq -r '.id' | xargs -I {} bd close {} --reason "Completed"
bd create "Implement 3D Tilt Core" -d "Basic react-tilt implementation" -p 0 -t task --json | jq -r '.id' | xargs -I {} bd close {} --reason "Completed"

# 2. Create P0 RECOVERY Tasks (The Fixes)
echo "🚨 Creating Recovery Tasks..."

# Build & Infra
bd create "Fix Production Build & Zombies" -d "Remove .next folder, fix tsconfig excludes, resolve TS2307 errors" -p 0 -t task --labels "high,infra"

# UX/UI Rescue
bd create "Rescue Card UI (Split Layout)" -d "Move to 60/40 Split Screen. Fix 'Awkward Bending' by adding Preview Toggle. Move Text Input to back of card." -p 0 -t task --labels "high,ui"
bd create "Fix Sticker UX" -d "Fix drag coordinates. Add Delete/Reposition logic. Uncrowd the UI." -p 0 -t task --labels "high,ui"

# New Features (The 'Magic')
bd create "Implement AI Brainstorming Assistant" -d "Floating 'Magical Assistant' chat for ideation. Connect to generate-text Edge Function." -p 0 -t task --labels "high,ai"
bd create "Enhance Image Upload UX" -d "Add Crop/Position modal. Prevent immediate full-bg replace. Add Image Vault sorting." -p 1 -t task --labels "medium,ux"
bd create "Implement Holiday Template Engine" -d "Add Christmas/NYE/Valetines categories. Implement Canva-style blend modes for uploads." -p 1 -t task --labels "medium,content"

# Cleanup
bd create "Disable Unexpected Gamification" -d "Remove the scratch-off/surprise gift trigger from the generator flow." -p 0 -t task --labels "high,cleanup"

echo "✅ Beads Board Synced. Current Status:"
bd stats
