/**
 * Engagement Game Processor
 * Phase 3 - BirthdayGen.com (AI Gift Recommendation Foundation)
 *
 * Processes engagement game answers into structured data for recommendations.
 * Maps game data to recommendation parameters and enhances recipient profiles.
 */

import type {
  EngagementGameAnswers,
  RecipientProfile,
  ThreeWordsGameAnswer,
  PickTheirVibeGameAnswer,
  OccasionType,
} from '@/lib/gifts/schema';
import { VIBE_OPTIONS, GiftCategory } from '@/lib/gifts/schema';
import type { EnrichedContact, GiftingProfile, GiftingStyle } from '@/lib/autopopulate/types';

// ============================================================================
// ENGAGEMENT DATA PROCESSING
// ============================================================================

/**
 * Process ThreeWordsGame answer to extract insights
 */
export function processThreeWordsAnswer(answer: ThreeWordsGameAnswer): {
  inferredGiftingStyle: GiftingStyle | null;
  preferredCategories: GiftCategory[];
  personalityInsights: string[];
} {
  const { extractedTraits } = answer;

  // Infer gifting style from personality traits
  let inferredGiftingStyle: GiftingStyle | null = null;

  if (extractedTraits.personality.includes('creative') || extractedTraits.personality.includes('artistic')) {
    inferredGiftingStyle = 'creative' as GiftingStyle;
  } else if (extractedTraits.personality.includes('adventurous') || extractedTraits.personality.includes('outdoorsy')) {
    inferredGiftingStyle = 'experiential' as GiftingStyle;
  } else if (extractedTraits.personality.includes('tech') || extractedTraits.personality.includes('intellectual')) {
    inferredGiftingStyle = 'tech_savvy' as GiftingStyle;
  } else if (extractedTraits.personality.includes('sophisticated') || extractedTraits.aesthetic.includes('luxurious')) {
    inferredGiftingStyle = 'luxurious' as GiftingStyle;
  } else if (extractedTraits.personality.includes('practical') || extractedTraits.personality.includes('pragmatic')) {
    inferredGiftingStyle = 'practical' as GiftingStyle;
  } else if (extractedTraits.personality.includes('thoughtful') || extractedTraits.personality.includes('caring')) {
    inferredGiftingStyle = 'sentimental' as GiftingStyle;
  } else if (extractedTraits.aesthetic.includes('natural') || extractedTraits.personality.includes('spiritual')) {
    inferredGiftingStyle = 'eco_conscious' as GiftingStyle;
  }

  // Map traits to preferred gift categories
  const preferredCategories: GiftCategory[] = [];

  // Personality-based categories
  if (extractedTraits.personality.includes('creative')) {
    preferredCategories.push(GiftCategory.ART, GiftCategory.HANDMADE);
  }
  if (extractedTraits.personality.includes('adventurous')) {
    preferredCategories.push(GiftCategory.EXPERIENCES, GiftCategory.TRAVEL, GiftCategory.SPORTS);
  }
  if (extractedTraits.personality.includes('tech')) {
    preferredCategories.push(GiftCategory.TECH, GiftCategory.GAMING);
  }
  if (extractedTraits.personality.includes('sophisticated')) {
    preferredCategories.push(GiftCategory.FASHION, GiftCategory.BEAUTY, GiftCategory.WINE);
  }
  if (extractedTraits.personality.includes('outdoorsy')) {
    preferredCategories.push(GiftCategory.SPORTS, GiftCategory.WELLNESS, GiftCategory.EXPERIENCES);
  }
  if (extractedTraits.personality.includes('spiritual')) {
    preferredCategories.push(GiftCategory.WELLNESS, GiftCategory.BOOKS);
  }

  // Aesthetic-based categories
  if (extractedTraits.aesthetic.includes('luxurious') || extractedTraits.aesthetic.includes('glam')) {
    preferredCategories.push(GiftCategory.FASHION, GiftCategory.JEWELRY, GiftCategory.BEAUTY);
  }
  if (extractedTraits.aesthetic.includes('minimalist')) {
    preferredCategories.push(GiftCategory.HOME_DECOR, GiftCategory.TECH);
  }
  if (extractedTraits.aesthetic.includes('vintage')) {
    preferredCategories.push(GiftCategory.BOOKS, GiftCategory.MUSIC, GiftCategory.HOME_DECOR);
  }
  if (extractedTraits.aesthetic.includes('bohemian')) {
    preferredCategories.push(GiftCategory.HANDMADE, GiftCategory.ART, GiftCategory.JEWELRY);
  }
  if (extractedTraits.aesthetic.includes('natural')) {
    preferredCategories.push(GiftCategory.ECO_FRIENDLY, GiftCategory.WELLNESS);
  }

  // Tone-based insights (for messaging)
  const personalityInsights: string[] = [];

  if (extractedTraits.tone.includes('playful')) {
    personalityInsights.push('Has a fun, lighthearted personality');
  }
  if (extractedTraits.tone.includes('sophisticated')) {
    personalityInsights.push('Appreciates refined, elegant things');
  }
  if (extractedTraits.tone.includes('warm')) {
    personalityInsights.push('Values emotional connection and thoughtfulness');
  }
  if (extractedTraits.tone.includes('edgy')) {
    personalityInsights.push('Likes bold, unconventional choices');
  }
  if (extractedTraits.tone.includes('calm')) {
    personalityInsights.push('Prefers peaceful, serene experiences');
  }

  // Remove duplicates from categories
  const uniqueCategories = Array.from(new Set(preferredCategories));

  return {
    inferredGiftingStyle,
    preferredCategories: uniqueCategories,
    personalityInsights,
  };
}

/**
 * Process PickTheirVibeGame answer to extract category preferences
 */
export function processPickTheirVibeAnswer(answer: PickTheirVibeGameAnswer): {
  preferredCategories: GiftCategory[];
  aestheticTags: string[];
  vibeDescriptions: string[];
} {
  const { selectedVibes } = answer;

  const preferredCategories: GiftCategory[] = [];
  const aestheticTags: string[] = [];
  const vibeDescriptions: string[] = [];

  selectedVibes.forEach((vibeId) => {
    const vibe = VIBE_OPTIONS.find((v) => v.id === vibeId);
    if (vibe) {
      // Add associated categories
      vibe.associatedCategories.forEach((cat) => preferredCategories.push(cat));

      // Add aesthetic tags
      vibe.aestheticTags.forEach((tag) => aestheticTags.push(tag));

      // Add vibe description
      vibeDescriptions.push(vibe.description);
    }
  });

  // Remove duplicates
  const uniqueCategories = Array.from(new Set(preferredCategories));
  const uniqueAestheticTags = Array.from(new Set(aestheticTags));

  return {
    preferredCategories: uniqueCategories,
    aestheticTags: uniqueAestheticTags,
    vibeDescriptions,
  };
}

// ============================================================================
// RECIPIENT PROFILE ENHANCEMENT
// ============================================================================

/**
 * Enhance recipient profile with engagement game data
 * Combines auto-populate enriched contact data with engagement game insights
 */
export function enhanceRecipientProfile(
  baseProfile: Partial<RecipientProfile>,
  engagementAnswers: EngagementGameAnswers,
  enrichedContact?: EnrichedContact | null
): RecipientProfile {
  // Start with base profile
  const enhanced: RecipientProfile = {
    name: baseProfile.name || 'Recipient',
    relationship: baseProfile.relationship,
    giftingProfile: baseProfile.giftingProfile,
    archetypes: baseProfile.archetypes,
    interests: baseProfile.interests || [],
  };

  // Add enriched contact data if available
  if (enrichedContact) {
    enhanced.relationship = enrichedContact.inferredRelationship?.type;
    enhanced.giftingProfile = enrichedContact.giftingProfile;
    enhanced.archetypes = enrichedContact.archetypes;
    enhanced.enrichmentConfidence = enrichedContact.enrichmentMetadata?.confidence?.overall;
  }

  // Process ThreeWordsGame data
  if (engagementAnswers.threeWords) {
    enhanced.threeWords = engagementAnswers.threeWords.words;

    const processed = processThreeWordsAnswer(engagementAnswers.threeWords);

    // Override gifting style if inferred from game (game data is more recent/accurate)
    if (processed.inferredGiftingStyle) {
      enhanced.giftingProfile = {
        ...enhanced.giftingProfile,
        style: processed.inferredGiftingStyle,
      } as GiftingProfile;
    }

    // Add inferred interests from personality traits
    const personalityTraits = engagementAnswers.threeWords.extractedTraits.personality;
    enhanced.interests = Array.from(new Set([...(enhanced.interests || []), ...personalityTraits]));
  }

  // Process PickTheirVibeGame data
  if (engagementAnswers.pickTheirVibe) {
    enhanced.vibes = engagementAnswers.pickTheirVibe.selectedVibes;

    const processed = processPickTheirVibeAnswer(engagementAnswers.pickTheirVibe);

    // Add aesthetic tags as interests
    enhanced.interests = Array.from(new Set([...(enhanced.interests || []), ...processed.aestheticTags]));
  }

  return enhanced;
}

// ============================================================================
// RECOMMENDATION REQUEST BUILDER
// ============================================================================

/**
 * Build a complete recommendation request from engagement data
 */
export function buildRecommendationRequest(
  recipientProfile: RecipientProfile,
  engagementAnswers: EngagementGameAnswers,
  options: {
    occasion: string;
    budgetMin: number;
    budgetMax: number;
    budgetPreferred?: number;
    urgency?: 'low' | 'medium' | 'high';
  }
): {
  recipient: RecipientProfile;
  occasion: string;
  budget: { min: number; max: number; preferred?: number };
  engagementAnswers: EngagementGameAnswers;
  preferredCategories: GiftCategory[];
  urgency?: 'low' | 'medium' | 'high';
} {
  // Collect all preferred categories from both games
  let preferredCategories: GiftCategory[] = [];

  if (engagementAnswers.threeWords) {
    const processed = processThreeWordsAnswer(engagementAnswers.threeWords);
    preferredCategories.push(...processed.preferredCategories);
  }

  if (engagementAnswers.pickTheirVibe) {
    preferredCategories.push(...engagementAnswers.pickTheirVibe.categoryPreferences);
  }

  // Remove duplicates and keep top 5 categories
  preferredCategories = Array.from(new Set(preferredCategories)).slice(0, 5);

  return {
    recipient: recipientProfile,
    occasion: options.occasion as OccasionType,
    budget: {
      min: options.budgetMin,
      max: options.budgetMax,
      preferred: options.budgetPreferred,
    },
    engagementAnswers,
    preferredCategories,
    urgency: options.urgency,
  };
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate human-readable insights from engagement data
 */
export function generateEngagementInsights(
  engagementAnswers: EngagementGameAnswers
): {
  summary: string;
  keyTraits: string[];
  giftingHints: string[];
} {
  const keyTraits: string[] = [];
  const giftingHints: string[] = [];

  // Process ThreeWordsGame insights
  if (engagementAnswers.threeWords) {
    const { extractedTraits } = engagementAnswers.threeWords;

    // Add personality traits
    keyTraits.push(...extractedTraits.personality.slice(0, 3));
    keyTraits.push(...extractedTraits.tone.slice(0, 2));

    // Generate gifting hints from traits
    const processed = processThreeWordsAnswer(engagementAnswers.threeWords);
    processed.personalityInsights.forEach((insight) => giftingHints.push(insight));
  }

  // Process PickTheirVibeGame insights
  if (engagementAnswers.pickTheirVibe) {
    const { selectedVibes } = engagementAnswers.pickTheirVibe;

    selectedVibes.forEach((vibeId) => {
      const vibe = VIBE_OPTIONS.find((v) => v.id === vibeId);
      if (vibe) {
        keyTraits.push(vibe.label.toLowerCase());
        giftingHints.push(`Appreciates ${vibe.description.toLowerCase()}`);
      }
    });
  }

  // Generate summary
  let summary = 'Based on your inputs, ';

  if (engagementAnswers.threeWords) {
    summary += `they are ${engagementAnswers.threeWords.words.join(', ')}`;
  }

  if (engagementAnswers.pickTheirVibe && engagementAnswers.pickTheirVibe.selectedVibes.length > 0) {
    const vibeLabels = engagementAnswers.pickTheirVibe.selectedVibes
      .map((vibeId) => VIBE_OPTIONS.find((v) => v.id === vibeId)?.label.toLowerCase())
      .filter(Boolean);

    if (engagementAnswers.threeWords) {
      summary += ` with ${vibeLabels.join(' and ')} vibes`;
    } else {
      summary += `they have ${vibeLabels.join(' and ')} vibes`;
    }
  }

  summary += '. We\'ll find gifts that match their unique personality!';

  // Remove duplicates from key traits
  const uniqueKeyTraits = Array.from(new Set(keyTraits));

  return {
    summary,
    keyTraits: uniqueKeyTraits,
    giftingHints,
  };
}
