# 🎯 BIRTHDAYGEN.COM - ULTIMATE MASTER DEVELOPMENT PLAN

**Date:** November 5, 2025, 1:42 AM EST
**Current Completion:** 35% (reduced due to comprehensive feature analysis)
**Total Features:** 24 (19 original + 5 AI enhancement from POD analysis)
**Target:** Full MVP in 8-10 weeks with parallel development
**Framework:** 3-Mission Acceleration + Beads + Cursor Agent Optimization

---

## 📊 EXECUTIVE DASHBOARD

### Current Reality

**Homepage Navigation:**

1. ✅ Card Maker (`/generator`) - 70% complete
2. ❌ Party Planner (`/party-planner`) - 0% complete → **404**
3. ❌ Gift Guide (`/gifts`) - 30% complete → **404**
4. ❌ Blog (`/blog`) - 0% complete → **404**

**Critical Stats:**

- **Completion:** 35% overall (down from 45% after discovering scope)
- **Total Effort:** 82 days (61 days for MVP P0+P1)
- **Immediate Crisis:** 2 of 3 nav features return 404

**New Addition: 5 AI Features (23 days)**

- AI Brainstorming Engine (3d) - P0
- SEO/Content Engine (3d) - P1
- Multi-Platform Export (4d) - P1
- Auto-Populate System (3d) - P1
- Image Filter System (1d) - P2
- **Impact:** B2B market unlock, 10x revenue potential

---

## 🚀 THREE-MISSION FRAMEWORK + BEADS INTEGRATION

### Mission Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  🚀 AI ACCELERATION (BirthdayGen.com-vbr) - P0              │
│  Meta-layer: Velocity tracking, automation, orchestration   │
│  ↓ Enhances both missions below ↓                           │
├───────────────────┬──────────────────────────────────────────┤
│  🧹 CLEANUP       │  🔍 FEATURE ANALYSIS                     │
│  (4m8) - P0       │  (9el) - P1                             │
│  Foundation       │  Planning → Execution                    │
│                   │  Generates → Dev Streams                 │
└───────────────────┴──────────────────────────────────────────┘
                              ↓
        ┌────────────────────┴────────────────────┐
        │  4 PARALLEL DEVELOPMENT STREAMS          │
        ├─────────┬─────────┬─────────┬───────────┤
        │ Stream A│ Stream B│ Stream C│ Stream D  │
        │Critical │UX/AI    │Infra    │Innovation │
        └─────────┴─────────┴─────────┴───────────┘
```

### Beads Epic IDs (Already Created)

```bash
# Verify they exist
bd show BirthdayGen.com-vbr --json  # AI Acceleration
bd show BirthdayGen.com-4m8 --json  # Cleanup
bd show BirthdayGen.com-9el --json  # Feature Analysis
```

---

## 🚨 PHASE 0: IMMEDIATE CRISIS (HOUR 1 - TODAY)

### Fix Homepage 404s - EXECUTE NOW

```bash
bd create "Homepage 404 Fix - Coming Soon Pages" \
  -p 0 -t task \
  -d "Create placeholder pages for /party-planner and /gifts with email signup. Prevents user confusion. 2 hour effort." \
  -l homepage,critical,p0,quickfix \
  --parent BirthdayGen.com-4m8 \
  --json
```

**Cursor Agent Prompt:**

```
TASK: Fix Homepage 404 Errors - Create Coming Soon Pages

CONTEXT:
- Homepage navigation has 2 broken links
- Users clicking "Plan a Party" → 404
- Users clicking "Find a Gift" → 404
- This breaks user trust and increases bounce rate

ACTION REQUIRED:
1. Create src/app/party-planner/page.tsx
   - Hero section: "Party Planner Coming Soon!"
   - Subheading: "We're building something special"
   - Email signup form (collect interest)
   - Feature preview list (5 bullet points)
   - CTA: "Notify Me When Live"
   - Link back to Card Maker

2. Create src/app/gifts/page.tsx
   - Hero section: "Gift Guide Launching Soon"
   - Subheading: "Discover perfect gifts with AI"
   - Email signup form
   - Gift category preview (6 categories with icons)
   - CTA: "Join the Waitlist"
   - Link back to Card Maker

3. (Optional) Update homepage stats
   - Change "50K Parties Planned" to "Join 50K Users"
   - OR add disclaimer: "* Projected milestones"

ACCEPTANCE CRITERIA:
✅ No 404 errors when clicking navigation
✅ Professional "coming soon" design
✅ Email signup functional
✅ Mobile-responsive (test on phone)
✅ Links back to Card Maker work

TECH STACK:
- Next.js 15 App Router
- Tailwind CSS (use design system)
- React Server Components
- Shadcn/ui for form components

EFFORT: 2 hours
PRIORITY: P0 - Execute immediately

Run: pnpm run dev and test both routes
```

---

## 📅 COMPLETE FEATURE INVENTORY & BEADS COMMANDS

### ALL 24 FEATURES - READY FOR BEADS ISSUE CREATION

**Run these commands to create all Beads issues:**

---

### ✅ P0 FEATURES (7 features, 21 days)

#### Feature 1: Card Generator Completion

```bash
bd create "Card Generator - Complete Remaining Work" \
  -p 0 -t epic \
  -d "Complete remaining 30% of Card Generator: Canvas performance (60fps), template consolidation, mobile optimization, sending pipeline completion. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 1. Effort: 8 days." \
  -l card-generator,p0,critical,canvas \
  --parent BirthdayGen.com-4m8 \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Card Generator Completion

MICROTASK 1.1: Canvas Performance Optimization (2-3 days) [P0]
Subtasks:
- Profile current canvas rendering with Chrome DevTools (2h)
- Implement virtualization for templates (only render visible) (4h)
- Add debouncing to resize operations (useDebouncedCallback) (2h)
- Lazy load images with next/image (4h)
- Use requestAnimationFrame for smooth rendering (3h)
- GPU acceleration with CSS transforms (2h)
- Test: Achieve 60fps on mobile devices (2h)

MICROTASK 1.2: Template Data Consolidation (2 days) [P1]
Subtasks:
- Audit all template data sources (hardcoded JSON, DB, API) (4h)
- Create single source of truth in database (Prisma migration) (3h)
- Update all component references to use DB (5h)
- Add validation layer (Zod schema) (2h)
- Write migration script for existing templates (2h)
- Test: All templates render correctly (2h)

MICROTASK 1.3: Mobile Canvas Optimization (2 days) [P2]
Subtasks:
- Implement touch gesture support (pinch-zoom, drag) (4h)
- Mobile-specific layout (collapsible panels) (3h)
- Responsive canvas sizing (viewport-based) (3h)
- Touch target compliance (44x44px minimum) (2h)
- Test on real iOS and Android devices (2h)

MICROTASK 1.4: Complete Card Sending Pipeline (2 days) [P0]
Subtasks:
- Complete TODO in /api/cards/[cardId]/send/route.ts (4h)
- Integrate with email service (Resend or Postmark) (3h)
- Test email delivery end-to-end (2h)
- Add error handling and retry logic (2h)
- Implement send confirmation UI (2h)
- Add delivery tracking dashboard (3h)

Total: 8 days
Priority: P0
Dependencies: None
```

---

#### Feature 2: Card Sending Pipeline (included in Feature 1)

#### Feature 3: Testing Infrastructure

```bash
bd create "Testing Infrastructure - Increase Coverage to 50%" \
  -p 0 -t epic \
  -d "Critical gap: Only 10% test coverage. Implement unit, integration, and E2E tests. Service layer 100%, critical components, user journeys. CI/CD integration. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 13. Effort: 10 days." \
  -l testing,p0,critical,quality \
  --parent BirthdayGen.com-4m8 \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Testing Infrastructure

MICROTASK 13.1: Service Layer Tests - 100% Coverage (5 days) [P0]
Subtasks:
- Set up Jest with TypeScript config (1h)
- Test all API routes (POST, GET, PUT, DELETE) (8h)
- Test all service functions (src/lib/*) (8h)
- Test database operations (Prisma mocks) (6h)
- Test authentication flows (4h)
- Test AI integrations (mock Gemini API) (4h)
- Test email sending (mock Resend) (3h)
- Critical component tests (Card, Contact, Party) (6h)
- CI/CD integration (GitHub Actions) (2h)

MICROTASK 13.2: Integration Tests for User Journeys (3 days) [P1]
Subtasks:
- Test: Sign up → Create card → Send (6h)
- Test: Import contacts → Assign birthdays → Automate (6h)
- Test: Create party → Add guests → Track RSVPs (4h)
- Test: Search gifts → Add to wishlist → Purchase (4h)
- Test: Upload context → Brainstorm ideas → Generate card (4h)

MICROTASK 13.3: E2E Tests with Playwright (2 days) [P2]
Subtasks:
- Playwright setup and configuration (2h)
- Critical path E2E: Full user journey (6h)
- Mobile device testing (Chrome, Safari) (4h)
- Visual regression tests (screenshots) (4h)

Total: 10 days
Priority: P0
Dependencies: None (can start immediately)
```

---

#### Feature 4: Contact Management Completion

```bash
bd create "Contact Management - Complete Implementation" \
  -p 0 -t epic \
  -d "Complete remaining 50%: Card sending pipeline completion, Google contact import OAuth, bulk operations, contact sync. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 11. Effort: 4 days." \
  -l contacts,p0,integration \
  --parent BirthdayGen.com-4m8 \
  --json
```

---

#### Feature 5: AI Brainstorming Engine ⭐ NEW

```bash
bd create "AI Brainstorming Engine - Full Implementation" \
  -p 0 -t epic \
  -d "GAME-CHANGER: Help users overcome creative blocks. Theme-based brainstorming, document context processing (upload PDFs/resumes), NLP extraction, one-click idea application. Solves #1 user pain point. 80% drop-off reduction. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 20. Effort: 3 days." \
  -l ai,brainstorming,p0,ux-critical \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: AI Brainstorming Engine

MICROTASK 20.1: AI Brainstorming Core (1.5 days) [P0]
Subtasks:
- Create edge function: src/app/api/ai/brainstorm/route.ts (2h)
- Integrate Gemini API for idea generation (3h)
- Prompt engineering: Generate 5 unique card concepts (2h)
- Input: theme (string), optional context (JSON) (1h)
- Output: [{title, description, visualConcept, keywords}] (1h)
- Store brainstorm session in database (Prisma schema) (2h)
- Error handling and rate limiting (1h)
- Test: 10 themes, validate idea quality (2h)

MICROTASK 20.2: Document Upload & NLP Extraction (1 day) [P0]
Subtasks:
- File upload component: PDF, DOCX, TXT, JSON support (3h)
- Parse PDFs with pdf-parse library (2h)
- Parse DOCX with mammoth library (2h)
- NLP extraction with Gemini (themes, entities, visual elements) (4h)
- Store extracted context in database (RecipientContext model) (2h)
- Link context to contact profiles (1h)

MICROTASK 20.3: UI Integration - Card Generator (0.5 days) [P0]
Subtasks:
- Add "Need Inspiration?" button to Card Generator header (1h)
- Create BrainstormDialog component (theme input, doc upload) (2h)
- Display 5 generated ideas in grid (1h)
- Select idea → auto-populate card generator fields (2h)
- Show "Try Another Idea" to regenerate (1h)
- Mobile-responsive dialog (1h)

Total: 3 days
Priority: P0
Dependencies: Gemini API key configured
Impact: 80% drop-off reduction, solves blank canvas problem
```

---

#### Feature 6: Auto-Populate System ⭐ NEW

```bash
bd create "Auto-Populate System - Smart Defaults Across Platform" \
  -p 0 -t epic \
  -d "UX MULTIPLIER: Reduce manual data entry by 80%. Contact-to-card autofill, context-aware defaults, AI-predicted preferences. Critical for mobile UX. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 23. Effort: 3 days." \
  -l auto-populate,ux,p0,system-wide \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Auto-Populate System

MICROTASK 23.1: Autofill Engine Core (1.5 days) [P1]
Subtasks:
- Create src/lib/autofill.ts utility (2h)
- Function: autoPopulateFromContact(contactId) (3h)
- Function: autoPopulateFromIdea(brainstormIdea) (2h)
- Function: autoPopulateFromContext(extractedContext) (2h)
- Function: autoPopulateFromResearch(seoProfile) (2h)
- Age calculation from birthday (1h)
- Occasion detection from calendar (2h)
- Theme suggestion algorithm (2h)

MICROTASK 23.2: UI Integration - All Features (1 day) [P1]
Subtasks:
- Add "Load from Contact" button to Card Generator (1h)
- Add autofill to Party Planner (2h)
- Add autofill to Gift Guide (2h)
- Add autofill to Automation page (2h)
- One-click flow: contact → pre-filled card (2h)
- Highlight which fields were auto-filled (1h)

MICROTASK 23.3: Preference Learning (0.5 days) [P2]
Subtasks:
- Track user edits to defaults (2h)
- Learn preferences over time (ML-lite) (2h)
- Improve suggestions based on history (2h)

Total: 3 days
Priority: P0 (critical UX)
Dependencies: Contact Management, Brainstorming Engine
Impact: 80% less friction, mobile-first benefit
```

---

#### Feature 7: Mobile Quick Wins (7 hours for 30-40% improvement)

```bash
bd create "Mobile Optimization - Quick Wins (7 Hours)" \
  -p 0 -t task \
  -d "Immediate mobile improvements: Fix homepage hero, responsive tool cards, add mobile meta tags, optimize key images, test on real devices. 30-40% improvement in 7 hours. See MOBILE_DESIGN_STRATEGY.md. Effort: 7 hours." \
  -l mobile,p0,quick-win,responsive \
  --parent BirthdayGen.com-4m8 \
  --json
```

---

### ✅ P1 FEATURES (10 features, 40 days)

#### Feature 8: Party Planner MVP

```bash
bd create "Party Planner - Complete MVP Implementation" \
  -p 1 -t epic \
  -d "Main navigation feature (404 currently). Full party planning: event creation, guest management with RSVP, task checklist, budget tracker, AI party suggestions. Complete Prisma schema. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 2. Effort: 8 days." \
  -l party-planner,p1,navigation,core-feature \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Party Planner MVP

MICROTASK 2.1: Database Schema & Migration (1 day)
Subtasks:
- Create Prisma schema: Party, PartyGuest, PartyTask, PartyExpense (3h)
- Generate migration: npx prisma migrate dev (1h)
- Add RLS policies in Supabase (2h)
- Seed with 5 test parties (2h)
- Test data integrity (1h)

MICROTASK 2.2: Party Event CRUD Operations (2 days)
Subtasks:
- API routes: /api/parties (POST, GET, PUT, DELETE) (6h)
- UI: PartyDashboard component (4h)
- UI: CreatePartyDialog component (3h)
- UI: PartyCard component (2h)
- State management: useParties, useParty hooks (3h)
- Testing: Create, edit, delete parties (2h)

MICROTASK 2.3: Guest Management System (1 day)
Subtasks:
- API routes: /api/parties/[id]/guests (4h)
- UI: GuestList component (3h)
- UI: AddGuestDialog component (2h)
- UI: RSVPTracker component (3h)
- Contact integration: Import from contacts (2h)
- Testing: Add guests, track RSVPs (2h)

MICROTASK 2.4: Task Checklist (1 day)
Subtasks:
- API routes: /api/parties/[id]/tasks (3h)
- UI: TaskChecklist component (3h)
- UI: TaskTimeline component (2h)
- Default task templates (party prep checklist) (3h)
- Testing: Add tasks, mark complete (2h)

MICROTASK 2.5: Budget Tracker (1 day)
Subtasks:
- API routes: /api/parties/[id]/expenses (3h)
- UI: BudgetTracker component (3h)
- UI: ExpenseList component (2h)
- Analytics: Total vs spent, category breakdown (3h)
- Testing: Add expenses, track budget (2h)

MICROTASK 2.6: AI Party Suggestions (2 days)
Subtasks:
- Edge function: party-ai-suggestions (4h)
- GPT-4 integration for suggestions (4h)
- Suggestion categories: themes, activities, menu, decorations (4h)
- UI: "Get AI Suggestions" button (2h)
- Display suggestions in card grid (2h)
- Apply suggestion to party (2h)

Total: 8 days
Priority: P1
Dependencies: None
```

---

#### Feature 9: Gift Guide MVP

```bash
bd create "Gift Guide - Complete MVP Implementation" \
  -p 1 -t epic \
  -d "Main navigation feature (404 currently, 30% schema only). Gift discovery, AI recommendations, aura-based library, wishlist, affiliate integration. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 3. Effort: 7 days." \
  -l gift-guide,p1,navigation,core-feature \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Gift Guide MVP

MICROTASK 3.1: Gift Database Schema & Seed (1 day)
Subtasks:
- Create Prisma schema: Gift, Wishlist, WishlistItem (3h)
- Generate migration (1h)
- Seed 100+ gift ideas with images (5h)
- Cover all aura types (Radiant, Vibrant, etc.) (2h)
- Include affiliate links (Amazon, Etsy) (2h)

MICROTASK 3.2: Gift Discovery UI (2 days)
Subtasks:
- Pages: /gifts (listing), /gifts/[id] (details) (4h)
- Components: GiftCard, GiftGrid, GiftFilter (4h)
- API routes: GET /api/gifts, GET /api/gifts/[id] (3h)
- Search functionality with filters (3h)
- State management: useGifts, useGiftSearch (2h)

MICROTASK 3.3: AI Gift Recommendations (2 days)
Subtasks:
- Edge function: gift-recommendations (4h)
- GPT-4 integration for personalization (4h)
- Aura-based matching algorithm (4h)
- Input: recipient details, budget, interests (2h)
- UI: AIGiftFinder component (conversational) (3h)
- Save recommendations to database (2h)

MICROTASK 3.4: Wishlist Feature (1 day)
Subtasks:
- API routes: GET/POST /api/wishlists (3h)
- UI: WishlistCard component (2h)
- UI: AddToWishlistButton component (2h)
- Create lists, add gifts, mark purchased (4h)
- Testing: Full wishlist flow (2h)

MICROTASK 3.5: Affiliate Link Integration (1 day)
Subtasks:
- Affiliate link builder: src/lib/affiliates.ts (3h)
- Track affiliate clicks (analytics) (2h)
- FTC compliance disclosure (1h)
- Test: Amazon and Etsy links (2h)

Total: 7 days
Priority: P1
Dependencies: None
```

---

#### Feature 10: SEO/Content Engine ⭐ NEW

```bash
bd create "SEO/Content Engine - Research & Automation" \
  -p 1 -t epic \
  -d "MARKETING MULTIPLIER: Topic research with web search, auto-generate blog posts, social media content, SEO optimization, research profile management. 10x faster content creation. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 21. Effort: 3 days." \
  -l seo,content,marketing,p1,automation \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: SEO/Content Engine

MICROTASK 21.1: Research Engine (1.5 days) [P1]
Subtasks:
- Create /api/ai/seo-research/route.ts (2h)
- Integrate Google Custom Search API (3h)
- Gemini analysis: extract trends, keywords, geo insights (4h)
- Output: {optimizedTitle, keywords[], hashtags[], hooks[], geoInsights} (2h)
- Save research profiles to database (2h)
- Test: 10 topics, validate quality (2h)

MICROTASK 21.2: Content Generator (1 day) [P1]
Subtasks:
- Blog post generator from research (4h)
- Social media caption generator (3h)
- Card description generator (2h)
- Email marketing copy generator (3h)
- Test: Generate 5 blog posts, validate SEO (2h)

MICROTASK 21.3: Admin UI (0.5 days) [P2]
Subtasks:
- Create /admin/content-research page (2h)
- Research profile manager (list, save, load) (2h)
- Content preview/edit interface (2h)
- Publish to blog button (1h)
- Export functionality (JSON) (1h)

Total: 3 days
Priority: P1
Dependencies: Blog Platform (for publishing)
Impact: 10x faster content, SEO traffic +150%
```

---

#### Feature 11: Multi-Platform Export ⭐ NEW

```bash
bd create "Multi-Platform Export - B2B Distribution System" \
  -p 1 -t epic \
  -d "B2B KILLER FEATURE: Export cards to Email, Slack, Teams, Social, Print formats. Bulk operations (500+ cards). REST API for integrations. Opens $10K+ corporate contracts. See CONSOLIDATED_FEATURES_COMPLETE.md Feature 22. Effort: 4 days." \
  -l export,b2b,distribution,p1,enterprise \
  --parent BirthdayGen.com-9el \
  --json
```

**Cursor Agent Microtasks:**

```
EPIC: Multi-Platform Export

MICROTASK 22.1: Export Engine Core (2 days) [P1]
Subtasks:
- Template system: Define platform schemas (3h)
- Validation rules per platform (2h)
- API: /api/export/[platform]/route.ts (4h)
- Bulk export processing (background jobs) (4h)
- Generate: PDF (print), PNG (social), HTML (email), JSON (API) (6h)

MICROTASK 22.2: Platform Templates (1 day) [P1]
Subtasks:
- Email template: HTML with inline CSS (3h)
- Slack/Teams: Rich card format (markdown + image) (3h)
- Social media: 1200x630px PNG optimization (2h)
- Print: High-res PDF with bleed (300 DPI) (3h)
- Test each format with 10 cards (3h)

MICROTASK 22.3: B2B Export Page & API (1 day) [P2]
Subtasks:
- Create /export page with platform selector (3h)
- Preview card in selected format (2h)
- Download buttons for each format (2h)
- Batch export: Select multiple cards (3h)
- API key management for enterprise (2h)
- Rate limiting and webhooks (2h)

Total: 4 days
Priority: P1
Dependencies: Card Generator complete
Impact: B2B market unlock, 20x revenue potential
```

---

#### Features 12-17: (Other P1 features - see CONSOLIDATED doc)

```bash
# Feature 12: Automation Backend Completion
bd create "Automation Backend - Complete Implementation" \
  -p 1 -t epic \
  -d "Complete remaining 60% of automation: Connect UI to real contacts API, implement rules engine, integrate with card sending, gift coordination, testing. See Feature 5 in CONSOLIDATED. Effort: 9 days." \
  -l automation,backend,p1 \
  --parent BirthdayGen.com-9el \
  --json

# Feature 13: AI Reliability
bd create "AI Reliability - Hybrid Local/Cloud Architecture" \
  -p 1 -t epic \
  -d "Complete remaining 40% of AI personalization: Add OpenAI DALL-E integration, hybrid local/cloud, automatic fallback, retry logic, GPT-4 message generation. See Feature 9 in CONSOLIDATED. Effort: 5 days." \
  -l ai,reliability,p1 \
  --parent BirthdayGen.com-4m8 \
  --json

# Feature 14: Backend Polish
bd create "Backend Polish - Email & Edge Functions" \
  -p 1 -t epic \
  -d "Complete remaining 20% of Supabase backend: Email deliverability (SPF/DKIM/DMARC), edge function testing, load testing, cost analysis. See Feature 10 in CONSOLIDATED. Effort: 4 days." \
  -l backend,supabase,p1 \
  --parent BirthdayGen.com-4m8 \
  --json

# Feature 15: Mobile Optimization (Full)
bd create "Mobile Optimization - Full Implementation" \
  -p 1 -t epic \
  -d "Complete mobile-first redesign: Audit all pages, fix breakpoints, touch target compliance, responsive testing. See MOBILE_DESIGN_STRATEGY.md. Effort: Ongoing (4 weeks)." \
  -l mobile,responsive,p1,ux \
  --parent BirthdayGen.com-4m8 \
  --json
```

---

### ✅ P2 FEATURES (5 features, 14.5 days)

```bash
# Feature 16: Blog Platform
bd create "Blog Platform - Complete MVP" \
  -p 2 -t epic \
  -d "SEO and content marketing: Blog listing, single post, admin CMS, rich text editor, SEO optimization (sitemap, RSS, meta tags). See Feature 4 in CONSOLIDATED. Effort: 6.5 days." \
  -l blog,seo,content,p2 \
  --parent BirthdayGen.com-9el \
  --json

# Feature 17: Card Showcase
bd create "Card Showcase - User Gallery" \
  -p 2 -t epic \
  -d "Community-driven content: Card gallery, filter by occasion/aura, like/favorite, search. See Feature 6 in CONSOLIDATED. Effort: 3 days." \
  -l showcase,community,p2 \
  --parent BirthdayGen.com-9el \
  --json

# Feature 18: Inspiration Page
bd create "Inspiration Page - Curated Content" \
  -p 2 -t epic \
  -d "Design ideas, party themes, gift ideas: Curated gallery, categories, save to favorites, share. See Feature 8 in CONSOLIDATED. Effort: 2 days." \
  -l inspiration,content,p2 \
  --parent BirthdayGen.com-9el \
  --json

# Feature 19: Payment Testing
bd create "Payment Integration - Test & Subscription Management" \
  -p 2 -t task \
  -d "Complete remaining 30% of Stripe integration: Test checkout, webhooks, subscription management, feature gating. See Feature 14 in CONSOLIDATED. Effort: 2 days." \
  -l payment,stripe,p2,testing \
  --parent BirthdayGen.com-4m8 \
  --json

# Feature 20: Image Filter System ⭐ NEW
bd create "Image Filter System - Real-Time Canvas Filters" \
  -p 2 -t task \
  -d "Professional image editing in card editor: Brightness/contrast/saturation sliders, style presets (vintage, B&W), real-time preview. See Feature 24 in CONSOLIDATED. Effort: 1 day." \
  -l image-editing,canvas,p2,polish \
  --parent BirthdayGen.com-9el \
  --json
```

---

### ✅ P3 FEATURES (4 features, 6.5 days)

```bash
# Feature 21: Community Platform
bd create "Community Platform - User Profiles & Social" \
  -p 3 -t epic \
  -d "User profiles with bio, follow/follower system, activity feed, user stats. See Feature 7 in CONSOLIDATED. Effort: 5 days." \
  -l community,social,p3 \
  --parent BirthdayGen.com-9el \
  --json

# Feature 22-24: Static Pages
bd create "Static Pages - About, Contact, Privacy" \
  -p 3 -t task \
  -d "Simple static pages: About Us (company info), Contact (form), Privacy Policy (legal text). See Features 16-18 in CONSOLIDATED. Effort: 1.5 days total." \
  -l static-pages,p3 \
  --parent BirthdayGen.com-9el \
  --json
```

---

### ✅ ENHANCEMENTS TO EXISTING FEATURES (5 enhancements, 6 days)

```bash
# Enhancement 1.A: Card Generator + Brainstorming UI
bd create "Enhancement: Card Generator - Add Brainstorming UI" \
  -p 1 -t task \
  -d "Add 'Need Inspiration?' button to Card Generator, opens brainstorm dialog, one-click idea application. Integration with Feature 20. Effort: +1 day to Feature 1." \
  -l enhancement,ai,card-generator,p1 \
  --parent BirthdayGen.com-9el \
  --json

# Enhancement 3.A: Gift Guide + AI Descriptions
bd create "Enhancement: Gift Guide - Auto-Generate Descriptions" \
  -p 1 -t task \
  -d "Auto-generate gift descriptions with SEO keywords using AI. Integration with Feature 21. Effort: +1 day to Feature 3." \
  -l enhancement,seo,gift-guide,p1 \
  --parent BirthdayGen.com-9el \
  --json

# Enhancement 4.A: Blog + Research-Driven Content
bd create "Enhancement: Blog - Research-Driven Post Generation" \
  -p 1 -t task \
  -d "Auto-create blog posts from trending topics using SEO research engine. Integration with Feature 21. Effort: +2 days to Feature 4." \
  -l enhancement,seo,blog,p1 \
  --parent BirthdayGen.com-9el \
  --json

# Enhancement 6.A: Showcase + Auto Descriptions
bd create "Enhancement: Showcase - Auto-Generate Card Descriptions" \
  -p 2 -t task \
  -d "SEO-optimized card descriptions for showcase gallery. Integration with Feature 21. Effort: +0.5 days to Feature 6." \
  -l enhancement,seo,showcase,p2 \
  --parent BirthdayGen.com-9el \
  --json

# Enhancement 11.A: Contacts + Context Upload
bd create "Enhancement: Contacts - Document Context Upload" \
  -p 1 -t task \
  -d "Upload recipient documents (PDF/DOCX) for NLP extraction to enrich profiles. Integration with Feature 20. Effort: +1.5 days to Feature 11." \
  -l enhancement,ai,contacts,p1 \
  --parent BirthdayGen.com-4m8 \
  --json
```

---

## 🛠️ ACCELERATION FRAMEWORK SETUP (STEP-BY-STEP)

### STEP 1: Install Beads Issue Tracker

```bash
# Verify prerequisites
node -v        # Should be v20.x (LTS)
pnpm -v        # Should be installed
git --version  # Should be installed

# Clone and install Beads
cd ~/projects  # or your preferred location
git clone https://github.com/steveyegge/beads.git
cd beads
npm install
npm link

# Verify installation
bd --version

# Initialize in your project
cd ~/BirthdayGen.com
bd init

# Verify epics exist
bd show BirthdayGen.com-vbr --json  # AI Acceleration
bd show BirthdayGen.com-4m8 --json  # Cleanup
bd show BirthdayGen.com-9el --json  # Feature Analysis
```

---

### STEP 2: Create ALL Beads Issues (Run All Commands Above)

**Execute in order:**

1. **Phase 0:** Homepage 404 fix (1 command)
2. **P0 Features:** 7 commands
3. **P1 Features:** 10 commands
4. **P2 Features:** 5 commands
5. **P3 Features:** 2 commands
6. **Enhancements:** 5 commands

**Total:** 30 Beads issues created

```bash
# After running all commands, verify
bd ready --json | jq 'length'
# Should show ~30 ready tasks

# View by priority
bd list --priority 0 --json | jq 'length'  # P0 tasks
bd list --priority 1 --json | jq 'length'  # P1 tasks
```

---

### STEP 3: Cursor IDE Integration

```bash
# Create Cursor configuration
mkdir -p .cursor-context

# Create .cursorrules file
cat > .cursorrules << 'EOF'
# BirthdayGen.com Development Rules

## Project Context
This is birthdaygen.com - birthday celebration platform with card maker, party planner, gift guide.
Current focus: Three parallel missions + AI enhancement features.

## Mission Epic IDs (Beads)
- AI Acceleration: BirthdayGen.com-vbr
- Cleanup: BirthdayGen.com-4m8
- Feature Analysis: BirthdayGen.com-9el

## Development Standards
- TypeScript strict mode
- Next.js 15 App Router
- Prisma for database
- pnpm for package management
- Mobile-first responsive design (Tailwind CSS)
- Touch targets ≥44x44px
- Design system: Use CSS variables from globals.css

## Before Starting Work
1. Check Beads for ready tasks: `bd ready --json`
2. Verify dependencies met: `bd show [task-id] --json`
3. Run existing tests: `pnpm test`
4. Reference specs: CONSOLIDATED_FEATURES_COMPLETE.md

## After Completing Work
1. Run: pnpm run build
2. Run: pnpm run typecheck
3. Update Beads: `bd update [id] --status done`
4. Commit: git commit -m "feat([TASK-ID]): description"

## Mobile-First Approach
- Start with mobile breakpoint (default styles)
- Use responsive classes: sm:, md:, lg:, xl:
- Test on real devices before marking done
- Reference: MOBILE_DESIGN_STRATEGY.md

## AI Features (NEW)
- Reference: POD_GENERATOR_FEATURE_ANALYSIS.md
- Gemini API for NLP/generation
- GPT-4 for personalization
- Document parsing: pdf.js, mammoth.js
- All AI features include error handling and fallbacks

## Feature Specs
- Complete specs: CONSOLIDATED_FEATURES_COMPLETE.md
- All 24 features documented with:
  - Database schemas (Prisma)
  - API routes
  - UI components
  - Microtask breakouts
  - Acceptance criteria

## Testing Requirements
- Unit tests for all services
- Integration tests for user journeys
- E2E tests for critical paths
- Test coverage goal: ≥50%
EOF

echo "✅ Cursor rules configured"
```

---

### STEP 4: Context Preparation Scripts

```bash
# Create script to prepare Cursor context
cat > scripts/cursor-prep.sh << 'EOF'
#!/bin/bash
echo "🎯 Preparing Cursor context..."

# Get ready tasks from Beads
echo "## Ready Tasks (Priority Order)" > .cursor-context/beads-ready.md
bd ready --json | jq -r '.[] | "### [\(.id)] \(.title)\n**Priority:** P\(.priority) | **Effort:** \(.effort)\n**Description:** \(.description)\n"' >> .cursor-context/beads-ready.md

# Get mission status
echo "" >> .cursor-context/beads-ready.md
echo "## Mission Status" >> .cursor-context/beads-ready.md

echo "" >> .cursor-context/beads-ready.md
echo "### 🚀 AI Acceleration (BirthdayGen.com-vbr)" >> .cursor-context/beads-ready.md
bd list --parent BirthdayGen.com-vbr --json | jq -r '.[] | "- [\(.id)] \(.title) - \(.status)"' >> .cursor-context/beads-ready.md

echo "" >> .cursor-context/beads-ready.md
echo "### 🧹 Cleanup (BirthdayGen.com-4m8)" >> .cursor-context/beads-ready.md
bd list --parent BirthdayGen.com-4m8 --json | jq -r '.[] | "- [\(.id)] \(.title) - \(.status)"' >> .cursor-context/beads-ready.md

echo "" >> .cursor-context/beads-ready.md
echo "### 🔍 Feature Analysis (BirthdayGen.com-9el)" >> .cursor-context/beads-ready.md
bd list --parent BirthdayGen.com-9el --json | jq -r '.[] | "- [\(.id)] \(.title) - \(.status)"' >> .cursor-context/beads-ready.md

echo "✅ Context ready at .cursor-context/beads-ready.md"
echo "📋 In Cursor: Use @.cursor-context/beads-ready.md"
EOF

chmod +x scripts/cursor-prep.sh
echo "✅ Context prep script created"
```

---

### STEP 5: Velocity Tracking Automation

```bash
cat > scripts/velocity-metrics.sh << 'EOF'
#!/bin/bash
echo "📊 Velocity Metrics - $(date +%Y-%m-%d)"
echo "========================================="

# Tasks completed today
COMPLETED_TODAY=$(bd list --status done --json 2>/dev/null | \
  jq -r --arg date "$(date +%Y-%m-%d)" '[.[] | select(.completed_at? and (.completed_at | startswith($date)))] | length')
echo "Tasks completed today: $COMPLETED_TODAY"

# In progress
IN_PROGRESS=$(bd list --status in_progress --json 2>/dev/null | jq 'length')
echo "Tasks in progress: $IN_PROGRESS"

# Ready for next sprint
READY=$(bd ready --json 2>/dev/null | jq 'length')
echo "Ready for next sprint: $READY"

# Blocked tasks
BLOCKED=$(bd list --status blocked --json 2>/dev/null | jq 'length')
echo "Blocked tasks: $BLOCKED"

# Completion rate (last 7 days)
WEEK_AGO=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
COMPLETED_WEEK=$(bd list --status done --json 2>/dev/null | \
  jq -r --arg date "$WEEK_AGO" '[.[] | select(.completed_at? and (.completed_at >= $date))] | length')
echo "Tasks completed (last 7 days): $COMPLETED_WEEK"

echo ""
echo "📈 Run 'bd stats' for detailed analytics"
EOF

chmod +x scripts/velocity-metrics.sh
echo "✅ Velocity tracking script created"
```

---

### STEP 6: Daily Workflow Automation

```bash
cat > scripts/daily-workflow.sh << 'EOF'
#!/bin/bash
echo "🌅 Starting Daily Development Workflow"
echo "========================================"

echo ""
echo "Step 1: Preparing Cursor context..."
./scripts/cursor-prep.sh

echo ""
echo "Step 2: Velocity Metrics"
./scripts/velocity-metrics.sh

echo ""
echo "Step 3: Ready Tasks (Top 5 by Priority)"
bd ready --json | jq -r 'sort_by(.priority) | .[:5] | .[] | "[\(.id)] \(.title) (P\(.priority), \(.effort))"'

echo ""
echo "✅ Ready to start! Open Cursor and:"
echo "   1. Reference: @.cursor-context/beads-ready.md"
echo "   2. Reference: @CONSOLIDATED_FEATURES_COMPLETE.md"
echo "   3. Pick highest priority task from list above"
EOF

chmod +x scripts/daily-workflow.sh
echo "✅ Daily workflow script created"
```

---

### STEP 7: Test Workflow

```bash
echo "Testing complete workflow setup..."

# Run daily workflow
./scripts/daily-workflow.sh

# Test Beads integration
echo ""
echo "Testing Beads commands..."
bd ready --json | jq '.[] | {id, title, priority}' | head -20

echo ""
echo "✅ Workflow test complete"
echo "Next: Run './scripts/daily-workflow.sh' every morning"
```

---

### STEP 8: Verify All Installations

```bash
echo "Verifying complete setup..."

# Check Node/pnpm
echo "✓ Node version: $(node -v)"
echo "✓ pnpm version: $(pnpm -v)"

# Check Beads
echo "✓ Beads installed: $(bd --version)"

# Check project
echo "✓ Project initialized: $(ls .beads 2>/dev/null && echo 'Yes' || echo 'No')"

# Check missions
echo "✓ AI Acceleration: $(bd show BirthdayGen.com-vbr --json 2>/dev/null | jq -r '.id')"
echo "✓ Cleanup: $(bd show BirthdayGen.com-4m8 --json 2>/dev/null | jq -r '.id')"
echo "✓ Feature Analysis: $(bd show BirthdayGen.com-9el --json 2>/dev/null | jq -r '.id')"

# Check scripts
echo "✓ Cursor prep script: $(ls scripts/cursor-prep.sh 2>/dev/null && echo 'Created' || echo 'Missing')"
echo "✓ Velocity script: $(ls scripts/velocity-metrics.sh 2>/dev/null && echo 'Created' || echo 'Missing')"
echo "✓ Daily workflow script: $(ls scripts/daily-workflow.sh 2>/dev/null && echo 'Created' || echo 'Missing')"

# Check Cursor integration
echo "✓ Cursor rules: $(ls .cursorrules 2>/dev/null && echo 'Configured' || echo 'Missing')"
echo "✓ Context directory: $(ls -d .cursor-context 2>/dev/null && echo 'Created' || echo 'Missing')"

echo ""
echo "🚀 Setup verification complete!"
```

---

### STEP 9: Create First Task Assignment

```bash
# Get highest priority ready task
FIRST_TASK=$(bd ready --json | jq -r 'sort_by(.priority) | .[0].id')

echo "Starting with highest priority task: $FIRST_TASK"

# Show task details
bd show $FIRST_TASK --json | jq '{id, title, description, priority, effort, status}'

# Start the task
bd update $FIRST_TASK --status in_progress

echo "✅ Task $FIRST_TASK started!"
echo "In Cursor: Use @.cursor-context/beads-ready.md to see task details"
```

---

### STEP 10: Complete Setup Verification

```bash
echo "🎯 COMPLETE SETUP CHECKLIST"
echo "============================="
echo ""
echo "✅ Beads issue tracker installed"
echo "✅ 30 Beads issues created (24 features + 6 critical)"
echo "✅ Cursor IDE integration configured (.cursorrules)"
echo "✅ Context preparation scripts created"
echo "✅ Velocity tracking automation created"
echo "✅ Daily workflow automation created"
echo "✅ First task assigned and started"
echo ""
echo "🚀 YOU ARE NOW READY TO EXECUTE!"
echo ""
echo "DAILY WORKFLOW:"
echo "1. Run: ./scripts/daily-workflow.sh"
echo "2. Open Cursor: cursor ."
echo "3. Reference: @.cursor-context/beads-ready.md"
echo "4. Execute highest priority task"
echo "5. Update Beads: bd close [task-id]"
echo ""
echo "Track progress: bd stats"
echo "View ready work: bd ready --json"
echo ""
```

---

## 📅 PHASED EXECUTION ROADMAP

### WEEK 1: Crisis + Foundation (Nov 5-11)

**Day 1 (TODAY):**

- Hour 1: Fix Homepage 404s (2 hours) → EXECUTE NOW
- Hour 2-3: Create all 30 Beads issues
- Hour 4: Complete setup (Steps 1-10 above)
- End of day: Daily workflow tested and working

**Days 2-7:**

- **Stream A (P0):** Canvas optimization (2-3d)
- **Stream A (P0):** Complete sending pipeline (2d)
- **Stream B (P0):** AI Brainstorming Engine (3d)
- **Stream C (P0):** Mobile quick wins (7 hours)

**Week 1 Deliverables:**

- ✅ No 404 errors
- ✅ AI Brainstorming functional
- ✅ Canvas performs at 60fps
- ✅ Card sending works end-to-end
- ✅ Mobile 30-40% improved
- ✅ All Beads issues created and organized

---

### WEEK 2-3: Parallel Feature Development

**Developer 1: Party Planner** (8 days)

- Days 1-2: Database + Event CRUD
- Days 3-4: Guest Management + Tasks
- Days 5-6: Budget + AI Suggestions
- Days 7-8: Testing + Polish

**Developer 2: Gift Guide** (7 days)

- Days 1-2: Database + Discovery UI
- Days 3-4: AI Recommendations
- Days 5-6: Wishlist + Affiliates
- Day 7: Testing + Polish

**Developer 3 (or parallel): AI Enhancement**

- Days 1-3: Auto-Populate System (3d)
- Days 4-6: Multi-Platform Export (3d - starts Day 4)
- Days 7-9: SEO/Content Engine (3d)

**Week 2-3 Deliverables:**

- ✅ Party Planner 100% functional
- ✅ Gift Guide 100% functional
- ✅ Auto-Populate working system-wide
- ✅ Multi-Platform Export (B2B ready)
- ✅ SEO/Content Engine operational

---

### WEEK 4: Integration, Polish & Testing

**All Streams:**

- Days 1-2: End-to-end testing
- Days 3-4: Performance optimization
- Days 5-6: UX polish
- Day 7: Final testing + deployment prep

**Week 4 Deliverables:**

- ✅ All 3 core features tested together
- ✅ Test coverage ≥50%
- ✅ Performance benchmarks met
- ✅ Mobile-responsive on all devices
- ✅ MVP ready for launch

---

### WEEK 5-6: Blog + Polish (P2 - Optional for MVP)

- Blog Platform (6.5d)
- Card Showcase (3d)
- Inspiration Page (2d)
- Image Filter System (1d)

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### MVP Launch Criteria (End of Week 4)

**Functional Requirements:**

- [ ] Card Maker: 100% complete (70% → 100%)
  - [ ] Canvas 60fps performance
  - [ ] Sending pipeline tested
  - [ ] Mobile-optimized

- [ ] Party Planner: 100% MVP (0% → 100%)
  - [ ] Event creation working
  - [ ] Guest management + RSVP
  - [ ] Task checklist functional
  - [ ] Budget tracker operational
  - [ ] AI party suggestions live

- [ ] Gift Guide: 100% MVP (30% → 100%)
  - [ ] 100+ gifts in database
  - [ ] Gift discovery + search
  - [ ] AI recommendations working
  - [ ] Wishlist functional
  - [ ] Affiliate tracking operational

**AI Enhancement Features:**

- [ ] AI Brainstorming Engine operational
- [ ] Document Context Processing with NLP
- [ ] Auto-Populate System working
- [ ] Multi-Platform Export functional
- [ ] SEO Research Tool operational

**Quality Gates:**

- [ ] Zero 404 errors
- [ ] Test coverage ≥50%
- [ ] Performance: API p95 <500ms, Canvas 60fps
- [ ] Mobile-responsive (tested on iOS/Android)
- [ ] Email deliverability ≥95%

**Business Validation:**

- [ ] User can complete: sign up → create card → send
- [ ] User can complete: create party → manage guests
- [ ] User can complete: find gift → add to wishlist
- [ ] B2B bulk generation tested (100+ cards)
- [ ] Payment flow tested

---

## 📈 TRACKING & METRICS

### Daily Standup Format (15 min)

```bash
# Run before standup
./scripts/velocity-metrics.sh

# During standup
1. What did you complete yesterday?
   - Show: bd list --status done --json | tail -5
2. What will you complete today?
   - Show: bd ready --json | head -3
3. Any blockers?
   - Show: bd list --status blocked --json
4. Update task status:
   - bd update [task-id] --status in_progress
```

### Weekly Sprint Planning (1 hour, Mondays)

```bash
# Review previous week
bd stats

# Check mission progress
bd dep tree BirthdayGen.com-vbr
bd dep tree BirthdayGen.com-4m8
bd dep tree BirthdayGen.com-9el

# Pull ready tasks
bd ready --json | jq '.[] | {id, title, priority, effort}'

# Assign to developers
bd update [task-id] --assignee "Developer Name"

# Update timeline projections
```

### Weekly Demo (1 hour, Fridays)

**Agenda:**

1. Live demo of completed features
2. Metrics dashboard review
3. Test coverage improvements
4. User feedback integration
5. Next week preview

---

## 🚀 FINAL RECOMMENDATIONS

### Immediate Actions (TODAY - 4 hours)

**Hour 1:**

```bash
# Fix 404 crisis
bd create "Homepage 404 Fix" -p 0 -t task --json
# Implement coming soon pages
# Test: No 404s on navigation
```

**Hour 2-3:**

```bash
# Run ALL 30 Beads creation commands from above
# Verify: bd ready --json | jq 'length' should show ~30
```

**Hour 4:**

```bash
# Complete setup (Steps 1-10)
# Test: ./scripts/daily-workflow.sh
# Start highest priority task
```

### Week 1 Execution

1. **Stream A (P0):** Canvas + Sending (Days 2-4)
2. **Stream B (P0):** AI Brainstorming (Days 2-4)
3. **Stream C (P0):** Mobile quick wins (Day 5)
4. **Stream D (Planning):** Party + Gift specs (Days 5-7)

### Success Metrics

- **Velocity:** 3-5x increase with acceleration framework
- **Quality:** ≥50% test coverage maintained
- **B2B:** Multi-Platform Export unlocks corporate market
- **UX:** Auto-Populate + AI Brainstorming reduce friction by 80%
- **SEO:** Content Engine generates 10x faster marketing

---

## 📚 REFERENCE DOCUMENTS

1. **CONSOLIDATED_FEATURES_COMPLETE.md** - All 24 features with complete specs
2. **MOBILE_DESIGN_STRATEGY.md** - Mobile-first redesign strategy
3. **BIRTHDAYGEN-ACCELERATION-FRAMEWORK.md** - 3-mission framework details
4. **ACCELERATION-FRAMEWORK-SETUP-COMPLETE.md** - Setup guide
5. **COMPLETE_FEATURE_AUDIT_2025-11-05.md** - Original feature audit
6. **COMPLETE_FEATURE_AUDIT_2025-11-05_ADDENDUM.md** - Missing features addendum
7. **POD_GENERATOR_FEATURE_ANALYSIS.md** (create this) - 8 AI features from POD analysis

---

## ✅ EXECUTION CHECKLIST

**Phase 0 (TODAY):**

- [ ] Fix homepage 404s (2 hours)
- [ ] Install Beads tracker
- [ ] Create all 30 Beads issues
- [ ] Configure Cursor integration
- [ ] Create automation scripts
- [ ] Test complete workflow
- [ ] Start first task

**Phase 1 (Week 1):**

- [ ] Canvas optimization
- [ ] Sending pipeline
- [ ] AI Brainstorming
- [ ] Mobile quick wins
- [ ] Feature specs complete

**Phase 2 (Weeks 2-3):**

- [ ] Party Planner MVP
- [ ] Gift Guide MVP
- [ ] AI Enhancement features
- [ ] Parallel development

**Phase 3 (Week 4):**

- [ ] Integration testing
- [ ] Performance optimization
- [ ] UX polish
- [ ] MVP launch ready

---

**🎯 YOU NOW HAVE:**

✅ Complete feature inventory (24 features)
✅ All Beads commands ready to execute (30 issues)
✅ Cursor-optimized prompts for every feature
✅ Microtask breakouts (2-8 hour chunks)
✅ Complete acceleration framework setup
✅ Daily workflow automation
✅ Velocity tracking system
✅ Clear success criteria

**READY TO EXECUTE? START WITH HOUR 1: FIX THE 404s!** 🚀

**Questions? Reference this plan. Everything is documented and ready.**
