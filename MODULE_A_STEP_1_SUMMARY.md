# Module A - Step 1: Supabase Migration Schema

## Summary

Created comprehensive Supabase migration schema (`supabase/migrations/20251121_init_schema.sql`) with three core tables:
1. **contacts**: Stores user contact information aligned with `ContactInput` interface (emails, birthday, social handles, interests)
2. **enriched_data**: Stores AI-enriched predictions (birthday, relationship, archetypes, gifting profile) aligned with `EnrichedContact` interface
3. **gift_ideas**: Stores gift recommendation requests/results with full JSONB recommendations array aligned with `RecommendationRequest/Response` interfaces

All tables include RLS policies for user data isolation, performance indexes on key columns, and automatic `updated_at` triggers.

## Files Created

- `supabase/migrations/20251121_init_schema.sql` (342 lines)

## Schema Alignment

### TypeScript → PostgreSQL Mapping

**ContactInput → contacts table:**
- `fullName` → `full_name TEXT`
- `emails[]` → `emails TEXT[]`
- `birthday: {year, month, day}` → `birthday_year INT, birthday_month INT, birthday_day INT`
- `social_handles: Record<string, string>` → `social_handles JSONB`
- `interests: Record<string, any>` → `interests JSONB`

**EnrichedContact → enriched_data table:**
- `predictedBirthday: {month, day, confidence, reasoning}` → 4 columns with constraints
- `inferredRelationship: {type, confidence, reasoning}` → 3 columns
- `archetypes: Archetype[]` → `archetypes JSONB` array
- `giftingProfile: GiftingProfile` → `gifting_profile JSONB`
- `enrichmentMetadata` → `enrichment_metadata JSONB`

**RecommendationRequest/Response → gift_ideas table:**
- `budget: {min, max, preferred}` → `budget_min DECIMAL, budget_max DECIMAL, budget_preferred DECIMAL`
- `recommendations: GiftRecommendation[]` → `recommendations JSONB` array
- `engagementAnswers` → `engagement_data JSONB`

## Testing Commands

### 1. Validate SQL syntax
```bash
cd /home/ubuntu/github_repos/birthdaygen.com
supabase db diff --check
```

### 2. Apply migration (local development)
```bash
supabase db reset
# Or for new migrations only:
supabase migration up
```

### 3. Verify schema creation
```bash
supabase db inspect
# Check tables exist:
psql $DATABASE_URL -c "\dt"
# Check RLS policies:
psql $DATABASE_URL -c "\d+ contacts"
```

### 4. Test RLS policies
```sql
-- As authenticated user
SELECT * FROM contacts WHERE user_id = auth.uid();
INSERT INTO contacts (user_id, full_name, emails) VALUES (auth.uid(), 'Test', ARRAY['test@example.com']);
```

## Key Features

✅ **RLS Enabled**: All tables have user-isolated policies via `auth.uid()`
✅ **Type-Safe**: Field types and constraints match TypeScript interfaces exactly
✅ **Indexed**: Performance indexes on `user_id`, `contact_id`, `created_at`, `occasion`, `status`
✅ **JSONB Storage**: Complex nested objects (archetypes, gifting_profile, recommendations) stored efficiently
✅ **Cascading Deletes**: Foreign keys ensure referential integrity
✅ **Auto-Timestamps**: Triggers maintain `updated_at` automatically

## Next Steps

1. Apply this migration to your Supabase project
2. Verify schema in Supabase Dashboard
3. Proceed to updating API routes to use real database queries

## Notes

- No mocks, no fake data—pure schema definition
- All constraints match TypeScript types (0-100 for confidence, 1-12 for months, etc.)
- `enriched_data` has `UNIQUE(contact_id)` to ensure one enrichment per contact
- Gift ideas can have multiple entries per contact/occasion combination
