# Master Execution Plan
**Generated:** 2025-12-29
**Architect:** Gemini 3 Pro (The Architect)
**Objective:** A comprehensive roadmap to resolve critical architectural debt, modernize the tech stack, and un-stall feature development based on a full temporal analysis of the project state.

---

## GROUP 1: CORE BLOCKERS (Sequential)
*These tasks address foundational issues in architecture, dependencies, and project configuration. They MUST be completed in order to unblock parallel development.*

### TASK T1 (Group 1)
**Title:** Resolve Project Identity Crisis & Stale Memory
**Source of Truth:** `.audit/LIVING_AUDIT.md` (Dec 27 Archive), `docs/audit/MEMORY_SYSTEM_AUDIT.md`
**Target Files:** `memory/persistent/project-state.json`, `*.md` files in root.
**Agent Prompt:**
> You are to resolve the core project configuration drift. First, update `memory/persistent/project-state.json`, renaming the project from "Mystic Arcana" to "BirthdayGen.com". Second, create a script at `scripts/ops/archive-root-docs.mjs` to move all `2025*.md`, `2025*.pdf`, and `2025*.docx` files from the project root into `docs/logs/`. This is a cleanup task to prepare for a unified knowledge base. NO STUBS permitted.
**Validation:**
> 1. Run `node scripts/ops/archive-root-docs.mjs` -> PASS, and root folder is clean.
> 2. `read_file` on `memory/persistent/project-state.json` confirms the name change.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T2 (Group 1)
**Title:** Modernize Core Tech Stack (Next.js, Prisma, AI SDK)
**Source of Truth:** `package.json`, Web Search Results from 2025-12-29
**Target Files:** `package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `tsconfig.json`, all `src/**/*.tsx` files.
**Agent Prompt:**
> Your task is to perform a major version upgrade of the core tech stack. This is a critical refactoring task to address significant technical debt.
> 1.  Reference the official migration guides for Next.js (14.x to 16.x), Prisma (6.x to 7.x), and the Vercel AI SDK (`ai` package v5 to v6).
> 2.  Update `package.json` with the latest stable versions: Next.js (`^16.1.1`), Prisma (`^7.2.0`), and `ai` (`^6.0.3`). Update `@supabase/ssr` to `^0.8.0`.
> 3.  Delete `pnpm-lock.yaml` and `node_modules`, then run `pnpm install`.
> 4.  Address all breaking changes. Pay special attention to the Vercel AI SDK and Next.js App Router changes.
> 5.  This task is purely for upgrading dependencies. Do NOT add or change features. NO STUBS permitted.
**Validation:**
> 1. Run `pnpm run build` -> PASS with zero errors.
> 2. Run `pnpm run dev` and confirm the application starts and core pages render.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T3 (Group 1)
**Title:** Implement Supabase-Native Authentication
**Source of Truth:** `package.json` showing `next-auth@4`, `.audit/LIVING_AUDIT.md` (Task `BirthdayGen.com-37yd`)
**Target Files:** `package.json`, `middleware.ts`, `src/app/`, `src/components/`
**Agent Prompt:**
> You are to replace the legacy `next-auth` v4 library with a modern, pure Supabase authentication solution using `@supabase/ssr`.
> 1.  Completely remove `next-auth` from the project dependencies and delete any related files (e.g., `pages/api/auth/[...nextauth].ts` if it exists).
> 2.  Implement user login, signup, and logout functionality using Supabase Auth UI or custom server components that call Supabase functions directly.
> 3.  Rewrite the `middleware.ts` to protect routes using the `@supabase/ssr` session management strategy.
> 4.  Ensure user sessions are handled via Supabase cookies and server-side helpers. All data must flow from the authenticated Supabase user object. NO STUBS permitted.
**Validation:**
> 1. Run `sh scripts/ops/validate_compliance.sh` -> PASS
> 2. A new user can sign up. An existing user can log in and log out. Protected routes are inaccessible to unauthenticated users.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T4 (Group 1)
**Title:** Implement RAG for Semantic Memory Retrieval
**Source of Truth:** `docs/audit/MEMORY_SYSTEM_AUDIT.md` (Gap Analysis)
**Target Files:** `supabase/migrations/`, `scripts/memory/`
**Agent Prompt:**
> You are to build the foundation for a Retrieval-Augmented Generation (RAG) system to fix the "Search Blindness" gap.
> 1.  Create a new Supabase database migration to add a table named `knowledge` with columns: `id` (uuid), `source_file` (text), `content` (text), and `embedding` (vector, 1536 dimensions).
> 2.  Create a new script: `scripts/memory/embed-docs.mjs`. This script will:
>     a. Scan the `docs/knowledge/` directory.
>     b. For each file, chunk the content into meaningful paragraphs.
>     c. Generate embeddings for each chunk using the Vercel AI SDK.
>     d. Upsert the content and embeddings into the `knowledge` table.
> 3.  All API keys and configuration must be loaded from environment variables. NO STUBS permitted.
**Validation:**
> 1. Run `supabase db push` to apply the migration.
> 2. Run `node scripts/memory/embed-docs.mjs` -> The `knowledge` table is successfully populated with data from the docs.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

---

## GROUP 2: INDEPENDENT MODULES (Parallel)
*With blockers removed, these feature and backend tasks can be worked on simultaneously.*

### TASK T5 (Group 2A: Frontend)
**Title:** Fix Critical UI/UX Bugs (Stickers & Gamification)
**Source of Truth:** `.audit/LIVING_AUDIT.md` (Tasks `nz1l` and `g49d`)
**Target Files:** `src/components/generator/`
**Agent Prompt:**
> Address two high-priority user experience issues in the generator.
> 1.  **Sticker UX (`nz1l`):** In the sticker component, fix the drag coordinates and implement logic to allow stickers to be repositioned or deleted after being placed on the canvas.
> 2.  **Gamification (`g49d`):** The audit identified an unexpected "surprise gift" trigger. Trace and completely remove this gamification feature from the card generation flow.
> 3.  The solution must be robust and clean. NO STUBS permitted.
**Validation:**
> 1. Run `sh scripts/ops/validate_compliance.sh` -> PASS
> 2. In the UI, stickers can be moved and deleted after placement. The surprise gift pop-up no longer appears.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T6 (Group 2B: Backend)
**Title:** Implement Generation Edge Function
**Source of Truth:** `.audit/LIVING_AUDIT.md` (Task `05e2`)
**Target Files:** `supabase/functions/generate/`
**Agent Prompt:**
> Create a new Supabase Edge Function for AI content generation.
> 1.  Inside `supabase/functions/`, create a new function named `generate`.
> 2.  The function must be protected and only callable by authenticated users. Use the Supabase function context to get the user's JWT.
> 3.  It will accept a `prompt` in the request body.
> 4.  Use the Vercel AI SDK to stream a text-based response from an AI model (e.g., Gemini).
> 5.  All model details and keys must come from environment variables. NO STUBS permitted.
**Validation:**
> 1. Run `supabase functions deploy generate`.
> 2. An authenticated request to the deployed function with a prompt returns a valid, streamed text response.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T7 (Group 2C: Content/Documentation)
**Title:** Migrate PDF/DOCX Documentation to Markdown
**Source of Truth:** `docs/` folder scan
**Target Files:** `docs/`
**Agent Prompt:**
> Your task is to improve the accessibility of the knowledge base by converting binary document formats to Markdown.
> 1.  Scan the `docs/` directory recursively.
> 2.  For every `.pdf` and `.docx` file found, read its content.
> 3.  Create a new `.md` file with the same name and in the same location, and write the converted text content into it.
> 4.  Ensure the generated Markdown is clean and readable. NO STUBS permitted.
**Validation:**
> 1. Run `sh scripts/ops/validate_compliance.sh` -> PASS
> 2. A side-by-side comparison shows that the content from a sample PDF/DOCX has been accurately converted to a new Markdown file.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T8 (Group 2A: Frontend)
**Title:** Feature - Party Planner UI
**Source of Truth:** `docs/FEATURES.md` (Feature 2)
**Target Files:** `src/app/party-planner`, `src/components/party-planner`
**Agent Prompt:**
> You are to build the complete frontend for the "Party Planner" feature.
> 1. Create a new route at `/party-planner`.
> 2. Build all necessary UI components, including a dashboard, guest list management, task checklist, and budget tracker, placing them in `src/components/party-planner`.
> 3. Connect the UI to the backend API endpoints for parties, guests, tasks, and expenses. All data must be fetched live.
> 4. Implement client-side state management for a smooth user experience. NO STUBS permitted.
**Validation:**
> 1. Run `sh scripts/ops/validate_compliance.sh` -> PASS
> 2. A user can create a party, add guests, add tasks, and track expenses through the UI.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T9 (Group 2B: Backend)
**Title:** Feature - Party Planner Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 2)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/party-api`
**Agent Prompt:**
> You are to build the complete backend for the "Party Planner" feature.
> 1. Add the `Party`, `PartyGuest`, `PartyTask`, and `PartyExpense` models to the `prisma/schema.prisma` file as defined in `docs/FEATURES.md`.
> 2. Create a new Supabase Edge Function at `supabase/functions/party-api` to handle all CRUD operations for parties, guests, tasks, and expenses.
> 3. Secure all endpoints; only authenticated users should be able to access their own party data. Implement Row Level Security policies.
> 4. NO STUBS permitted. All data must be persisted to the database.
**Validation:**
> 1. Run `prisma db push` -> PASS.
> 2. API endpoints for creating, reading, updating, and deleting party data are functional and secure.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T10 (Group 2A: Frontend)
**Title:** Feature - Gift Guide UI
**Source of Truth:** `docs/FEATURES.md` (Feature 3)
**Target Files:** `src/app/gifts`, `src/components/gifts`
**Agent Prompt:**
> You are to build the frontend for the "Gift Guide" feature.
> 1. Create a new route at `/gifts` and a details page at `/gifts/[id]`.
> 2. Build UI components for a gift grid, gift cards, search, and filtering.
> 3. Implement a "Wishlist" feature allowing users to add and manage wishlisted items.
> 4. Connect all UI components to their corresponding backend APIs for live data. NO STUBS permitted.
**Validation:**
> 1. Run `sh scripts/ops/validate_compliance.sh` -> PASS
> 2. Users can browse, search, and view gifts. They can add and remove items from their wishlist.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T11 (Group 2B: Backend)
**Title:** Feature - Gift Guide & Wishlist Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 3)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/gift-api`, `prisma/seed.ts`
**Agent Prompt:**
> You are to build the backend for the "Gift Guide" feature.
> 1. Add the `Gift`, `Wishlist`, and `WishlistItem` models to the `prisma/schema.prisma` file.
> 2. Create a seed script in `prisma/seed.ts` to populate the `Gift` table with at least 100 gift ideas.
> 3. Create a new Supabase Edge Function at `supabase/functions/gift-api` to handle CRUD operations for gifts and wishlists.
> 4. Secure all endpoints to ensure users can only access their own wishlists. NO STUBS permitted.
**Validation:**
> 1. Run `prisma db push` and `prisma db seed` -> PASS.
> 2. API endpoints for managing gifts and wishlists are functional and secure.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T12 (Group 2C: Documentation)
**Title:** Create Full Feature Documentation
**Source of Truth:** `docs/FEATURES.md`
**Target Files:** `docs/features/`
**Agent Prompt:**
> Your task is to create detailed documentation for all 24 features of the application.
> 1. For each of the 24 features listed in `docs/FEATURES.md`, create a new markdown file inside a new `docs/features/` directory (e.g., `docs/features/01-card-generator.md`).
> 2. Each file should contain the detailed breakdown, purpose, schema, and task list as specified in the source document.
> 3. The goal is to have a dedicated, permanent file for each feature's full specification. NO STUBS permitted.
**Validation:**
> 1. `ls -l docs/features/` shows 24 markdown files.
> 2. The content of each file accurately reflects the information in `docs/FEATURES.md`.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T15 (Group 2B: Backend)
**Title:** Feature - Blog Platform Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 4)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/blog-api`
**Agent Prompt:**
> You are to build the backend for the "Blog Platform" feature. This includes a CMS for admins.
> 1. Add the `BlogPost`, `BlogCategory`, `BlogTag`, and related join table models to the `prisma/schema.prisma` file.
> 2. Create a Supabase Edge Function at `supabase/functions/blog-api` for all public-facing and admin-only CRUD operations.
> 3. Public endpoints (GET posts) should be open. Admin endpoints (POST, PUT, DELETE) must be secured and only accessible by users with an 'admin' role.
> 4. Implement logic for a sitemap and RSS feed generation. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` PASSES. Admin users can create/edit posts via the API; public users can read them.
> 2. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T16 (Group 2A: Frontend)
**Title:** Feature - Blog Platform Frontend & CMS UI
**Source of Truth:** `docs/FEATURES.md` (Feature 4)
**Target Files:** `src/app/blog`, `src/app/admin`, `src/components/blog`
**Agent Prompt:**
> You are to build the complete frontend for the "Blog Platform" and its associated admin CMS.
> 1. Create public-facing routes: `/blog` for the listing, `/blog/[slug]` for single posts.
> 2. Create admin routes under `/admin/blog` for creating and editing posts. Use a rich text editor like TipTap for the content field.
> 3. All data must be fetched live from the `blog-api` you are building in parallel.
> 4. The homepage component that shows placeholder blog posts must be updated to fetch real, featured posts. NO STUBS permitted.
**Validation:**
> 1. Public users can read blog posts. Admin users can log in and manage posts.
> 2. Homepage shows a list of real blog posts.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T17 (Group 2B: Backend)
**Title:** Feature - Automation Engine Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 5 & 12)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/automation-engine`
**Agent Prompt:**
> You are to build the backend for the "Automation Engine" to automatically send gifts/cards.
> 1. Create a database schema for storing automation rules (e.g., `AutomationRule` model linked to a contact and an event like a birthday).
> 2. Create a new Supabase Edge Function at `supabase/functions/automation-engine`.
> 3. This function will be triggered by a cron job (`supabase/config.toml`). It will query for automations that need to be run (e.g., upcoming birthdays).
> 4. For each due automation, it will call the `generate` and `send` card functions, and integrate with the gift coordination logic.
> 5. The engine must have robust logging and retry mechanisms. NO STUBS permitted.
**Validation:**
> 1. A new automation rule can be created via an API endpoint.
> 2. When the cron job is manually triggered, an automation runs successfully and a card is sent.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T18 (Group 2B: Backend)
**Title:** Feature - AI Brainstorming Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 20)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/brainstorm-api`
**Agent Prompt:**
> Build the backend for the AI Brainstorming Engine.
> 1. Add `BrainstormSession` and `RecipientContext` models to `prisma/schema.prisma`.
> 2. Create a `brainstorm-api` Edge Function that accepts a theme and optional document context.
> 3. The function will use the Gemini API (via Vercel AI SDK) to generate 5 creative concepts and perform NLP extraction on any provided documents.
> 4. Store the session and extracted context in the new database tables. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` PASSES.
> 2. Calling the `brainstorm-api` endpoint with a theme returns 5 structured ideas.
> 3. Calling with a document context correctly extracts and stores themes and entities.
> 4. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T19 (Group 2A: Frontend)
**Title:** Feature - AI Brainstorming UI
**Source of Truth:** `docs/FEATURES.md` (Feature 20)
**Target Files:** `src/components/brainstorm`, `src/app/generator/page.tsx`
**Agent Prompt:**
> Integrate the AI Brainstorming feature into the main Card Generator UI.
> 1. Create a "Need Inspiration?" button in the generator UI.
> 2. On click, open a dialog (`BrainstormDialog.tsx`) that contains an input for a theme and an optional file upload for recipient context.
> 3. On submit, call the `brainstorm-api` Edge Function.
> 4. Display the 5 returned ideas as clickable cards. When a card is clicked, apply the concept (e.g., pre-fill the card's text or theme) to the main generator. NO STUBS permitted.
**Validation:**
> 1. The brainstorm dialog appears and successfully calls the backend.
> 2. Generated ideas are displayed correctly, and clicking an idea updates the main card generator state.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T20 (Group 2B: Backend)
**Title:** Feature - SEO/Content Engine Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 21)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/seo-engine`
**Agent Prompt:**
> Build the backend for the SEO/Content Research Engine.
> 1. Add `ResearchProfile` and `GeneratedContent` models to `prisma/schema.prisma`.
> 2. Create a `research-topic` Edge Function that uses the Gemini API with the Google Search tool to find keywords, hashtags, and hooks for a given topic.
> 3. Create a `generate-content` Edge Function that takes a `researchProfileId` and generates a full blog post or social media captions.
> 4. Store all research and generated content in the database. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` PASSES.
> 2. The `research-topic` function returns a structured JSON with keywords and hashtags for a given topic.
> 3. The `generate-content` function creates a plausible, SEO-rich blog post.
> 4. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T21 (Group 2B: Backend)
**Title:** Feature - Multi-Platform Export Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 22)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/export-api`
**Agent Prompt:**
> Build the backend for the B2B Multi-Platform Export feature.
> 1. Add `ExportTemplate`, `BulkExport`, and `ApiKey` models to `prisma/schema.prisma`.
> 2. Create an `export-api` Edge Function to handle bulk export requests. It should use a background job queue for processing.
> 3. Implement a template system to format card data into HTML (for email), rich text (for Slack), and high-resolution images (for print).
> 4. Create endpoints for managing API keys for B2B customers. NO STUBS permitted.
**Validation:**
> 1. A bulk export request for 10 cards successfully completes and provides a download URL.
> 2. An API key can be generated and used to authenticate with the export API.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T22 (Group 2B: Backend)
**Title:** Feature - Auto-Populate System Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 23)
**Target Files:** `src/lib/autofill.ts`, `supabase/functions/autofill-api`
**Agent Prompt:**
> Build the backend logic for the Auto-Populate & Smart Defaults system.
> 1. Create a new library file `src/lib/autofill.ts` containing an `AutofillEngine` class.
> 2. Implement the logic to suggest themes, tones, and colors based on a contact's properties (age, relationship, aura), as outlined in `docs/FEATURES.md`.
> 3. Create an `autofill-api` Edge Function that takes a `contactId` and returns a JSON object of `CardDefaults`.
> 4. This system should read from the database and use existing context; do not invent new logic. NO STUBS permitted.
**Validation:**
> 1. The `autofill-api` endpoint returns a rich `CardDefaults` object for a given contact.
> 2. The suggestions are contextually relevant (e.g., a "heartfelt" tone for a "parent").
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T23 (Group 2A: Frontend)
**Title:** Feature - Card Showcase Frontend
**Source of Truth:** `docs/FEATURES.md` (Feature 6)
**Target Files:** `src/app/showcase`, `src/components/showcase`
**Agent Prompt:**
> Build the frontend for the "Card Showcase" feature.
> 1. Create the `/showcase` route with a responsive grid to display public cards.
> 2. Implement filtering by occasion, aura, and style. Include a search bar.
> 3. In the card generator, add a "Publish to Showcase" option in the export/share flow.
> 4. Ensure all data is fetched live from the backend. NO STUBS permitted.
**Validation:**
> 1. Users can view and filter cards on the `/showcase` page.
> 2. Users can successfully publish their own cards to the showcase.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T24 (Group 2B: Backend)
**Title:** Feature - Card Showcase Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 6)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/showcase-api`
**Agent Prompt:**
> Build the backend for the "Card Showcase" feature.
> 1. Add `ShowcaseCard` and `ShowcaseLike` models to `prisma/schema.prisma`.
> 2. Create a `showcase-api` Edge Function to handle fetching public cards, filtering, and liking/unliking cards.
> 3. Implement an endpoint that allows a user to mark one of their own cards as public for the showcase.
> 4. All endpoints must be appropriately secured. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` PASSES.
> 2. The API correctly returns a list of public cards and allows liking.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T25 (Group 2A: Frontend)
**Title:** Feature - Community & User Profiles Frontend
**Source of Truth:** `docs/FEATURES.md` (Feature 7)
**Target Files:** `src/app/community`, `src/app/profile`, `src/components/community`
**Agent Prompt:**
> Build the frontend for the Community feature.
> 1. Create a user profile page at `/profile/[userId]` that displays a user's bio, avatar, and created cards.
> 2. Create an "Edit Profile" page for the authenticated user.
> 3. Implement a follow/unfollow button on profile pages.
> 4. Create a basic activity feed at `/community` showing recent public actions. NO STUBS permitted.
**Validation:**
> 1. A user can view another user's profile and follow them.
> 2. A user can edit their own profile information.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T26 (Group 2B: Backend)
**Title:** Feature - Community & User Profiles Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 7)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/community-api`
**Agent Prompt:**
> Build the backend for the Community feature.
> 1. Add `UserProfile` and `UserFollow` models to `prisma/schema.prisma`.
> 2. Create a `community-api` Edge Function to handle fetching user profiles, following/unfollowing users, and retrieving an activity feed.
> 3. Secure endpoints appropriately. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` PASSES.
> 2. API endpoints for profile and follow management are functional and secure.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T27 (Group 2A: Frontend)
**Title:** Feature - Inspiration Page Frontend
**Source of Truth:** `docs/FEATURES.md` (Feature 8)
**Target Files:** `src/app/inspiration`, `src/components/inspiration`
**Agent Prompt:**
> Build the frontend for the "Inspiration" page.
> 1. Create the `/inspiration` route.
> 2. Build a responsive grid of `InspirationCard` components fetched from the backend.
> 3. Implement category filters and a "Save to Favorites" button on each card. NO STUBS permitted.
**Validation:**
> 1. The `/inspiration` page displays a grid of items.
> 2. Users can filter items and add them to their favorites.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T28 (Group 2B: Backend)
**Title:** Feature - Inspiration Page Backend
**Source of Truth:** `docs/FEATURES.md` (Feature 8)
**Target Files:** `prisma/schema.prisma`, `supabase/functions/inspiration-api`, `prisma/seed.ts`
**Agent Prompt:**
> Build the backend for the "Inspiration" page.
> 1. Add `InspirationItem` and `InspirationFavorite` models to `prisma/schema.prisma`.
> 2. Update the seed script to populate at least 50 inspiration items.
> 3. Create an `inspiration-api` Edge Function to fetch items and manage user favorites. NO STUBS permitted.
**Validation:**
> 1. `prisma db push` and `prisma db seed` PASS.
> 2. The API returns a list of inspiration items and correctly manages favorites.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T29 (Group 2B: Backend)
**Title:** Feature - Test Payment Integration
**Source of Truth:** `docs/FEATURES.md` (Feature 14)
**Target Files:** `supabase/functions/create-checkout`, `src/app/subscribe`
**Agent Prompt:**
> Your task is to fully test and validate the existing Stripe payment integration.
> 1. Review the `create-checkout` edge function and the frontend subscription flow.
> 2. Write an E2E test using Playwright that simulates a user purchasing a subscription.
> 3. The test must use Stripe's test card numbers and validate that a successful payment results in the correct subscription status in the database.
> 4. Test the webhook handler to ensure it correctly processes events from Stripe. NO STUBS permitted.
**Validation:**
> 1. The E2E test for payments passes successfully.
> 2. A test payment in the Stripe dashboard is correctly reflected in the application's database.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T30 (Group 2A: Frontend)
**Title:** Feature - Mobile Optimization Pass
**Source of Truth:** `docs/FEATURES.md` (Feature 15)
**Target Files:** `src/`
**Agent Prompt:**
> Perform a full mobile optimization pass on the application.
> 1. Audit all primary pages and components for responsiveness, touch-target size, and layout issues on mobile viewports.
> 2. Address the "Quick Wins" identified in `docs/FEATURES.md`, starting with the homepage hero and tool cards.
> 3. Focus on the Card Generator, ensuring the canvas and toolbars are usable on mobile. NO STUBS permitted.
**Validation:**
> 1. All major pages are usable and look polished on a 375px wide viewport.
> 2. The Card Generator canvas is functional on mobile.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T31 (Group 2A: Frontend)
**Title:** Feature - Static Pages (About, Contact, Privacy)
**Source of Truth:** `docs/FEATURES.md` (Features 16, 17, 18)
**Target Files:** `src/app/about`, `src/app/contact`, `src/app/privacy`
**Agent Prompt:**
> Create the three standard static pages for the application.
> 1. Create a simple, styled "About Us" page at `/about`.
> 2. Create a "Contact Us" page at `/contact` with a basic form that submits to a placeholder API endpoint.
> 3. Create a "Privacy Policy" page at `/privacy`.
> 4. All content should be professional but can be placeholder text (Lorem Ipsum is acceptable here).
**Validation:**
> 1. The `/about`, `/contact`, and `/privacy` routes render without errors.
> 2. The contact form is visible.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T32 (Group 2A: Frontend)
**Title:** Feature - Image Filters & Enhancement UI
**Source of Truth:** `docs/FEATURES.md` (Feature 24)
**Target Files:** `src/components/generator/`
**Agent Prompt:**
> Implement a professional-grade image filter and enhancement UI within the card generator.
> 1. Add a new panel to the generator's toolbar for "Image Effects".
> 2. Inside this panel, add sliders for Brightness, Contrast, and Saturation that apply filters to the selected image on the canvas in real-time.
> 3. Add a set of one-click preset buttons for styles like "Vintage", "Vibrant", and "Black & White".
> 4. The filter values must be baked into the image data when the user saves or exports the card. NO STUBS permitted.
**Validation:**
> 1. The Image Effects panel is visible and interactive in the card generator.
> 2. Applying a filter or preset correctly modifies the appearance of an image on the canvas.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

---

## GROUP 3: INTEGRATION & VALIDATION

### TASK T13 (Group 3)
**Title:** Establish E2E Testing Infrastructure
**Source of Truth:** `docs/FEATURES.md` (Critical Gap F13)
**Target Files:** `e2e/`, `playwright.config.ts`
**Agent Prompt:**
> You are to set up the entire End-to-End (E2E) testing framework for the project using Playwright.
> 1.  Initialize Playwright in the project and create a configuration file `playwright.config.ts`.
> 2.  Create a test spec `e2e/auth.spec.ts` that covers the full user authentication flow: signup, logout, and login.
> 3.  Create a test spec `e2e/core-generation.spec.ts` that logs a user in, navigates to the generator, submits a prompt, and waits for a response.
> 4.  All tests must pull sensitive data like user credentials from environment variables, not from hardcoded values. NO STUBS permitted.
**Validation:**
> 1. Run `npx playwright test` -> All new E2E tests must pass without error.
> 2. The test report should show successful execution of both the auth and generation specs.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.

### TASK T14 (Group 3)
**Title:** Final Build Validation & Zombie Check
**Source of Truth:** `.audit/LIVING_AUDIT.md` (Task `22vz`)
**Target Files:** `next.config.mjs`, `tsconfig.json`
**Agent Prompt:**
> Your final task before deployment is to ensure the production build is clean and stable.
> 1.  Run `pnpm run build`. Analyze and fix any errors that arise. The previous "TypeError: Cannot read properties of null (reading 'hash')" error is a key target if it reappears after the dependency upgrades.
> 2.  Investigate the `tsconfig.json` and `next.config.mjs` for any misconfigurations that could lead to "zombie" processes or build instability.
> 3.  Remove the `.next` directory before the final build to ensure a clean state. NO STUBS permitted.
**Validation:**
> 1. Run `rm -rf .next && pnpm run build` -> The command completes with a final status of "PASS" and zero errors.
> 2. The application successfully starts in production mode via `pnpm run start`.
> 3. Fill `docs/audit/VIOLATION_REPORT_TEMPLATE.md`.
