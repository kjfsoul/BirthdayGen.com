/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-Populate Contact Enrichment API
 * Phase 4 Module A Step 2 - BirthdayGen.com
 *
 * Provides AI-powered contact enrichment with REAL DATABASE PERSISTENCE:
 * - Birthday prediction
 * - Relationship inference
 * - Archetype tagging
 * - Gifting profile generation
 *
 * All enriched data is stored in Supabase (contacts + enriched_data tables)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, getCurrentUser } from '@/lib/db/supabase';
import { enrichContact, enrichContactBatch } from '@/lib/autopopulate/enrichment';
import { validatePrivacyConsent } from '@/lib/autopopulate/privacy';
import { checkRateLimit } from '@/lib/autopopulate/rate-limit';
import { logEnrichment } from '@/lib/autopopulate/logger';
import type {
  EnrichContactRequest,
  EnrichBatchRequest,
  EnrichedContact,
} from '@/lib/autopopulate/types';
import type { ContactInsert, EnrichedDataInsert } from '@/lib/db/schema';

// ============================================================================
// POST /api/autopopulate - Enrich single or batch contacts
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Get authenticated user from Supabase
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
          },
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Parse request body
    const body = await request.json();

    // Check rate limit
    const rateLimitStatus = await checkRateLimit(userId);
    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${rateLimitStatus.retryAfter} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
            'X-RateLimit-Reset': rateLimitStatus.resetAt.toISOString(),
            'Retry-After': rateLimitStatus.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Validate privacy consent
    const consentValid = await validatePrivacyConsent(userId);
    if (!consentValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRIVACY_CONSENT_REQUIRED',
            message: 'Privacy consent required for contact enrichment.',
          },
        },
        { status: 403 }
      );
    }

    // Get Supabase client
    const supabase = await getSupabaseClient();

    // Determine if batch or single enrichment
    const isBatch = Array.isArray(body.contacts);

    if (isBatch) {
      // Batch enrichment
      const batchRequest = body as EnrichBatchRequest;

      if (!batchRequest.contacts || batchRequest.contacts.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Contacts array is required and cannot be empty.',
            },
          },
          { status: 400 }
        );
      }

      // Batch size limit
      if (batchRequest.contacts.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BATCH_TOO_LARGE',
              message: 'Maximum batch size is 100 contacts.',
            },
          },
          { status: 400 }
        );
      }

      // Enrich batch
      const result = await enrichContactBatch(batchRequest.contacts, batchRequest.options);

      // Save enriched contacts to database
      const savedContacts: EnrichedContact[] = [];
      for (const enrichmentResult of result.results) {
        if (enrichmentResult.success && enrichmentResult.contact) {
          try {
            const saved = await saveEnrichedContact(supabase, userId, enrichmentResult.contact);
            if (saved) {
              savedContacts.push(saved);
            }
          } catch (error: any) {
            console.error('Failed to save enriched contact:', error);
            // Continue with other contacts
          }
        }
      }

      // Log operation
      await logEnrichment({
        timestamp: new Date(),
        userId,
        operation: 'enrich_batch',
        success: result.success,
        duration: Date.now() - startTime,
        metadata: {
          total: result.stats.total,
          successful: result.stats.successful,
          failed: result.stats.failed,
          saved: savedContacts.length,
        },
      });

      return NextResponse.json({
        success: true,
        data: savedContacts,
        metadata: {
          processingTime: Date.now() - startTime,
          version: '1.0.0',
          stats: {
            ...result.stats,
            saved: savedContacts.length,
          },
        },
      });

    } else {
      // Single contact enrichment
      const singleRequest = body as EnrichContactRequest;

      if (!singleRequest.contact) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Contact object is required.',
            },
          },
          { status: 400 }
        );
      }

      // Enrich contact
      const result = await enrichContact(singleRequest.contact, singleRequest.options);

      if (!result.success) {
        // Log failure
        await logEnrichment({
          timestamp: new Date(),
          userId,
          contactId: singleRequest.contact.id,
          operation: 'enrich_single',
          success: false,
          duration: Date.now() - startTime,
          error: result.error?.message,
        });

        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 500 }
        );
      }

      // Save enriched contact to database
      let savedContact: EnrichedContact | null = null;
      if (!result.contact) {
        throw new Error('Enrichment result missing contact data');
      }
      try {
        savedContact = await saveEnrichedContact(supabase, userId, result.contact);
      } catch (error: any) {
        console.error('Failed to save enriched contact:', error);

        await logEnrichment({
          timestamp: new Date(),
          userId,
          contactId: singleRequest.contact.id,
          operation: 'enrich_single',
          success: false,
          duration: Date.now() - startTime,
          error: `Database save failed: ${error.message}`,
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to save enriched contact to database.',
            },
          },
          { status: 500 }
        );
      }

      // Log success
      await logEnrichment({
        timestamp: new Date(),
        userId,
        contactId: singleRequest.contact.id,
        operation: 'enrich_single',
        success: true,
        duration: Date.now() - startTime,
        fieldsEnriched: result.contact?.enrichmentMetadata.fieldsEnriched,
      });

      return NextResponse.json({
        success: true,
        data: savedContact,
        metadata: {
          processingTime: Date.now() - startTime,
          version: '1.0.0',
        },
      });
    }

  } catch (error: any) {
    // Log error
    console.error('Autopopulate API error:', error);

    await logEnrichment({
      timestamp: new Date(),
      userId: 'unknown',
      operation: 'enrich_single',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during enrichment.',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/autopopulate - Retrieve enriched contacts
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (contactId) {
      // Get specific contact with enrichment data
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .single();

      if (contactError || !contact) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Contact not found.',
            },
          },
          { status: 404 }
        );
      }

      // Get enrichment data
      const { data: enriched, error: _enrichedError } = await supabase
        .from('enriched_data')
        .select('*')
        .eq('contact_id', contactId)
        .single();

      // Combine contact and enrichment data
      const enrichedContact = mergeContactWithEnrichment(contact, enriched);

      return NextResponse.json({
        success: true,
        data: enrichedContact,
      });
    } else {
      // Get all enriched contacts for user
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          enriched_data (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (contactsError) {
        throw contactsError;
      }

      // Transform to EnrichedContact format
      const enrichedContacts = contacts.map((contact: any) => {
        const enrichment = Array.isArray(contact.enriched_data)
          ? contact.enriched_data[0]
          : contact.enriched_data;
        return mergeContactWithEnrichment(contact, enrichment);
      });

      return NextResponse.json({
        success: true,
        data: enrichedContacts,
        metadata: {
          total: enrichedContacts.length,
          limit,
          offset,
        },
      });
    }

  } catch (error: any) {
    console.error('GET /api/autopopulate error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve enriched contacts.',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Save enriched contact to database (upsert contact and enrichment data)
 */
async function saveEnrichedContact(
  supabase: any,
  userId: string,
  enrichedContact: EnrichedContact
): Promise<EnrichedContact | null> {
  // Prepare contact data
  const contactData: ContactInsert = {
    user_id: userId,
    full_name: enrichedContact.fullName || null,
    emails: enrichedContact.emails || null,
    phone: null, // Not in ContactInput interface
    birthday_year: enrichedContact.birthday?.year || null,
    birthday_month: enrichedContact.birthday?.month || null,
    birthday_day: enrichedContact.birthday?.day || null,
    gender: enrichedContact.gender || null,
    urls: enrichedContact.urls || null,
    photo_url: enrichedContact.photoUrl || null,
    social_handles: enrichedContact.social_handles || null,
    interests: enrichedContact.interests || null,
    relationship: enrichedContact.inferredRelationship?.type || null,
    notes: null,
  };

  // Upsert contact (insert or update if exists)
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(contactData, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (contactError) {
    console.error('Failed to upsert contact:', contactError);
    throw new Error(`Failed to save contact: ${contactError.message}`);
  }

  // Prepare enrichment data
  const enrichmentData: EnrichedDataInsert = {
    contact_id: contact.id,
    predicted_birthday_month: enrichedContact.predictedBirthday?.month || null,
    predicted_birthday_day: enrichedContact.predictedBirthday?.day || null,
    birthday_confidence: enrichedContact.predictedBirthday?.confidence || null,
    birthday_reasoning: enrichedContact.predictedBirthday?.reasoning || null,
    inferred_relationship: enrichedContact.inferredRelationship?.type || null,
    relationship_confidence: enrichedContact.inferredRelationship?.confidence || null,
    relationship_reasoning: enrichedContact.inferredRelationship?.reasoning || null,
    archetypes: enrichedContact.archetypes || null,
    gifting_profile: enrichedContact.giftingProfile || null,
    enrichment_metadata: {
      enrichedAt: enrichedContact.enrichmentMetadata.enrichedAt.toISOString(),
      version: enrichedContact.enrichmentMetadata.version,
      fieldsEnriched: enrichedContact.enrichmentMetadata.fieldsEnriched,
      confidence: enrichedContact.enrichmentMetadata.confidence,
      privacyConsent: enrichedContact.enrichmentMetadata.privacyConsent,
    },
  };

  // Upsert enrichment data
  const { data: enriched, error: enrichedError } = await supabase
    .from('enriched_data')
    .upsert(enrichmentData, {
      onConflict: 'contact_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (enrichedError) {
    console.error('Failed to upsert enrichment data:', enrichedError);
    throw new Error(`Failed to save enrichment data: ${enrichedError.message}`);
  }

  // Return merged enriched contact
  return mergeContactWithEnrichment(contact, enriched);
}

/**
 * Merge contact and enrichment data into EnrichedContact format
 */
function mergeContactWithEnrichment(contact: any, enrichment: any): EnrichedContact {
  return {
    id: contact.id,
    fullName: contact.full_name,
    emails: contact.emails,
    birthday: contact.birthday_month && contact.birthday_day ? {
      year: contact.birthday_year,
      month: contact.birthday_month,
      day: contact.birthday_day,
    } : undefined,
    gender: contact.gender,
    urls: contact.urls,
    photoUrl: contact.photo_url,
    social_handles: contact.social_handles,
    interests: contact.interests,
    predictedBirthday: enrichment && enrichment.predicted_birthday_month ? {
      month: enrichment.predicted_birthday_month,
      day: enrichment.predicted_birthday_day,
      confidence: enrichment.birthday_confidence || 0,
      reasoning: enrichment.birthday_reasoning || '',
    } : undefined,
    inferredRelationship: enrichment && enrichment.inferred_relationship ? {
      type: enrichment.inferred_relationship,
      confidence: enrichment.relationship_confidence || 0,
      reasoning: enrichment.relationship_reasoning || '',
    } : undefined,
    archetypes: enrichment?.archetypes || undefined,
    giftingProfile: enrichment?.gifting_profile || undefined,
    enrichmentMetadata: enrichment?.enrichment_metadata ? {
      enrichedAt: new Date(enrichment.enrichment_metadata.enrichedAt),
      version: enrichment.enrichment_metadata.version,
      fieldsEnriched: enrichment.enrichment_metadata.fieldsEnriched || [],
      confidence: enrichment.enrichment_metadata.confidence || {
        overall: 0,
        birthday: 0,
        relationship: 0,
        archetype: 0,
      },
      privacyConsent: enrichment.enrichment_metadata.privacyConsent !== false,
    } : {
      enrichedAt: new Date(contact.created_at),
      version: '1.0.0',
      fieldsEnriched: [],
      confidence: {
        overall: 0,
        birthday: 0,
        relationship: 0,
        archetype: 0,
      },
      privacyConsent: true,
    },
  };
}
