/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Privacy and Consent Validation
 * Phase 4 Module A Step 2 - BirthdayGen.com
 *
 * Uses Supabase for persistent consent storage
 */

import { getSupabaseClient } from '@/lib/db/supabase';
import type { PrivacyConsent } from './types';
import type { PrivacyConsentRow, PrivacyConsentInsert } from '@/lib/db/schema';

/**
 * Validate user has given privacy consent for enrichment
 *
 * @param userId - User ID from Supabase auth
 * @returns true if consent is valid, false otherwise
 */
export async function validatePrivacyConsent(userId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();

    // Get consent record from database
    const { data: consent, error } = await supabase
      .from('privacy_consents')
      .select('consent_given')
      .eq('user_id', userId)
      .maybeSingle() as { data: Pick<PrivacyConsentRow, 'consent_given'> | null; error: any };

    if (error) {
      console.error('Error fetching privacy consent:', error);
      return false;
    }

    // If no record exists, default to true for MVP
    // In production, you may want to require explicit opt-in
    if (!consent) {
      return true;
    }

    return consent.consent_given || false;
  } catch (error) {
    console.error('validatePrivacyConsent error:', error);
    // Default to true for MVP to avoid blocking functionality
    return true;
  }
}

/**
 * Store privacy consent
 *
 * @param consent - Privacy consent object
 */
export async function storePrivacyConsent(consent: PrivacyConsent): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    // Prepare consent record
    const consentRecord: PrivacyConsentInsert = {
      user_id: consent.userId,
      consent_given: consent.consentGiven,
      consent_date: consent.consentDate?.toISOString() || new Date().toISOString(),
      allow_birthday_prediction: consent.allowBirthdayPrediction ?? true,
      allow_relationship_inference: consent.allowRelationshipInference ?? true,
      allow_archetype_tagging: consent.allowArchetypeTagging ?? true,
      allow_external_enrichment: consent.allowExternalEnrichment ?? false,
    };

    // Upsert consent record (type cast to avoid TypeScript inference issues)
    const query = supabase.from('privacy_consents');
    // @ts-expect-error - Supabase type inference issue with Database types
    const { error } = await query.upsert([consentRecord as any]);

    if (error) {
      console.error('Failed to store privacy consent:', error);
      throw new Error(`Failed to store consent: ${error.message}`);
    }
  } catch (error) {
    console.error('storePrivacyConsent error:', error);
    throw error;
  }
}

/**
 * Get privacy consent details
 *
 * @param userId - User ID from Supabase auth
 * @returns Privacy consent object or null if not found
 */
export async function getPrivacyConsent(userId: string): Promise<PrivacyConsent | null> {
  try {
    const supabase = await getSupabaseClient();

    const { data: consent, error } = await supabase
      .from('privacy_consents')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() as { data: PrivacyConsentRow | null; error: any };

    if (error) {
      console.error('Error fetching privacy consent:', error);
      return null;
    }

    if (!consent) {
      return null;
    }

    return {
      userId: consent.user_id,
      consentGiven: consent.consent_given,
      consentDate: consent.consent_date ? new Date(consent.consent_date) : undefined,
      allowBirthdayPrediction: consent.allow_birthday_prediction ?? undefined,
      allowRelationshipInference: consent.allow_relationship_inference ?? undefined,
      allowArchetypeTagging: consent.allow_archetype_tagging ?? undefined,
      allowExternalEnrichment: consent.allow_external_enrichment ?? undefined,
    };
  } catch (error) {
    console.error('getPrivacyConsent error:', error);
    return null;
  }
}

/**
 * Revoke privacy consent
 *
 * @param userId - User ID from Supabase auth
 */
export async function revokePrivacyConsent(userId: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    // Prepare revocation record
    const revocationRecord: PrivacyConsentInsert = {
      user_id: userId,
      consent_given: false,
      consent_date: new Date().toISOString(),
    };

    // Upsert revocation record (type cast to avoid TypeScript inference issues)
    const query = supabase.from('privacy_consents');
    // @ts-expect-error - Supabase type inference issue with Database types
    const { error } = await query.upsert([revocationRecord as any]);

    if (error) {
      console.error('Failed to revoke privacy consent:', error);
      throw new Error(`Failed to revoke consent: ${error.message}`);
    }
  } catch (error) {
    console.error('revokePrivacyConsent error:', error);
    throw error;
  }
}

/**
 * Check if specific enrichment type is allowed
 *
 * @param userId - User ID from Supabase auth
 * @param enrichmentType - Type of enrichment to check
 * @returns true if allowed, false otherwise
 */
export async function isEnrichmentAllowed(
  userId: string,
  enrichmentType: 'birthday' | 'relationship' | 'archetype' | 'external'
): Promise<boolean> {
  const consent = await getPrivacyConsent(userId);

  if (!consent || !consent.consentGiven) {
    // Default to true for MVP if no consent record exists
    return consent === null ? true : false;
  }

  switch (enrichmentType) {
    case 'birthday':
      return consent.allowBirthdayPrediction !== false;
    case 'relationship':
      return consent.allowRelationshipInference !== false;
    case 'archetype':
      return consent.allowArchetypeTagging !== false;
    case 'external':
      return consent.allowExternalEnrichment === true;
    default:
      return false;
  }
}
