/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Core Enrichment Logic for Contact Auto-Population
 * Phase 2 - BirthdayGen.com
 *
 * Implements rule-based algorithms for:
 * - Birthday prediction (name patterns, social data, age estimation)
 * - Relationship inference (interaction patterns, contact metadata)
 * - Archetype tagging (personality/gifting style classification)
 */

import type {
  ContactInput,
  EnrichedContact,
  EnrichmentResult,
  BatchEnrichmentResult,
  Archetype,
  GiftingProfile,
  BirthdayPredictionInput,
  RelationshipInferenceInput,
  ArchetypeTaggingInput,
} from './types';
import { RelationshipType, GiftingStyle } from './types';

// ============================================================================
// MAIN ENRICHMENT FUNCTIONS
// ============================================================================

/**
 * Enrich a single contact with predictions and inferences
 */
export async function enrichContact(
  contact: ContactInput,
  options?: {
    predictBirthday?: boolean;
    inferRelationship?: boolean;
    tagArchetypes?: boolean;
    generateGiftingProfile?: boolean;
  }
): Promise<EnrichmentResult> {
  try {
    const fieldsEnriched: string[] = [];

    // Initialize enriched contact
    const enriched: EnrichedContact = {
      ...contact,
      enrichmentMetadata: {
        enrichedAt: new Date(),
        version: '1.0.0',
        fieldsEnriched: [],
        confidence: {
          overall: 0,
          birthday: 0,
          relationship: 0,
          archetype: 0,
        },
        privacyConsent: true, // Should be validated by API route
      },
    };

    // Birthday prediction
    if (options?.predictBirthday !== false && !contact.birthday) {
      const predicted = await predictBirthday({
        contact,
        socialContext: {
          profileInfo: contact.social_handles || {},
        },
      });

      if (predicted) {
        enriched.predictedBirthday = predicted;
        fieldsEnriched.push('predictedBirthday');
        enriched.enrichmentMetadata.confidence.birthday = predicted.confidence;
      }
    }

    // Relationship inference
    if (options?.inferRelationship !== false) {
      const relationship = await inferRelationship({
        contact,
        contextClues: {
          emailDomain: contact.emails?.[0]?.split('@')[1],
        },
      });

      if (relationship) {
        enriched.inferredRelationship = relationship;
        fieldsEnriched.push('inferredRelationship');
        enriched.enrichmentMetadata.confidence.relationship = relationship.confidence;
      }
    }

    // Archetype tagging
    if (options?.tagArchetypes !== false) {
      const archetypes = await tagArchetypes({
        contact,
        behavioralSignals: {
          interests: contact.interests ? Object.keys(contact.interests) : [],
          hobbies: contact.interests?.hobbies || [],
        },
      });

      if (archetypes.length > 0) {
        enriched.archetypes = archetypes;
        fieldsEnriched.push('archetypes');
        enriched.enrichmentMetadata.confidence.archetype =
          archetypes.reduce((acc, a) => acc + a.confidence, 0) / archetypes.length;
      }
    }

    // Gifting profile generation
    if (options?.generateGiftingProfile !== false && enriched.archetypes) {
      const giftingProfile = generateGiftingProfile(enriched.archetypes);
      enriched.giftingProfile = giftingProfile;
      fieldsEnriched.push('giftingProfile');
    }

    // Calculate overall confidence
    const confidenceValues = Object.values(enriched.enrichmentMetadata.confidence).filter(v => v > 0);
    enriched.enrichmentMetadata.confidence.overall =
      confidenceValues.length > 0
        ? Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length)
        : 0;

    enriched.enrichmentMetadata.fieldsEnriched = fieldsEnriched;

    return {
      success: true,
      contact: enriched,
    };

  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'ENRICHMENT_ERROR',
        message: error.message,
        details: { contact: contact.id || contact.fullName },
      },
    };
  }
}

/**
 * Enrich multiple contacts in batch
 */
export async function enrichContactBatch(
  contacts: ContactInput[],
  options?: {
    predictBirthday?: boolean;
    inferRelationship?: boolean;
    tagArchetypes?: boolean;
    generateGiftingProfile?: boolean;
  }
): Promise<BatchEnrichmentResult> {
  const startTime = Date.now();
  const results: EnrichmentResult[] = [];

  let successful = 0;
  let failed = 0;
  let skipped = 0;

  for (const contact of contacts) {
    // Skip contacts without minimum data
    if (!contact.fullName && (!contact.emails || contact.emails.length === 0)) {
      skipped++;
      results.push({
        success: false,
        error: {
          code: 'INSUFFICIENT_DATA',
          message: 'Contact must have at least a name or email.',
        },
      });
      continue;
    }

    const result = await enrichContact(contact, options);
    results.push(result);

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return {
    success: true,
    results,
    stats: {
      total: contacts.length,
      successful,
      failed,
      skipped,
    },
    processingTime: Date.now() - startTime,
  };
}

// ============================================================================
// BIRTHDAY PREDICTION ALGORITHM
// ============================================================================

/**
 * Predict birthday based on name patterns, social data, and heuristics
 */
async function predictBirthday(
  input: BirthdayPredictionInput
): Promise<{ month?: number; day?: number; confidence: number; reasoning: string } | null> {
  const { contact, socialContext: _socialContext } = input;

  // Check if we have any signals
  const signals: { month?: number; day?: number; confidence: number; source: string }[] = [];

  // Signal 1: Name-based patterns (e.g., "April Smith" might be born in April)
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const name = contact.fullName?.toLowerCase() || '';
  monthNames.forEach((monthName, index) => {
    if (name.includes(monthName)) {
      signals.push({
        month: index + 1,
        confidence: 30, // Low confidence - name coincidence
        source: 'name_pattern',
      });
    }
  });

  // Signal 2: Email patterns (e.g., john1990@email.com might be born in 1990)
  const email = contact.emails?.[0] || '';
  const yearMatch = email.match(/\d{4}/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    if (year >= 1940 && year <= 2010) {
      // Don't predict exact birthday, but this could be birth year
      signals.push({
        confidence: 40, // Medium-low confidence
        source: 'email_year_pattern',
      });
    }
  }

  // Signal 3: Social handle patterns (e.g., @spring_baby or @may_child)
  const socialUrls = contact.urls?.join(' ').toLowerCase() || '';
  const socialHandles = contact.social_handles ?
    Object.values(contact.social_handles).join(' ').toLowerCase() : '';
  const socialText = socialUrls + ' ' + socialHandles;

  monthNames.forEach((monthName, index) => {
    if (socialText.includes(monthName)) {
      signals.push({
        month: index + 1,
        confidence: 50, // Medium confidence
        source: 'social_handle_pattern',
      });
    }
  });

  // Signal 4: Season-based hints (spring, summer, fall, winter in username/bio)
  const seasonMap: Record<string, number[]> = {
    'spring': [3, 4, 5], // March, April, May
    'summer': [6, 7, 8], // June, July, August
    'fall': [9, 10, 11], // September, October, November
    'autumn': [9, 10, 11],
    'winter': [12, 1, 2], // December, January, February
  };

  Object.entries(seasonMap).forEach(([season, months]) => {
    if (socialText.includes(season)) {
      // Pick middle month of season
      const middleMonth = months[1];
      signals.push({
        month: middleMonth,
        confidence: 35, // Low-medium confidence
        source: 'season_pattern',
      });
    }
  });

  // No signals found
  if (signals.length === 0) {
    return null;
  }

  // Aggregate signals - prefer higher confidence, more frequent months
  const monthCounts: Record<number, { count: number; totalConfidence: number; sources: string[] }> = {};

  signals.forEach(signal => {
    if (signal.month) {
      if (!monthCounts[signal.month]) {
        monthCounts[signal.month] = { count: 0, totalConfidence: 0, sources: [] };
      }
      monthCounts[signal.month].count++;
      monthCounts[signal.month].totalConfidence += signal.confidence;
      monthCounts[signal.month].sources.push(signal.source);
    }
  });

  // Find best month candidate
  const bestMonth = Object.entries(monthCounts)
    .map(([month, data]) => ({
      month: parseInt(month),
      avgConfidence: data.totalConfidence / data.count,
      count: data.count,
      sources: data.sources,
    }))
    .sort((a, b) => {
      // Sort by count first, then by average confidence
      if (a.count !== b.count) return b.count - a.count;
      return b.avgConfidence - a.avgConfidence;
    })[0];

  if (!bestMonth) {
    return null;
  }

  // Generate reasoning
  const reasoning = `Predicted from ${bestMonth.sources.join(', ')} (${bestMonth.count} signal${bestMonth.count > 1 ? 's' : ''})`;

  // Final confidence is average confidence, capped at 60% (rule-based has limits)
  const finalConfidence = Math.min(60, Math.round(bestMonth.avgConfidence));

  return {
    month: bestMonth.month,
    confidence: finalConfidence,
    reasoning,
  };
}

// ============================================================================
// RELATIONSHIP INFERENCE ALGORITHM
// ============================================================================

/**
 * Infer relationship type based on interaction patterns and metadata
 */
async function inferRelationship(
  input: RelationshipInferenceInput
): Promise<{ type: RelationshipType; confidence: number; reasoning: string } | null> {
  const { contact: _contact, interactionMetrics, contextClues } = input;

  const signals: { type: RelationshipType; confidence: number; reason: string }[] = [];

  // Signal 1: Email domain analysis
  const emailDomain = contextClues?.emailDomain?.toLowerCase();
  if (emailDomain) {
    // Personal email domains suggest friend/family
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    if (personalDomains.includes(emailDomain)) {
      signals.push({
        type: RelationshipType.FRIEND,
        confidence: 40,
        reason: 'personal_email_domain',
      });
    } else {
      // Work domain suggests colleague
      signals.push({
        type: RelationshipType.COLLEAGUE,
        confidence: 60,
        reason: 'work_email_domain',
      });
    }
  }

  // Signal 2: Interaction frequency
  const frequency = interactionMetrics?.communicationFrequency;
  if (frequency) {
    switch (frequency) {
      case 'daily':
        signals.push({
          type: RelationshipType.CLOSE_FRIEND,
          confidence: 70,
          reason: 'daily_communication',
        });
        break;
      case 'weekly':
        signals.push({
          type: RelationshipType.FRIEND,
          confidence: 60,
          reason: 'weekly_communication',
        });
        break;
      case 'monthly':
        signals.push({
          type: RelationshipType.ACQUAINTANCE,
          confidence: 50,
          reason: 'monthly_communication',
        });
        break;
      case 'rare':
        signals.push({
          type: RelationshipType.ACQUAINTANCE,
          confidence: 40,
          reason: 'rare_communication',
        });
        break;
    }
  }

  // Signal 3: Shared connections
  const sharedConnections = interactionMetrics?.sharedConnections || 0;
  if (sharedConnections > 10) {
    signals.push({
      type: RelationshipType.CLOSE_FRIEND,
      confidence: 50,
      reason: 'many_shared_connections',
    });
  } else if (sharedConnections > 5) {
    signals.push({
      type: RelationshipType.FRIEND,
      confidence: 45,
      reason: 'some_shared_connections',
    });
  }

  // Signal 4: Last contact recency
  const lastContact = interactionMetrics?.lastContactDate;
  if (lastContact) {
    const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 7) {
      signals.push({
        type: RelationshipType.CLOSE_FRIEND,
        confidence: 40,
        reason: 'recent_contact',
      });
    } else if (daysSince > 180) {
      signals.push({
        type: RelationshipType.ACQUAINTANCE,
        confidence: 35,
        reason: 'infrequent_contact',
      });
    }
  }

  // Default if no signals
  if (signals.length === 0) {
    return {
      type: RelationshipType.UNKNOWN,
      confidence: 20,
      reasoning: 'Insufficient data for relationship inference',
    };
  }

  // Aggregate signals by type
  const typeCounts: Record<RelationshipType, { count: number; totalConfidence: number; reasons: string[] }> =
    {} as any;

  signals.forEach(signal => {
    if (!typeCounts[signal.type]) {
      typeCounts[signal.type] = { count: 0, totalConfidence: 0, reasons: [] };
    }
    typeCounts[signal.type].count++;
    typeCounts[signal.type].totalConfidence += signal.confidence;
    typeCounts[signal.type].reasons.push(signal.reason);
  });

  // Find best relationship type
  const bestType = Object.entries(typeCounts)
    .map(([type, data]) => ({
      type: type as RelationshipType,
      avgConfidence: data.totalConfidence / data.count,
      count: data.count,
      reasons: data.reasons,
    }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.avgConfidence - a.avgConfidence;
    })[0];

  return {
    type: bestType.type,
    confidence: Math.round(bestType.avgConfidence),
    reasoning: `Inferred from ${bestType.reasons.join(', ')}`,
  };
}

// ============================================================================
// ARCHETYPE TAGGING ALGORITHM
// ============================================================================

/**
 * Tag contact with personality/gifting archetypes
 */
async function tagArchetypes(
  input: ArchetypeTaggingInput
): Promise<Archetype[]> {
  const { contact, behavioralSignals } = input;

  const archetypes: Archetype[] = [];

  // Define archetype detection rules
  const archetypeRules = [
    {
      id: 'tech_enthusiast',
      name: 'Tech Enthusiast',
      description: 'Loves gadgets, technology, and innovation',
      keywords: ['tech', 'gadget', 'coding', 'programming', 'computer', 'software', 'hardware', 'gaming', 'ai', 'robotics'],
      tags: ['tech', 'innovation', 'gadgets'],
    },
    {
      id: 'creative_artist',
      name: 'Creative Artist',
      description: 'Artistic, creative, appreciates handmade and unique items',
      keywords: ['art', 'painting', 'drawing', 'music', 'design', 'creative', 'photography', 'crafts', 'handmade'],
      tags: ['creative', 'artistic', 'unique'],
    },
    {
      id: 'outdoor_adventurer',
      name: 'Outdoor Adventurer',
      description: 'Enjoys nature, outdoor activities, and adventure',
      keywords: ['hiking', 'camping', 'outdoor', 'nature', 'adventure', 'travel', 'climbing', 'skiing', 'surfing'],
      tags: ['outdoors', 'adventure', 'nature'],
    },
    {
      id: 'foodie',
      name: 'Foodie',
      description: 'Passionate about food, cooking, and culinary experiences',
      keywords: ['cooking', 'food', 'culinary', 'restaurant', 'chef', 'baking', 'gourmet', 'wine', 'coffee'],
      tags: ['food', 'culinary', 'dining'],
    },
    {
      id: 'bookworm',
      name: 'Bookworm',
      description: 'Avid reader, enjoys literature and learning',
      keywords: ['reading', 'books', 'literature', 'library', 'novel', 'writing', 'author', 'poetry'],
      tags: ['books', 'reading', 'literature'],
    },
    {
      id: 'fitness_enthusiast',
      name: 'Fitness Enthusiast',
      description: 'Health-conscious, enjoys exercise and wellness',
      keywords: ['fitness', 'gym', 'workout', 'yoga', 'running', 'health', 'wellness', 'sports', 'marathon'],
      tags: ['fitness', 'health', 'wellness'],
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Environmentally conscious, prefers sustainable products',
      keywords: ['eco', 'sustainable', 'environment', 'green', 'organic', 'recycling', 'climate', 'nature'],
      tags: ['eco', 'sustainable', 'environment'],
    },
    {
      id: 'fashionista',
      name: 'Fashionista',
      description: 'Fashion-forward, appreciates style and trends',
      keywords: ['fashion', 'style', 'clothing', 'designer', 'trends', 'beauty', 'makeup', 'accessories'],
      tags: ['fashion', 'style', 'trends'],
    },
  ];

  // Collect all text data from contact
  const textData = [
    contact.fullName || '',
    ...(contact.interests ? Object.values(contact.interests).flat() : []),
    ...(behavioralSignals?.hobbies || []),
    ...(behavioralSignals?.interests || []),
    ...(behavioralSignals?.professionalTitles || []),
  ].join(' ').toLowerCase();

  // Match archetypes
  archetypeRules.forEach(rule => {
    const matches = rule.keywords.filter(keyword => textData.includes(keyword));

    if (matches.length > 0) {
      // Confidence based on match ratio
      const confidence = Math.min(80, Math.round((matches.length / rule.keywords.length) * 100));

      archetypes.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        tags: rule.tags,
        confidence,
      });
    }
  });

  // Sort by confidence
  return archetypes.sort((a, b) => b.confidence - a.confidence).slice(0, 3); // Top 3 archetypes
}

// ============================================================================
// GIFTING PROFILE GENERATION
// ============================================================================

/**
 * Generate gifting profile from archetypes
 */
function generateGiftingProfile(archetypes: Archetype[]): GiftingProfile {
  // Default preferences
  const preferences = {
    sentimental: 50,
    practical: 50,
    experiential: 50,
    luxurious: 50,
  };

  // Adjust based on archetypes
  archetypes.forEach(archetype => {
    const weight = archetype.confidence / 100;

    switch (archetype.id) {
      case 'tech_enthusiast':
        preferences.practical += 20 * weight;
        preferences.luxurious += 15 * weight;
        break;
      case 'creative_artist':
        preferences.sentimental += 25 * weight;
        preferences.experiential += 15 * weight;
        break;
      case 'outdoor_adventurer':
        preferences.experiential += 30 * weight;
        preferences.practical += 10 * weight;
        break;
      case 'foodie':
        preferences.experiential += 25 * weight;
        preferences.luxurious += 15 * weight;
        break;
      case 'bookworm':
        preferences.sentimental += 20 * weight;
        preferences.practical += 10 * weight;
        break;
      case 'fitness_enthusiast':
        preferences.practical += 25 * weight;
        preferences.experiential += 15 * weight;
        break;
      case 'eco_warrior':
        preferences.sentimental += 15 * weight;
        preferences.practical += 20 * weight;
        break;
      case 'fashionista':
        preferences.luxurious += 30 * weight;
        preferences.sentimental += 10 * weight;
        break;
    }
  });

  // Normalize preferences to 0-100
  Object.keys(preferences).forEach(key => {
    preferences[key as keyof typeof preferences] = Math.min(100, Math.max(0, preferences[key as keyof typeof preferences]));
  });

  // Determine primary style
  const styleScores: Record<GiftingStyle, number> = {
    [GiftingStyle.SENTIMENTAL]: preferences.sentimental,
    [GiftingStyle.PRACTICAL]: preferences.practical,
    [GiftingStyle.EXPERIENTIAL]: preferences.experiential,
    [GiftingStyle.LUXURIOUS]: preferences.luxurious,
    [GiftingStyle.CREATIVE]: archetypes.find(a => a.id === 'creative_artist')?.confidence || 0,
    [GiftingStyle.TECH_SAVVY]: archetypes.find(a => a.id === 'tech_enthusiast')?.confidence || 0,
    [GiftingStyle.ECO_CONSCIOUS]: archetypes.find(a => a.id === 'eco_warrior')?.confidence || 0,
    [GiftingStyle.FOODIE]: archetypes.find(a => a.id === 'foodie')?.confidence || 0,
  };

  const primaryStyle = Object.entries(styleScores)
    .sort(([, a], [, b]) => b - a)[0][0] as GiftingStyle;

  // Extract interests from archetypes
  const interests = archetypes.flatMap(a => a.tags);

  return {
    style: primaryStyle,
    preferences,
    interests: [...new Set(interests)], // Unique interests
  };
}
