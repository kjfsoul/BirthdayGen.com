/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Database Schema Types
 *
 * Type definitions for Supabase database tables.
 * Generated from: supabase/migrations/20251121_init_schema.sql
 *
 * These types ensure type safety when interacting with the database.
 */

// ============================================================================
// TABLE: contacts
// ============================================================================

export interface Contact {
  id: string; // UUID
  user_id: string; // UUID
  full_name: string | null;
  emails: string[] | null;
  phone: string | null;
  birthday_year: number | null;
  birthday_month: number | null; // 1-12
  birthday_day: number | null; // 1-31
  gender: string | null;
  urls: string[] | null;
  photo_url: string | null;
  social_handles: Record<string, string> | null; // JSONB
  interests: Record<string, any> | null; // JSONB
  relationship: string | null;
  notes: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface ContactInsert {
  id?: string;
  user_id: string;
  full_name?: string | null;
  emails?: string[] | null;
  phone?: string | null;
  birthday_year?: number | null;
  birthday_month?: number | null;
  birthday_day?: number | null;
  gender?: string | null;
  urls?: string[] | null;
  photo_url?: string | null;
  social_handles?: Record<string, string> | null;
  interests?: Record<string, any> | null;
  relationship?: string | null;
  notes?: string | null;
}

export interface ContactUpdate {
  full_name?: string | null;
  emails?: string[] | null;
  phone?: string | null;
  birthday_year?: number | null;
  birthday_month?: number | null;
  birthday_day?: number | null;
  gender?: string | null;
  urls?: string[] | null;
  photo_url?: string | null;
  social_handles?: Record<string, string> | null;
  interests?: Record<string, any> | null;
  relationship?: string | null;
  notes?: string | null;
}

// ============================================================================
// TABLE: enriched_data
// ============================================================================

export interface EnrichedData {
  id: string; // UUID
  contact_id: string; // UUID
  predicted_birthday_month: number | null; // 1-12
  predicted_birthday_day: number | null; // 1-31
  birthday_confidence: number | null; // 0-100
  birthday_reasoning: string | null;
  inferred_relationship: string | null;
  relationship_confidence: number | null; // 0-100
  relationship_reasoning: string | null;
  archetypes: any[] | null; // JSONB array
  gifting_profile: Record<string, any> | null; // JSONB
  enrichment_metadata: Record<string, any> | null; // JSONB
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface EnrichedDataInsert {
  id?: string;
  contact_id: string;
  predicted_birthday_month?: number | null;
  predicted_birthday_day?: number | null;
  birthday_confidence?: number | null;
  birthday_reasoning?: string | null;
  inferred_relationship?: string | null;
  relationship_confidence?: number | null;
  relationship_reasoning?: string | null;
  archetypes?: any[] | null;
  gifting_profile?: Record<string, any> | null;
  enrichment_metadata?: Record<string, any> | null;
}

export interface EnrichedDataUpdate {
  predicted_birthday_month?: number | null;
  predicted_birthday_day?: number | null;
  birthday_confidence?: number | null;
  birthday_reasoning?: string | null;
  inferred_relationship?: string | null;
  relationship_confidence?: number | null;
  relationship_reasoning?: string | null;
  archetypes?: any[] | null;
  gifting_profile?: Record<string, any> | null;
  enrichment_metadata?: Record<string, any> | null;
}

// ============================================================================
// TABLE: gift_ideas
// ============================================================================

export interface GiftIdea {
  id: string; // UUID
  contact_id: string; // UUID
  user_id: string; // UUID
  occasion: string;
  budget_min: number; // DECIMAL
  budget_max: number; // DECIMAL
  budget_preferred: number | null; // DECIMAL
  exclude_categories: string[] | null;
  preferred_categories: string[] | null;
  urgency: 'low' | 'medium' | 'high' | null;
  shipping_required: boolean | null;
  gift_message: string | null;
  recommendations: any[] | null; // JSONB array
  engagement_data: Record<string, any> | null; // JSONB
  recipient_summary: string | null;
  top_categories: string[] | null;
  total_matches: number | null;
  processing_time_ms: number | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface GiftIdeaInsert {
  id?: string;
  contact_id: string;
  user_id: string;
  occasion: string;
  budget_min: number;
  budget_max: number;
  budget_preferred?: number | null;
  exclude_categories?: string[] | null;
  preferred_categories?: string[] | null;
  urgency?: 'low' | 'medium' | 'high' | null;
  shipping_required?: boolean | null;
  gift_message?: string | null;
  recommendations?: any[] | null;
  engagement_data?: Record<string, any> | null;
  recipient_summary?: string | null;
  top_categories?: string[] | null;
  total_matches?: number | null;
  processing_time_ms?: number | null;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string | null;
}

export interface GiftIdeaUpdate {
  occasion?: string;
  budget_min?: number;
  budget_max?: number;
  budget_preferred?: number | null;
  exclude_categories?: string[] | null;
  preferred_categories?: string[] | null;
  urgency?: 'low' | 'medium' | 'high' | null;
  shipping_required?: boolean | null;
  gift_message?: string | null;
  recommendations?: any[] | null;
  engagement_data?: Record<string, any> | null;
  recipient_summary?: string | null;
  top_categories?: string[] | null;
  total_matches?: number | null;
  processing_time_ms?: number | null;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string | null;
}

// ============================================================================
// TABLE: privacy_consents
// ============================================================================

export interface PrivacyConsentRow {
  id: string; // UUID
  user_id: string; // UUID
  consent_given: boolean;
  consent_date: string; // TIMESTAMPTZ
  allow_birthday_prediction: boolean | null;
  allow_relationship_inference: boolean | null;
  allow_archetype_tagging: boolean | null;
  allow_external_enrichment: boolean | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface PrivacyConsentInsert {
  id?: string;
  user_id: string;
  consent_given: boolean;
  consent_date?: string;
  allow_birthday_prediction?: boolean | null;
  allow_relationship_inference?: boolean | null;
  allow_archetype_tagging?: boolean | null;
  allow_external_enrichment?: boolean | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface PrivacyConsentUpdate {
  consent_given?: boolean;
  consent_date?: string;
  allow_birthday_prediction?: boolean | null;
  allow_relationship_inference?: boolean | null;
  allow_archetype_tagging?: boolean | null;
  allow_external_enrichment?: boolean | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// ============================================================================
// DATABASE TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: Contact;
        Insert: ContactInsert;
        Update: ContactUpdate;
      };
      enriched_data: {
        Row: EnrichedData;
        Insert: EnrichedDataInsert;
        Update: EnrichedDataUpdate;
      };
      gift_ideas: {
        Row: GiftIdea;
        Insert: GiftIdeaInsert;
        Update: GiftIdeaUpdate;
      };
      privacy_consents: {
        Row: PrivacyConsentRow;
        Insert: PrivacyConsentInsert;
        Update: PrivacyConsentUpdate;
      };
    };
  };
}
