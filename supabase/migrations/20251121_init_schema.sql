-- ============================================================================
-- BirthdayGen Phase 4 Module A: Database Schema Migration
-- Created: 2025-11-21
-- Purpose: Real database persistence for contacts, enrichment, and gift ideas
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ============================================================================
-- This ensures clean schema creation and prevents type conflicts

DROP TABLE IF EXISTS gift_ideas CASCADE;
DROP TABLE IF EXISTS enriched_data CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- ============================================================================
-- TABLE: contacts
-- ============================================================================
-- Stores user contact information with basic profile data
-- Aligned with ContactInput interface from src/lib/autopopulate/types.ts

CREATE TABLE IF NOT EXISTS contacts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User association (references auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contact details (from ContactInput interface)
  full_name TEXT,
  emails TEXT[], -- Array of email addresses
  phone TEXT,

  -- Birthday information
  birthday_year INTEGER,
  birthday_month INTEGER CHECK (birthday_month >= 1 AND birthday_month <= 12),
  birthday_day INTEGER CHECK (birthday_day >= 1 AND birthday_day <= 31),

  -- Profile data
  gender TEXT,
  urls TEXT[], -- Array of URLs (social profiles, websites)
  photo_url TEXT,
  social_handles JSONB DEFAULT '{}', -- Key-value pairs of platform: handle
  interests JSONB DEFAULT '{}', -- Structured interest data

  -- Additional fields
  relationship TEXT, -- Enum: family, close_friend, friend, colleague, etc.
  notes TEXT, -- User-added notes

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: enriched_data
-- ============================================================================
-- Stores AI-enriched data for contacts (birthday predictions, relationships, archetypes)
-- Aligned with EnrichedContact interface from src/lib/autopopulate/types.ts

CREATE TABLE IF NOT EXISTS enriched_data (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact association
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Predicted birthday
  predicted_birthday_month INTEGER CHECK (predicted_birthday_month >= 1 AND predicted_birthday_month <= 12),
  predicted_birthday_day INTEGER CHECK (predicted_birthday_day >= 1 AND predicted_birthday_day <= 31),
  birthday_confidence INTEGER CHECK (birthday_confidence >= 0 AND birthday_confidence <= 100),
  birthday_reasoning TEXT,

  -- Inferred relationship
  inferred_relationship TEXT, -- Enum: family, close_friend, friend, colleague, etc.
  relationship_confidence INTEGER CHECK (relationship_confidence >= 0 AND relationship_confidence <= 100),
  relationship_reasoning TEXT,

  -- Archetypes (array of archetype objects with id, name, tags, confidence)
  archetypes JSONB DEFAULT '[]',

  -- Gifting profile (style, preferences, budget range, interests)
  gifting_profile JSONB DEFAULT '{}',

  -- Enrichment metadata
  enrichment_metadata JSONB DEFAULT '{}', -- Stores enrichedAt, version, fieldsEnriched, confidence scores, privacyConsent

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one enrichment record per contact
  UNIQUE(contact_id)
);

-- ============================================================================
-- TABLE: gift_ideas
-- ============================================================================
-- Stores gift recommendation requests and results
-- Aligned with RecommendationRequest/Response from src/lib/gifts/schema.ts

CREATE TABLE IF NOT EXISTS gift_ideas (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Associations
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request parameters
  occasion TEXT NOT NULL, -- Enum: birthday, christmas, anniversary, etc.
  budget_min DECIMAL(10, 2) NOT NULL CHECK (budget_min >= 0),
  budget_max DECIMAL(10, 2) NOT NULL CHECK (budget_max >= budget_min),
  budget_preferred DECIMAL(10, 2),

  -- Optional filters
  exclude_categories TEXT[], -- Array of category strings
  preferred_categories TEXT[], -- Array of category strings
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  shipping_required BOOLEAN DEFAULT true,
  gift_message TEXT,

  -- Recommendations (array of GiftRecommendation objects)
  -- Each recommendation includes: id, product, confidence, reasoning, matchFactors, whyThisGift, etc.
  recommendations JSONB DEFAULT '[]',

  -- Engagement game data (threeWords, pickTheirVibe answers)
  engagement_data JSONB DEFAULT '{}',

  -- Response metadata
  recipient_summary TEXT, -- AI-generated summary of recipient
  top_categories TEXT[], -- Top matching categories
  total_matches INTEGER DEFAULT 0,
  processing_time_ms INTEGER, -- Processing time in milliseconds

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON contacts(birthday_month, birthday_day);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship ON contacts(relationship);

-- Enriched data table indexes
CREATE INDEX IF NOT EXISTS idx_enriched_data_contact_id ON enriched_data(contact_id);
CREATE INDEX IF NOT EXISTS idx_enriched_data_created_at ON enriched_data(created_at DESC);

-- Gift ideas table indexes
CREATE INDEX IF NOT EXISTS idx_gift_ideas_contact_id ON gift_ideas(contact_id);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_user_id ON gift_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_occasion ON gift_ideas(occasion);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_status ON gift_ideas(status);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_created_at ON gift_ideas(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriched_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_ideas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: contacts
-- ============================================================================

-- Users can view their own contacts
CREATE POLICY "Users can view own contacts"
  ON contacts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own contacts
CREATE POLICY "Users can insert own contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contacts
CREATE POLICY "Users can update own contacts"
  ON contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete own contacts"
  ON contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: enriched_data
-- ============================================================================

-- Users can view enrichment data for their contacts
CREATE POLICY "Users can view enrichment data for own contacts"
  ON enriched_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = enriched_data.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Users can insert enrichment data for their contacts
CREATE POLICY "Users can insert enrichment data for own contacts"
  ON enriched_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = enriched_data.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Users can update enrichment data for their contacts
CREATE POLICY "Users can update enrichment data for own contacts"
  ON enriched_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = enriched_data.contact_id
      AND contacts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = enriched_data.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Users can delete enrichment data for their contacts
CREATE POLICY "Users can delete enrichment data for own contacts"
  ON enriched_data
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = enriched_data.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: gift_ideas
-- ============================================================================

-- Users can view their own gift ideas
CREATE POLICY "Users can view own gift ideas"
  ON gift_ideas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own gift ideas
CREATE POLICY "Users can insert own gift ideas"
  ON gift_ideas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own gift ideas
CREATE POLICY "Users can update own gift ideas"
  ON gift_ideas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own gift ideas
CREATE POLICY "Users can delete own gift ideas"
  ON gift_ideas
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to contacts table
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to enriched_data table
CREATE TRIGGER update_enriched_data_updated_at
  BEFORE UPDATE ON enriched_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to gift_ideas table
CREATE TRIGGER update_gift_ideas_updated_at
  BEFORE UPDATE ON gift_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE contacts IS 'User contact information with profile data. Aligned with ContactInput interface.';
COMMENT ON TABLE enriched_data IS 'AI-enriched contact data including predictions, relationships, and archetypes. Aligned with EnrichedContact interface.';
COMMENT ON TABLE gift_ideas IS 'Gift recommendation requests and results. Aligned with RecommendationRequest/Response interfaces.';

COMMENT ON COLUMN contacts.social_handles IS 'JSONB object with platform keys and handle values (e.g., {"twitter": "@user", "linkedin": "user"})';
COMMENT ON COLUMN contacts.interests IS 'JSONB object with structured interest data from ContactInput';

COMMENT ON COLUMN enriched_data.archetypes IS 'JSONB array of archetype objects: [{id, name, description, tags, confidence}]';
COMMENT ON COLUMN enriched_data.gifting_profile IS 'JSONB object: {style, preferences: {sentimental, practical, experiential, luxurious}, budgetRange: {min, max}, interests: []}';
COMMENT ON COLUMN enriched_data.enrichment_metadata IS 'JSONB object: {enrichedAt, version, fieldsEnriched, confidence: {overall, birthday, relationship, archetype}, privacyConsent}';

COMMENT ON COLUMN gift_ideas.recommendations IS 'JSONB array of GiftRecommendation objects with full product details, confidence scores, and reasoning';
COMMENT ON COLUMN gift_ideas.engagement_data IS 'JSONB object storing ThreeWordsGame and PickTheirVibeGame answers';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
