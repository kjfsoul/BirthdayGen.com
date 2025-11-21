#!/bin/bash
# Reprioritize issues for MVP development
# Priority: 0=Critical, 1=High, 2=Medium, 3=Low, 4=Nice-to-have

echo "Reprioritizing issues for MVP development..."

# Phase 1-3: Foundation, Holiday, Card Creation (Priority 0 - Critical)
bd update BirthdayGen.com-5fb --priority 0 2>/dev/null  # Card Generator Completion
bd update BirthdayGen.com-dkv5 --priority 0 2>/dev/null  # Fix canvas performance
bd update BirthdayGen.com-r629 --priority 0 2>/dev/null  # Create card page scaffold
bd update BirthdayGen.com-msb --priority 0 2>/dev/null  # Automated Holiday Card Scheduling
bd update BirthdayGen.com-3y9 --priority 0 2>/dev/null  # Supabase Backend Polish

# Phase 3-4: Export & Personalization (Priority 1 - High)
bd update BirthdayGen.com-5hu9 --priority 1 2>/dev/null  # Add export capabilities
bd update BirthdayGen.com-qzj --priority 1 2>/dev/null  # Aura personalization
bd update BirthdayGen.com-wet --priority 1 2>/dev/null  # AI Message Personalization
bd update BirthdayGen.com-c82 --priority 1 2>/dev/null  # AI Gift Descriptions
bd update BirthdayGen.com-hiy --priority 1 2>/dev/null  # AI Gift Recommendation Engine

# Phase 5-6: Gifts & Contacts (Priority 1-2)
bd update BirthdayGen.com-e8g --priority 1 2>/dev/null  # Contact Management
bd update BirthdayGen.com-lac --priority 1 2>/dev/null  # Google Contact Import
bd update BirthdayGen.com-1g9 --priority 1 2>/dev/null  # Auto-populate workflow
bd update BirthdayGen.com-cbh --priority 2 2>/dev/null  # Amazon/Etsy API Integration
bd update BirthdayGen.com-buu --priority 2 2>/dev/null  # Auto-Populate System
bd update BirthdayGen.com-8p4 --priority 2 2>/dev/null  # Contact Context Upload

# Phase 7: Automation (Priority 2)
bd update BirthdayGen.com-pzf1 --priority 2 2>/dev/null  # Send capabilities
bd update BirthdayGen.com-qout --priority 2 2>/dev/null  # n8n automation
bd update BirthdayGen.com-z3e --priority 2 2>/dev/null  # Automation Engine
bd update BirthdayGen.com-hl1 --priority 2 2>/dev/null  # Email Deliverability
bd update BirthdayGen.com-ydb --priority 2 2>/dev/null  # Edge Function Testing

# Phase 8: Party Planning (Priority 2)
bd update BirthdayGen.com-loy --priority 2 2>/dev/null  # Party Planner MVP

# Phase 9: B2B & Export (Priority 3)
bd update BirthdayGen.com-aaey --priority 3 2>/dev/null  # B2B capabilities
bd update BirthdayGen.com-loc --priority 3 2>/dev/null  # Multi-Platform Export
bd update BirthdayGen.com-3ll --priority 3 2>/dev/null  # Export Engine
bd update BirthdayGen.com-4yu --priority 3 2>/dev/null  # Platform Templates

# Phase 10: Testing & Polish (Priority 3)
bd update BirthdayGen.com-30n --priority 3 2>/dev/null  # Mobile Optimization Quick Wins
bd update BirthdayGen.com-b06 --priority 3 2>/dev/null  # Mobile Optimization
bd update BirthdayGen.com-cij --priority 3 2>/dev/null  # Testing Infrastructure
bd update BirthdayGen.com-967 --priority 3 2>/dev/null  # E2E Test Suite
bd update BirthdayGen.com-27r --priority 3 2>/dev/null  # Increase Test Coverage
bd update BirthdayGen.com-7ici --priority 3 2>/dev/null  # Verification workflow

# Mobile tasks
bd update BirthdayGen.com-9t9 --priority 3 2>/dev/null  # Mobile Quick Win – Homepage Hero
bd update BirthdayGen.com-8uo --priority 3 2>/dev/null  # Mobile Quick Win – Tool Cards
bd update BirthdayGen.com-uqa --priority 3 2>/dev/null  # Mobile Quick Win – Meta Tags
bd update BirthdayGen.com-zl9 --priority 3 2>/dev/null  # Mobile Quick Win – Image Optimization
bd update BirthdayGen.com-3bs --priority 3 2>/dev/null  # Mobile Quick Win – Device Testing
bd update BirthdayGen.com-d8w --priority 3 2>/dev/null  # Phase 1 – Audit & Fix
bd update BirthdayGen.com-u29 --priority 3 2>/dev/null  # Phase 2 – Critical Pages
bd update BirthdayGen.com-4g1 --priority 3 2>/dev/null  # Phase 3 – Components
bd update BirthdayGen.com-2s3 --priority 3 2>/dev/null  # Phase 4 – Mobile QA

# Nice-to-have features (Priority 4)
bd update BirthdayGen.com-tas --priority 4 2>/dev/null  # AI Brainstorming Engine
bd update BirthdayGen.com-dgj --priority 4 2>/dev/null  # Brainstorm Core Function
bd update BirthdayGen.com-m7u --priority 4 2>/dev/null  # Document Upload & NLP
bd update BirthdayGen.com-qvb --priority 4 2>/dev/null  # Brainstorm UI Integration
bd update BirthdayGen.com-lzz --priority 4 2>/dev/null  # SEO/Content Engine
bd update BirthdayGen.com-iw3 --priority 4 2>/dev/null  # Research Engine
bd update BirthdayGen.com-5x5 --priority 4 2>/dev/null  # Content Generator
bd update BirthdayGen.com-4ud --priority 4 2>/dev/null  # Autofill Engine
bd update BirthdayGen.com-38o --priority 4 2>/dev/null  # Auto-Populate UI Integration

echo "✅ Reprioritization complete!"
echo ""
echo "Priority distribution:"
bd list --json 2>/dev/null | jq -r 'group_by(.priority) | map("Priority \(.[0].priority): \(length) issues") | .[]'
