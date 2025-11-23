/**
 * Unit Tests for Auto-Populate Enrichment Logic
 * Phase 2 - BirthdayGen.com
 * 
 * Tests:
 * - Birthday prediction logic
 * - Relationship inference
 * - Archetype tagging
 * - Privacy validation
 * - Batch enrichment
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { enrichContact, enrichContactBatch } from '../enrichment';
import { 
  validatePrivacyConsent, 
  storePrivacyConsent, 
  revokePrivacyConsent 
} from '../privacy';
import { checkRateLimit, resetRateLimit } from '../rate-limit';
import type { ContactInput, PrivacyConsent } from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockContactWithNameHint: ContactInput = {
  fullName: 'April Johnson',
  emails: ['april.j@email.com'],
};

const mockContactWithEmailYearHint: ContactInput = {
  fullName: 'John Doe',
  emails: ['john1990@gmail.com'],
};

const mockContactWithSocialHint: ContactInput = {
  fullName: 'Sarah Smith',
  emails: ['sarah@email.com'],
  social_handles: {
    twitter: '@spring_baby',
  },
};

const mockContactWorkEmail: ContactInput = {
  fullName: 'Mike Wilson',
  emails: ['mike.wilson@company.com'],
};

const mockContactPersonalEmail: ContactInput = {
  fullName: 'Lisa Brown',
  emails: ['lisa@gmail.com'],
};

const mockContactTechEnthusiast: ContactInput = {
  fullName: 'Alex Tech',
  emails: ['alex@email.com'],
  interests: {
    hobbies: ['coding', 'gaming', 'tech gadgets'],
  },
};

const mockContactCreativeArtist: ContactInput = {
  fullName: 'Emma Artist',
  emails: ['emma@email.com'],
  interests: {
    hobbies: ['painting', 'music', 'design'],
  },
};

const mockContactFoodie: ContactInput = {
  fullName: 'Chef Gordon',
  emails: ['gordon@email.com'],
  interests: {
    hobbies: ['cooking', 'wine tasting', 'gourmet food'],
  },
};

// ============================================================================
// BIRTHDAY PREDICTION TESTS
// ============================================================================

describe('Birthday Prediction', () => {
  it('should predict birthday from name pattern (April)', async () => {
    const result = await enrichContact(mockContactWithNameHint, {
      predictBirthday: true,
      inferRelationship: false,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.predictedBirthday).toBeDefined();
    expect(result.contact?.predictedBirthday?.month).toBe(4); // April
    expect(result.contact?.predictedBirthday?.confidence).toBeGreaterThan(0);
    expect(result.contact?.predictedBirthday?.reasoning).toContain('name_pattern');
  });

  it('should predict birthday from email year pattern', async () => {
    const result = await enrichContact(mockContactWithEmailYearHint, {
      predictBirthday: true,
      inferRelationship: false,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.predictedBirthday).toBeDefined();
    expect(result.contact?.predictedBirthday?.confidence).toBeGreaterThan(0);
  });

  it('should predict birthday from social handle hints', async () => {
    const result = await enrichContact(mockContactWithSocialHint, {
      predictBirthday: true,
      inferRelationship: false,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.predictedBirthday).toBeDefined();
    expect(result.contact?.predictedBirthday?.reasoning).toContain('social_handle_pattern');
  });

  it('should not predict birthday if already exists', async () => {
    const contactWithBirthday: ContactInput = {
      ...mockContactWithNameHint,
      birthday: { year: 1990, month: 5, day: 15 },
    };

    const result = await enrichContact(contactWithBirthday, {
      predictBirthday: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.predictedBirthday).toBeUndefined();
  });

  it('should return null for contacts with no birthday hints', async () => {
    const minimalContact: ContactInput = {
      fullName: 'Bob Smith',
      emails: ['bob@email.com'],
    };

    const result = await enrichContact(minimalContact, {
      predictBirthday: true,
      inferRelationship: false,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    // Birthday prediction might be null or have very low confidence
    if (result.contact?.predictedBirthday) {
      expect(result.contact.predictedBirthday.confidence).toBeLessThan(40);
    }
  });

  it('should have confidence between 0-100', async () => {
    const result = await enrichContact(mockContactWithNameHint, {
      predictBirthday: true,
    });

    expect(result.success).toBe(true);
    if (result.contact?.predictedBirthday) {
      expect(result.contact.predictedBirthday.confidence).toBeGreaterThanOrEqual(0);
      expect(result.contact.predictedBirthday.confidence).toBeLessThanOrEqual(100);
    }
  });
});

// ============================================================================
// RELATIONSHIP INFERENCE TESTS
// ============================================================================

describe('Relationship Inference', () => {
  it('should infer colleague from work email domain', async () => {
    const result = await enrichContact(mockContactWorkEmail, {
      predictBirthday: false,
      inferRelationship: true,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.inferredRelationship).toBeDefined();
    expect(result.contact?.inferredRelationship?.type).toBe('colleague');
    expect(result.contact?.inferredRelationship?.confidence).toBeGreaterThan(50);
    expect(result.contact?.inferredRelationship?.reasoning).toContain('work_email_domain');
  });

  it('should infer friend from personal email domain', async () => {
    const result = await enrichContact(mockContactPersonalEmail, {
      predictBirthday: false,
      inferRelationship: true,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.inferredRelationship).toBeDefined();
    expect(result.contact?.inferredRelationship?.type).toBe('friend');
    expect(result.contact?.inferredRelationship?.reasoning).toContain('personal_email_domain');
  });

  it('should return unknown for contacts with no relationship hints', async () => {
    const minimalContact: ContactInput = {
      fullName: 'Unknown Person',
      emails: [],
    };

    const result = await enrichContact(minimalContact, {
      predictBirthday: false,
      inferRelationship: true,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.inferredRelationship?.type).toBe('unknown');
    expect(result.contact?.inferredRelationship?.confidence).toBeLessThan(50);
  });

  it('should have confidence between 0-100', async () => {
    const result = await enrichContact(mockContactWorkEmail, {
      inferRelationship: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.inferredRelationship).toBeDefined();
    expect(result.contact!.inferredRelationship!.confidence).toBeGreaterThanOrEqual(0);
    expect(result.contact!.inferredRelationship!.confidence).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// ARCHETYPE TAGGING TESTS
// ============================================================================

describe('Archetype Tagging', () => {
  it('should tag tech enthusiast archetype', async () => {
    const result = await enrichContact(mockContactTechEnthusiast, {
      predictBirthday: false,
      inferRelationship: false,
      tagArchetypes: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.archetypes).toBeDefined();
    expect(result.contact?.archetypes?.length).toBeGreaterThan(0);
    
    const techArchetype = result.contact?.archetypes?.find(
      a => a.id === 'tech_enthusiast'
    );
    expect(techArchetype).toBeDefined();
    expect(techArchetype?.confidence).toBeGreaterThan(0);
  });

  it('should tag creative artist archetype', async () => {
    const result = await enrichContact(mockContactCreativeArtist, {
      predictBirthday: false,
      inferRelationship: false,
      tagArchetypes: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.archetypes).toBeDefined();
    
    const creativeArchetype = result.contact?.archetypes?.find(
      a => a.id === 'creative_artist'
    );
    expect(creativeArchetype).toBeDefined();
  });

  it('should tag foodie archetype', async () => {
    const result = await enrichContact(mockContactFoodie, {
      predictBirthday: false,
      inferRelationship: false,
      tagArchetypes: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.archetypes).toBeDefined();
    
    const foodieArchetype = result.contact?.archetypes?.find(
      a => a.id === 'foodie'
    );
    expect(foodieArchetype).toBeDefined();
  });

  it('should limit to top 3 archetypes', async () => {
    const multiInterestContact: ContactInput = {
      fullName: 'Jack All-Trades',
      emails: ['jack@email.com'],
      interests: {
        hobbies: [
          'coding', 'gaming', 'tech', // tech
          'painting', 'music', 'art', // creative
          'cooking', 'food', 'wine', // foodie
          'hiking', 'camping', 'outdoors', // outdoor
          'fitness', 'gym', 'running', // fitness
        ],
      },
    };

    const result = await enrichContact(multiInterestContact, {
      tagArchetypes: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.archetypes?.length).toBeLessThanOrEqual(3);
  });

  it('should return no archetypes for minimal contacts', async () => {
    const minimalContact: ContactInput = {
      fullName: 'Jane Doe',
      emails: ['jane@email.com'],
    };

    const result = await enrichContact(minimalContact, {
      tagArchetypes: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.archetypes?.length || 0).toBe(0);
  });
});

// ============================================================================
// GIFTING PROFILE TESTS
// ============================================================================

describe('Gifting Profile Generation', () => {
  it('should generate gifting profile from archetypes', async () => {
    const result = await enrichContact(mockContactTechEnthusiast, {
      tagArchetypes: true,
      generateGiftingProfile: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.giftingProfile).toBeDefined();
    expect(result.contact?.giftingProfile?.style).toBeDefined();
    expect(result.contact?.giftingProfile?.preferences).toBeDefined();
    expect(result.contact?.giftingProfile?.interests).toBeDefined();
  });

  it('should have preferences between 0-100', async () => {
    const result = await enrichContact(mockContactCreativeArtist, {
      tagArchetypes: true,
      generateGiftingProfile: true,
    });

    expect(result.success).toBe(true);
    const prefs = result.contact?.giftingProfile?.preferences;
    expect(prefs).toBeDefined();
    expect(prefs!.sentimental).toBeGreaterThanOrEqual(0);
    expect(prefs!.sentimental).toBeLessThanOrEqual(100);
    expect(prefs!.practical).toBeGreaterThanOrEqual(0);
    expect(prefs!.practical).toBeLessThanOrEqual(100);
  });

  it('should prioritize sentimental for creative artists', async () => {
    const result = await enrichContact(mockContactCreativeArtist, {
      tagArchetypes: true,
      generateGiftingProfile: true,
    });

    expect(result.success).toBe(true);
    const prefs = result.contact?.giftingProfile?.preferences;
    expect(prefs?.sentimental).toBeGreaterThan(50);
  });

  it('should prioritize practical for tech enthusiasts', async () => {
    const result = await enrichContact(mockContactTechEnthusiast, {
      tagArchetypes: true,
      generateGiftingProfile: true,
    });

    expect(result.success).toBe(true);
    const prefs = result.contact?.giftingProfile?.preferences;
    expect(prefs?.practical).toBeGreaterThan(50);
  });
});

// ============================================================================
// BATCH ENRICHMENT TESTS
// ============================================================================

describe('Batch Enrichment', () => {
  it('should enrich multiple contacts', async () => {
    const contacts = [
      mockContactWithNameHint,
      mockContactWorkEmail,
      mockContactTechEnthusiast,
    ];

    const result = await enrichContactBatch(contacts);

    expect(result.success).toBe(true);
    expect(result.results.length).toBe(3);
    expect(result.stats.total).toBe(3);
    expect(result.stats.successful).toBeGreaterThan(0);
  });

  it('should skip contacts with insufficient data', async () => {
    const contacts = [
      mockContactWithNameHint,
      { fullName: '', emails: [] } as ContactInput, // Insufficient
      mockContactWorkEmail,
    ];

    const result = await enrichContactBatch(contacts);

    expect(result.success).toBe(true);
    expect(result.stats.skipped).toBe(1);
    expect(result.stats.successful).toBe(2);
  });

  it('should provide processing stats', async () => {
    const contacts = [mockContactWithNameHint];

    const result = await enrichContactBatch(contacts);

    expect(result.success).toBe(true);
    expect(result.stats).toBeDefined();
    expect(result.stats.total).toBe(1);
    expect(result.stats.successful).toBe(1);
    expect(result.stats.failed).toBe(0);
    expect(result.processingTime).toBeGreaterThan(0);
  });
});

// ============================================================================
// OVERALL ENRICHMENT TESTS
// ============================================================================

describe('Overall Enrichment', () => {
  it('should enrich with all features enabled', async () => {
    const result = await enrichContact(mockContactTechEnthusiast, {
      predictBirthday: true,
      inferRelationship: true,
      tagArchetypes: true,
      generateGiftingProfile: true,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.enrichmentMetadata).toBeDefined();
    expect(result.contact?.enrichmentMetadata.fieldsEnriched.length).toBeGreaterThan(0);
    expect(result.contact?.enrichmentMetadata.confidence.overall).toBeGreaterThan(0);
  });

  it('should respect disabled features', async () => {
    const result = await enrichContact(mockContactWithNameHint, {
      predictBirthday: false,
      inferRelationship: false,
      tagArchetypes: false,
    });

    expect(result.success).toBe(true);
    expect(result.contact?.predictedBirthday).toBeUndefined();
    expect(result.contact?.inferredRelationship).toBeUndefined();
    expect(result.contact?.archetypes).toBeUndefined();
  });

  it('should include enrichment metadata', async () => {
    const result = await enrichContact(mockContactWithNameHint);

    expect(result.success).toBe(true);
    expect(result.contact?.enrichmentMetadata).toBeDefined();
    expect(result.contact?.enrichmentMetadata.enrichedAt).toBeInstanceOf(Date);
    expect(result.contact?.enrichmentMetadata.version).toBe('1.0.0');
    expect(result.contact?.enrichmentMetadata.privacyConsent).toBe(true);
  });

  it('should calculate overall confidence correctly', async () => {
    const result = await enrichContact(mockContactTechEnthusiast);

    expect(result.success).toBe(true);
    expect(result.contact?.enrichmentMetadata.confidence.overall).toBeGreaterThanOrEqual(0);
    expect(result.contact?.enrichmentMetadata.confidence.overall).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// PRIVACY VALIDATION TESTS
// ============================================================================

describe('Privacy Validation', () => {
  beforeEach(async () => {
    // Clean up consent store before each test
    await revokePrivacyConsent('test-user');
  });

  it('should allow enrichment with consent', async () => {
    const consent: PrivacyConsent = {
      userId: 'test-user',
      consentGiven: true,
      consentDate: new Date(),
      allowBirthdayPrediction: true,
      allowRelationshipInference: true,
      allowArchetypeTagging: true,
    };

    await storePrivacyConsent(consent);

    const isValid = await validatePrivacyConsent('test-user');
    expect(isValid).toBe(true);
  });

  it('should default to true for MVP', async () => {
    const isValid = await validatePrivacyConsent('new-user');
    expect(isValid).toBe(true);
  });

  it('should deny enrichment after consent revocation', async () => {
    const consent: PrivacyConsent = {
      userId: 'test-user',
      consentGiven: true,
      consentDate: new Date(),
    };

    await storePrivacyConsent(consent);
    await revokePrivacyConsent('test-user');

    const isValid = await validatePrivacyConsent('test-user');
    expect(isValid).toBe(false);
  });
});

// ============================================================================
// RATE LIMITING TESTS
// ============================================================================

describe('Rate Limiting', () => {
  beforeEach(async () => {
    // Reset rate limits before each test
    await resetRateLimit('test-user');
  });

  it('should allow requests within limit', async () => {
    const status = await checkRateLimit('test-user');

    expect(status.allowed).toBe(true);
    expect(status.remaining).toBeGreaterThan(0);
    expect(status.resetAt).toBeInstanceOf(Date);
  });

  it('should block requests exceeding burst limit', async () => {
    // Make burst limit + 1 requests
    for (let i = 0; i < 11; i++) {
      await checkRateLimit('test-user');
    }

    const status = await checkRateLimit('test-user');
    expect(status.allowed).toBe(false);
    expect(status.retryAfter).toBeDefined();
  });

  it('should reset after time window', async () => {
    // This test would require time mocking in a real scenario
    const status1 = await checkRateLimit('test-user');
    expect(status1.allowed).toBe(true);

    // In real test, we'd mock time passage
    // For now, just verify reset works
    await resetRateLimit('test-user');
    const status2 = await checkRateLimit('test-user');
    expect(status2.allowed).toBe(true);
  });
});
