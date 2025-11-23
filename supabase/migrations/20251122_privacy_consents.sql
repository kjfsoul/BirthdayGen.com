-- ============================================================================
-- Privacy Consents Table Migration
-- Created: 2025-11-22
-- Purpose: Store user privacy consent preferences for contact enrichment
-- ============================================================================

-- ============================================================================
-- TABLE: privacy_consents
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_consents (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User association (references auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consent data
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Granular permissions
  allow_birthday_prediction BOOLEAN DEFAULT true,
  allow_relationship_inference BOOLEAN DEFAULT true,
  allow_archetype_tagging BOOLEAN DEFAULT true,
  allow_external_enrichment BOOLEAN DEFAULT false, -- For future API integrations
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one consent record per user
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_consent_given ON privacy_consents(consent_given);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view own consent records"
  ON privacy_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can insert own consent records"
  ON privacy_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consent records
CREATE POLICY "Users can update own consent records"
  ON privacy_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own consent records
CREATE POLICY "Users can delete own consent records"
  ON privacy_consents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to privacy_consents table
CREATE TRIGGER update_privacy_consents_updated_at
  BEFORE UPDATE ON privacy_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE privacy_consents IS 'User privacy consent preferences for contact enrichment features';
COMMENT ON COLUMN privacy_consents.consent_given IS 'Master consent flag - if false, no enrichment should be performed';
COMMENT ON COLUMN privacy_consents.allow_external_enrichment IS 'Allow enrichment from external APIs (future feature)';
