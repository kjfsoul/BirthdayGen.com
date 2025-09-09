
---

# `SUPABASE_SCHEMA.md`

```markdown
# Supabase Schema – BirthdayGen (Human Snapshot)

> Source of truth is **SQL in `supabase/migrations/`** and the live Supabase project.  
> This document summarizes the tables, key columns, relationships, and extensions so engineers/LLMs can navigate quickly.

---

## Connection & Auth

- **Project URL:** `https://<PROJECT_REF>.supabase.co`
- **Public client keys:**  
  - `NEXT_PUBLIC_SUPABASE_URL`  
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- **Server connection (Prisma):**  
  - `DATABASE_URL="postgresql://postgres:<password>@db.<PROJECT_REF>.supabase.co:5432/postgres"`

> Keep secrets in `.env.local` and **do not commit**. Add placeholders to `.env.example`.

---

## Schemas

- `auth`, `extensions`, `graphql`, `graphql_public`, `public`, `realtime`, `storage`, `vault`

---

## Extensions

- `pg_graphql@1.5.11`, `pg_stat_statements@1.10`, `pgcrypto@1.3`, `pgjwt@0.2.0`, `plpgsql@1.0`, `supabase_vault@0.3.1`, `uuid-ossp@1.1`

---

## Tables (public)

> Below is the working set referenced by the app. See migrations for full DDL.

- `artwork_generations` — AI render jobs (`workflow_id`, `concept_id`, `artwork_url`, JSON metadata/specs)
- `aura_quiz_responses` — per-user Aura quiz (`user_id UUID`, `responses jsonb`, `result`, `created_at`)
- `bg_asset_occasions` — M2M: vault_asset ↔ occasion
- `bg_ingest_log` — asset & template ingest logs (`run_id uuid`, `source`, `tags text[]`, `status`)
- `bg_occasions` — canonical occasions (`slug`, `label`)
- `bg_user_vault` — user ↔ asset bookmark
- `card_designs` — visual configuration for a message/card (`font_*`, `text_color`, `sparkle_effects jsonb`, `custom_image_url`)
- `cards` — user cards (`user_id uuid`, `contact_id int`, `title`, `message`, `template`, `elements jsonb`, `status`, `sent_at`)
- `contacts` — recipients (`email`, `first_name`, `last_name`, `phone`, `birthday_date`, `relationship`, `aura_type`, `user_id uuid`)
- `gift_recommendations` — AI gift suggestions (`user_id`, `contact_id`, `aura_type`, `recommendations jsonb`)
- `legal_validations` — policy/compliance output (`workflow_id`, `concept_id`, `compliance_status`, `legal_score`, `recommendations json`)
- `messages` — content payloads (two id variants appear in export; canonicalize to **one**: prefer `id uuid` + `content text`, plus delivery fields)
- `premium_messages` — paid content linked to `purchases`
- `product_concepts` — ideation (`title`, `description`, scores, categories)
- `product_publications` — outbound listings/publications
- `profiles` — user profile row keyed by `id uuid` (should map to `auth.users.id`)
- `purchases` — commerce tracking (`email`, `original_message_id`, `stripe_checkout_session_id`, `status`)
- `trend_analyses` — analytics jobs/outputs
- `users` — **(WARNING)** mixed definitions in export (dup fields). Use **Supabase `auth.users`** as canonical auth table and keep `profiles` as app-level profile.
- `vault_assets` — media library (Pexels, metadata, `src jsonb`, tags[])
- `vault_collection_items` — M2M: collection ↔ asset
- `vault_collections` — user or brand collections
- `workflow_executions` — workflow run logs/results

> **Note on `users` vs `profiles`:** In Supabase projects, application profile data typically lives in `public.profiles` keyed by `id uuid` = `auth.users.id`. Treat `auth.users` as canonical identity and prefer `profiles` for app fields (name, aura, flags). Avoid duplicating auth fields in `public.users`.

---

## Foreign Keys (selected)

- `premium_messages.purchase_id` → `purchases.id`
- `cards.contact_id` → `contacts.id`
- `gift_recommendations.contact_id` → `contacts.id`
- `purchases.original_message_id` → `messages.id`
- `card_designs.message_id` → `messages.id`
- `vault_collection_items.asset_id` → `vault_assets.id`
- `vault_collection_items.collection_id` → `vault_collections.id`
- `bg_user_vault.asset_id` → `vault_assets.id`
- `bg_asset_occasions.asset_id` → `vault_assets.id`
- `bg_asset_occasions.occasion_id` → `bg_occasions.id`

---

## Typical App Joins

- **Card → Contact:** `cards.contact_id = contacts.id`
- **Card → Design:** `card_designs.message_id = messages.id` (or join by a dedicated `card_id` if schema evolves)
- **Profile → Auth:** `profiles.id = auth.users.id`

---

## RLS (Row Level Security)

- Ensure per-table policies allow the signed-in user (JWT subject) to access **only** their rows.
- Common patterns:
  - `user_id = auth.uid()` on user-owned tables (`cards`, `contacts`, `gift_recommendations`, etc.)
  - Read-only public lookups (e.g., `bg_occasions`) can be unrestricted or have permissive policies.
- JWT propagation required for server-side calls hitting RLS-protected tables.

> Policies live under `supabase/migrations/*policy*.sql` or equivalent. Keep policy changes in migrations.

---

## Alignment with Prisma

- **DB-first flow:** use `npx prisma db pull` to sync schema into `prisma/schema.prisma`.
- **Client:** `src/lib/db.ts` creates a singleton `PrismaClient`.
- **Enums & Arrays:** Confirm Prisma mapping for Postgres `text[]` and JSON/JSONB fields (Prisma supports `Json` and `String[]`).
- **UUIDs:** Keep `id uuid` where needed (e.g., `profiles.id`). Use default UUID gen at DB or app layer consistently.

---

## Known Normalization Fixes (Recommended)

- **messages.id** — choose a single primary key type (recommend **UUID**). Remove duplicate integer id version from app layer.
- **users table duplication** — prefer `auth.users` + `public.profiles`; avoid storing passwords or auth fields in `public.users`.
- **cards ↔ designs ↔ messages** — decide a single canonical linkage (`card_id` on `card_designs` or `message_id`); update services accordingly.

---

## Example Queries

```sql
-- All cards for current user (RLS will also enforce this if enabled)
select c.*
from cards c
where c.user_id = auth.uid();

-- Card with contact and design metadata
select c.*, ct.first_name, ct.last_name, cd.font_family, cd.text_color
from cards c
left join contacts ct on ct.id = c.contact_id
left join card_designs cd on cd.message_id = c.id::uuid  -- adjust if design links differently
where c.user_id = auth.uid();
