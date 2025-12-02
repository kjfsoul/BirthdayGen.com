#!/bin/bash
# BirthdayGen.com - Beads Issue Creation Script

set -e

echo "🎂 BIRTHDAYGEN - Creating MVP Beads Issues"
echo "==========================================="

mkdir -p .beads-ids

# Epic 1: AI Content Generation
bd create "BirthdayGen - AI Content Generation Engine" \
  -p 0 -t epic \
  -d "Core value prop: Generate personalized birthday content. Includes prompt system, content types, personalization, preview. Timeline: 5 days." \
  -l ai,content,mvp,p0 \
  --json | tee .beads-ids/generation-epic.json

# Epic 2: User System
bd create "BirthdayGen - User Profile & Auth System" \
  -p 0 -t epic \
  -d "Foundation: Supabase auth, user profiles, recipient management, content library. Timeline: 3 days." \
  -l auth,users,mvp,p0 \
  --json | tee .beads-ids/user-epic.json

# Epic 3: Social Sharing
bd create "BirthdayGen - Social Media Integration" \
  -p 0 -t epic \
  -d "Share to social platforms, copy text, download image, shareable links. Timeline: 3 days." \
  -l social,sharing,mvp,p0 \
  --json | tee .beads-ids/social-epic.json

# Epic 4: Content Library
bd create "BirthdayGen - Content Library & Management" \
  -p 0 -t epic \
  -d "Save, browse, favorite, search generated content. User content history. Timeline: 2 days." \
  -l library,mvp,p0 \
  --json | tee .beads-ids/library-epic.json

# Extract IDs (Load from files if they exist, otherwise script would have failed earlier)
GEN_EPIC=$(cat .beads-ids/generation-epic.json | jq -r '.id')
USER_EPIC=$(cat .beads-ids/user-epic.json | jq -r '.id')
SOCIAL_EPIC=$(cat .beads-ids/social-epic.json | jq -r '.id')
LIBRARY_EPIC=$(cat .beads-ids/library-epic.json | jq -r '.id')

# Function to create task and link to parent
create_task() {
  local title="$1"
  local desc="$2"
  local labels="$3"
  local parent_id="$4"

  echo "Creating task: $title"
  local task_json=$(bd create "$title" -p 0 -t task -d "$desc" -l "$labels" --json)
  local task_id=$(echo "$task_json" | jq -r '.id')

  echo "Linking $task_id to $parent_id"
  bd dep add "$task_id" "$parent_id" --type parent-child --json
}

# Tasks for Generation Epic
create_task "AI Prompt Template System" \
  "Build template system for AI prompts. Subtasks: Create prompt templates (funny, heartfelt, professional) (3h), Context injection engine (2h), Test with sample inputs (1h). Total: 6h." \
  "ai,templates,p0" \
  "$GEN_EPIC"

create_task "Content Type Selector UI" \
  "UI for selecting content type (post, card, message, email). Subtasks: Build selector component (2h), Add preview for each type (1h), Style with Tailwind (1h). Total: 4h." \
  "ui,content-types,p0" \
  "$GEN_EPIC"

create_task "Generation Edge Function" \
  "Edge Function for content generation. Subtasks: Create supabase/functions/generate (2h), Integrate AI service (1h), Add rate limiting (1h). Total: 4h." \
  "edge-function,generation,p0" \
  "$GEN_EPIC"

# Tasks for User Epic
create_task "Supabase Auth Integration" \
  "Implement Supabase auth flow. Subtasks: Login/Signup pages (2h), Auth context provider (2h), Protected routes (1h). Total: 5h." \
  "auth,supabase,p0" \
  "$USER_EPIC"

create_task "User Profile Schema & Edge Functions" \
  "Database schema for users and profiles. Subtasks: Prisma schema updates (1h), Migration (0.5h), Profile Edge Functions (2h). Total: 3.5h." \
  "database,edge-function,p0" \
  "$USER_EPIC"

# Tasks for Social Epic
create_task "Social Share Components" \
  "UI components for sharing. Subtasks: Facebook/Twitter/LinkedIn buttons (2h), Copy to clipboard (1h), Native share API (1h). Total: 4h." \
  "ui,social,p0" \
  "$SOCIAL_EPIC"

# Tasks for Library Epic
create_task "Content Library UI" \
  "Grid view of saved content. Subtasks: Card component (2h), Grid layout (1h), Loading states (1h). Total: 4h." \
  "ui,library,p0" \
  "$LIBRARY_EPIC"

echo ""
echo "✅ BirthdayGen Beads issues created!"
bd stats
