/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type definitions for Auto-Populate Contact Enrichment System
 * Phase 2 - BirthdayGen.com
 */

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Contact input schema for enrichment
 * Matches existing NormalizedContact from contacts-import.ts
 */
export interface ContactInput {
  id?: string;
  fullName?: string;
  emails?: string[];
  birthday?: {
    year?: number;
    month?: number;
    day?: number;
  };
  gender?: string;
  urls?: string[];
  photoUrl?: string;
  social_handles?: Record<string, string>;
  interests?: Record<string, any>;
}

/**
 * Privacy consent configuration
 */
export interface PrivacyConsent {
  userId: string;
  consentGiven: boolean;
  consentDate?: Date;
  allowBirthdayPrediction?: boolean;
  allowRelationshipInference?: boolean;
  allowArchetypeTagging?: boolean;
  allowExternalEnrichment?: boolean; // For future API integrations
}

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

/**
 * Enriched contact output
 */
export interface EnrichedContact extends ContactInput {
  enrichmentMetadata: EnrichmentMetadata;
  predictedBirthday?: {
    month?: number;
    day?: number;
    confidence: number; // 0-100
    reasoning: string;
  };
  inferredRelationship?: {
    type: RelationshipType;
    confidence: number; // 0-100
    reasoning: string;
  };
  archetypes?: Archetype[];
  giftingProfile?: GiftingProfile;
}

/**
 * Enrichment metadata
 */
export interface EnrichmentMetadata {
  enrichedAt: Date;
  version: string; // Algorithm version (e.g., "1.0.0")
  fieldsEnriched: string[];
  confidence: {
    overall: number; // 0-100
    birthday: number;
    relationship: number;
    archetype: number;
  };
  privacyConsent: boolean;
}

/**
 * Enrichment result wrapper
 */
export interface EnrichmentResult {
  success: boolean;
  contact?: EnrichedContact;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  warnings?: string[];
}

/**
 * Batch enrichment result
 */
export interface BatchEnrichmentResult {
  success: boolean;
  results: EnrichmentResult[];
  stats: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  processingTime: number; // milliseconds
}

// ============================================================================
// ENRICHMENT SPECIFIC TYPES
// ============================================================================

/**
 * Relationship types for inference
 */
export enum RelationshipType {
  FAMILY = 'family',
  CLOSE_FRIEND = 'close_friend',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  ACQUAINTANCE = 'acquaintance',
  PROFESSIONAL = 'professional',
  UNKNOWN = 'unknown',
}

/**
 * Archetype definition
 */
export interface Archetype {
  id: string;
  name: string;
  description: string;
  tags: string[];
  confidence: number; // 0-100
}

/**
 * Gifting profile (personality-based)
 */
export interface GiftingProfile {
  style: GiftingStyle;
  preferences: {
    sentimental: number; // 0-100
    practical: number; // 0-100
    experiential: number; // 0-100
    luxurious: number; // 0-100
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  interests: string[];
}

/**
 * Gifting styles
 */
export enum GiftingStyle {
  SENTIMENTAL = 'sentimental', // Thoughtful, personalized gifts
  PRACTICAL = 'practical', // Useful, everyday items
  EXPERIENTIAL = 'experiential', // Events, experiences
  LUXURIOUS = 'luxurious', // High-end, premium gifts
  CREATIVE = 'creative', // Handmade, unique items
  TECH_SAVVY = 'tech_savvy', // Gadgets, tech products
  ECO_CONSCIOUS = 'eco_conscious', // Sustainable, eco-friendly
  FOODIE = 'foodie', // Culinary, gourmet items
}

// ============================================================================
// ALGORITHM INPUT TYPES
// ============================================================================

/**
 * Birthday prediction input
 */
export interface BirthdayPredictionInput {
  contact: ContactInput;
  socialContext?: {
    recentPosts?: string[];
    profileInfo?: Record<string, any>;
  };
  historicalData?: {
    interactionFrequency?: number;
    lastInteraction?: Date;
  };
}

/**
 * Relationship inference input
 */
export interface RelationshipInferenceInput {
  contact: ContactInput;
  interactionMetrics?: {
    emailCount?: number;
    lastContactDate?: Date;
    sharedConnections?: number;
    communicationFrequency?: 'daily' | 'weekly' | 'monthly' | 'rare';
  };
  contextClues?: {
    emailDomain?: string; // Work vs personal
    sharedGroups?: string[];
    meetingHistory?: number;
  };
}

/**
 * Archetype tagging input
 */
export interface ArchetypeTaggingInput {
  contact: ContactInput;
  behavioralSignals?: {
    professionalTitles?: string[];
    hobbies?: string[];
    interests?: string[];
    socialMediaActivity?: string[];
  };
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  burstLimit: number; // Max requests in 10 seconds
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

/**
 * Enrichment log entry
 */
export interface EnrichmentLogEntry {
  timestamp: Date;
  userId: string;
  contactId?: string;
  operation: 'enrich_single' | 'enrich_batch' | 'predict_birthday' | 'infer_relationship' | 'tag_archetype';
  success: boolean;
  duration: number; // milliseconds
  fieldsEnriched?: string[];
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * API request for single contact enrichment
 */
export interface EnrichContactRequest {
  contact: ContactInput;
  options?: {
    predictBirthday?: boolean;
    inferRelationship?: boolean;
    tagArchetypes?: boolean;
    generateGiftingProfile?: boolean;
  };
}

/**
 * API request for batch enrichment
 */
export interface EnrichBatchRequest {
  contacts: ContactInput[];
  options?: {
    predictBirthday?: boolean;
    inferRelationship?: boolean;
    tagArchetypes?: boolean;
    generateGiftingProfile?: boolean;
  };
}

/**
 * API response for enrichment
 */
export interface EnrichmentResponse {
  success: boolean;
  data?: EnrichedContact | EnrichedContact[];
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    processingTime: number;
    version: string;
  };
}
