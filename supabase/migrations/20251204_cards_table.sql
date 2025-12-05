-- ============================================================================
-- BirthdayGen: Cards Table Migration
-- Created: 2025-12-04
-- Purpose: Store birthday cards with scheduling support
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: cards
-- ============================================================================
-- Stores user-created birthday cards with scheduling and status tracking

CREATE TABLE IF NOT EXISTS cards (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User association (nullable for guest cards)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Card content
  title TEXT NOT NULL DEFAULT 'Happy Birthday!',
  message TEXT,
  template TEXT,

  -- Styling
  background_style TEXT,
  text_style TEXT,

  -- Additional elements (recipient info, colors, images, etc.)
  elements JSONB DEFAULT '{}',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Recipient info (for delivery)
  recipient_email TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_scheduled_at ON cards(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

-- Composite index for scheduled card processing
CREATE INDEX IF NOT EXISTS idx_cards_scheduled_pending
  ON cards(scheduled_at, status)
  WHERE status = 'scheduled';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Users can view their own cards
CREATE POLICY "Users can view own cards"
  ON cards
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own cards (or guest cards)
CREATE POLICY "Users can insert own cards"
  ON cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own cards
CREATE POLICY "Users can update own cards"
  ON cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cards
CREATE POLICY "Users can delete own cards"
  ON cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger (using existing function from init_schema)
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE cards IS 'User-created birthday cards with scheduling and delivery tracking';
COMMENT ON COLUMN cards.elements IS 'JSONB object with recipientName, senderName, colors, imageUrl';
COMMENT ON COLUMN cards.status IS 'Card status: draft, scheduled, sending, sent, failed';
COMMENT ON COLUMN cards.scheduled_at IS 'When to send the card (null = manual send only)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
