/**
 * Gift Recommendations API Route
 * Phase 3 - BirthdayGen.com (AI Gift Recommendation Foundation)
 *
 * Handles POST requests for gift recommendations using rule-based logic.
 * No external APIs - all recommendations are generated from mock data
 * and enriched contact profiles from auto-populate system.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  GiftCategory,
  PriceRange,
  OccasionType,
} from '@/lib/gifts/schema';
import type {
  RecommendationRequest,
  RecommendationResponse,
  GiftRecommendation,
  ProductDetails,
  RecipientProfile,
} from '@/lib/gifts/schema';
import { GiftingStyle } from '@/lib/autopopulate/types';

// ============================================================================
// MOCK PRODUCT DATABASE
// ============================================================================

interface MockProduct {
  id: string;
  name: string;
  description: string;
  category: GiftCategory;
  priceRange: PriceRange;
  estimatedPrice: number;
  tags: string[];
  giftingStyles: GiftingStyle[]; // Which styles this gift suits
  occasions: OccasionType[]; // Which occasions this gift suits
  vibes: string[]; // Which vibes this gift matches
}

const MOCK_PRODUCTS: MockProduct[] = [
  // Tech & Gadgets
  {
    id: 'tech-001',
    name: 'Smart Watch Fitness Tracker',
    description: 'Sleek fitness tracking smartwatch with heart rate monitor and GPS',
    category: GiftCategory.TECH,
    priceRange: PriceRange.PREMIUM,
    estimatedPrice: 199,
    tags: ['tech', 'fitness', 'wearable', 'smart'],
    giftingStyles: [GiftingStyle.TECH_SAVVY, GiftingStyle.PRACTICAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.GRADUATION],
    vibes: ['tech', 'sporty'],
  },
  {
    id: 'tech-002',
    name: 'Wireless Earbuds Pro',
    description: 'Premium noise-canceling wireless earbuds with 24hr battery',
    category: GiftCategory.TECH,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 89,
    tags: ['tech', 'audio', 'wireless', 'music'],
    giftingStyles: [GiftingStyle.TECH_SAVVY, GiftingStyle.PRACTICAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.THANK_YOU],
    vibes: ['tech', 'glam'],
  },

  // Experiences
  {
    id: 'exp-001',
    name: 'Wine Tasting Experience for Two',
    description: 'Guided wine tasting at a local vineyard with cheese pairings',
    category: GiftCategory.EXPERIENCES,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 85,
    tags: ['experience', 'wine', 'romantic', 'date'],
    giftingStyles: [GiftingStyle.EXPERIENTIAL, GiftingStyle.FOODIE],
    occasions: [OccasionType.ANNIVERSARY, OccasionType.VALENTINES, OccasionType.BIRTHDAY],
    vibes: ['foodie', 'glam'],
  },
  {
    id: 'exp-002',
    name: 'Rock Climbing Day Pass + Lesson',
    description: 'Indoor rock climbing facility day pass with instructor-led lesson',
    category: GiftCategory.EXPERIENCES,
    priceRange: PriceRange.AFFORDABLE,
    estimatedPrice: 45,
    tags: ['experience', 'adventure', 'fitness', 'active'],
    giftingStyles: [GiftingStyle.EXPERIENTIAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.JUST_BECAUSE],
    vibes: ['sporty', 'adventurous'],
  },

  // Home & Decor
  {
    id: 'home-001',
    name: 'Luxury Scented Candle Set',
    description: 'Hand-poured soy candles in elegant glass jars with calming scents',
    category: GiftCategory.HOME_DECOR,
    priceRange: PriceRange.AFFORDABLE,
    estimatedPrice: 42,
    tags: ['candles', 'home', 'relaxation', 'luxury'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.LUXURIOUS],
    occasions: [OccasionType.HOUSEWARMING, OccasionType.THANK_YOU, OccasionType.CHRISTMAS],
    vibes: ['cozy', 'zen'],
  },
  {
    id: 'home-002',
    name: 'Vintage Record Player',
    description: 'Classic turntable with modern connectivity and warm sound',
    category: GiftCategory.MUSIC,
    priceRange: PriceRange.PREMIUM,
    estimatedPrice: 179,
    tags: ['music', 'vintage', 'retro', 'home'],
    giftingStyles: [GiftingStyle.CREATIVE, GiftingStyle.SENTIMENTAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.HOUSEWARMING],
    vibes: ['vintage', 'artsy'],
  },

  // Fashion & Beauty
  {
    id: 'fashion-001',
    name: 'Designer Leather Handbag',
    description: 'Timeless leather crossbody bag with gold hardware',
    category: GiftCategory.FASHION,
    priceRange: PriceRange.LUXURY,
    estimatedPrice: 320,
    tags: ['fashion', 'luxury', 'leather', 'designer'],
    giftingStyles: [GiftingStyle.LUXURIOUS],
    occasions: [OccasionType.BIRTHDAY, OccasionType.ANNIVERSARY, OccasionType.CHRISTMAS],
    vibes: ['glam', 'vintage'],
  },
  {
    id: 'beauty-001',
    name: 'Organic Skincare Gift Set',
    description: 'Luxury organic skincare collection with cleanser, serum, and moisturizer',
    category: GiftCategory.BEAUTY,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 78,
    tags: ['beauty', 'skincare', 'organic', 'luxury'],
    giftingStyles: [GiftingStyle.ECO_CONSCIOUS, GiftingStyle.LUXURIOUS],
    occasions: [OccasionType.MOTHERS_DAY, OccasionType.BIRTHDAY, OccasionType.THANK_YOU],
    vibes: ['zen', 'glam'],
  },

  // Personalized & Sentimental
  {
    id: 'personal-001',
    name: 'Custom Star Map Print',
    description: 'Personalized constellation map of a special date and location',
    category: GiftCategory.PERSONALIZED,
    priceRange: PriceRange.AFFORDABLE,
    estimatedPrice: 49,
    tags: ['personalized', 'art', 'romantic', 'custom'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.CREATIVE],
    occasions: [OccasionType.ANNIVERSARY, OccasionType.VALENTINES, OccasionType.WEDDING],
    vibes: ['cosmic', 'artsy'],
  },
  {
    id: 'personal-002',
    name: 'Engraved Leather Journal',
    description: 'High-quality leather journal with custom name engraving',
    category: GiftCategory.PERSONALIZED,
    priceRange: PriceRange.AFFORDABLE,
    estimatedPrice: 38,
    tags: ['personalized', 'stationery', 'writing', 'leather'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.CREATIVE],
    occasions: [OccasionType.GRADUATION, OccasionType.BIRTHDAY, OccasionType.THANK_YOU],
    vibes: ['vintage', 'artsy'],
  },

  // Food & Gourmet
  {
    id: 'food-001',
    name: 'Artisan Chocolate Tasting Box',
    description: 'Curated selection of 12 single-origin chocolates from around the world',
    category: GiftCategory.GOURMET,
    priceRange: PriceRange.AFFORDABLE,
    estimatedPrice: 45,
    tags: ['chocolate', 'gourmet', 'food', 'luxury'],
    giftingStyles: [GiftingStyle.FOODIE, GiftingStyle.LUXURIOUS],
    occasions: [OccasionType.VALENTINES, OccasionType.THANK_YOU, OccasionType.CHRISTMAS],
    vibes: ['foodie', 'glam'],
  },
  {
    id: 'food-002',
    name: 'Specialty Coffee Subscription (3 months)',
    description: 'Monthly delivery of freshly roasted specialty coffee beans',
    category: GiftCategory.SUBSCRIPTION,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 75,
    tags: ['coffee', 'subscription', 'gourmet', 'food'],
    giftingStyles: [GiftingStyle.FOODIE, GiftingStyle.PRACTICAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.THANK_YOU],
    vibes: ['foodie', 'cozy'],
  },

  // Wellness & Sports
  {
    id: 'wellness-001',
    name: 'Yoga Mat & Block Set',
    description: 'Premium eco-friendly yoga mat with matching blocks and strap',
    category: GiftCategory.WELLNESS,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 68,
    tags: ['yoga', 'fitness', 'wellness', 'eco'],
    giftingStyles: [GiftingStyle.ECO_CONSCIOUS, GiftingStyle.PRACTICAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.JUST_BECAUSE],
    vibes: ['zen', 'sporty'],
  },
  {
    id: 'sports-001',
    name: 'Hiking Backpack with Hydration',
    description: 'Lightweight 25L hiking backpack with built-in hydration system',
    category: GiftCategory.SPORTS,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 89,
    tags: ['hiking', 'outdoors', 'sports', 'adventure'],
    giftingStyles: [GiftingStyle.PRACTICAL],
    occasions: [OccasionType.BIRTHDAY, OccasionType.GRADUATION, OccasionType.CHRISTMAS],
    vibes: ['adventurous', 'sporty'],
  },

  // Art & Creative
  {
    id: 'art-001',
    name: 'Professional Watercolor Paint Set',
    description: '48-color watercolor set with brushes and premium paper pad',
    category: GiftCategory.ART,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 72,
    tags: ['art', 'painting', 'creative', 'hobby'],
    giftingStyles: [GiftingStyle.CREATIVE],
    occasions: [OccasionType.BIRTHDAY, OccasionType.CHRISTMAS, OccasionType.JUST_BECAUSE],
    vibes: ['artsy', 'zen'],
  },
  {
    id: 'handmade-001',
    name: 'Hand-Knit Wool Throw Blanket',
    description: 'Cozy hand-knit blanket made from sustainably sourced merino wool',
    category: GiftCategory.HANDMADE,
    priceRange: PriceRange.PREMIUM,
    estimatedPrice: 135,
    tags: ['handmade', 'cozy', 'home', 'sustainable'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.ECO_CONSCIOUS],
    occasions: [OccasionType.HOUSEWARMING, OccasionType.CHRISTMAS, OccasionType.WEDDING],
    vibes: ['cozy', 'vintage'],
  },

  // Jewelry
  {
    id: 'jewelry-001',
    name: 'Moonstone Pendant Necklace',
    description: 'Delicate sterling silver necklace with natural moonstone',
    category: GiftCategory.JEWELRY,
    priceRange: PriceRange.MODERATE,
    estimatedPrice: 92,
    tags: ['jewelry', 'moonstone', 'necklace', 'mystical'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.LUXURIOUS],
    occasions: [OccasionType.BIRTHDAY, OccasionType.MOTHERS_DAY, OccasionType.VALENTINES],
    vibes: ['cosmic', 'glam'],
  },

  // Books
  {
    id: 'books-001',
    name: 'Rare First Edition Classic Novel',
    description: 'Beautifully bound first edition of a literary classic',
    category: GiftCategory.BOOKS,
    priceRange: PriceRange.PREMIUM,
    estimatedPrice: 145,
    tags: ['books', 'literature', 'vintage', 'collector'],
    giftingStyles: [GiftingStyle.SENTIMENTAL, GiftingStyle.CREATIVE],
    occasions: [OccasionType.BIRTHDAY, OccasionType.GRADUATION, OccasionType.CHRISTMAS],
    vibes: ['vintage', 'artsy'],
  },
];

// ============================================================================
// RECOMMENDATION ENGINE - RULE-BASED LOGIC
// ============================================================================

/**
 * Calculate match score for a product based on recipient profile
 */
function calculateMatchScore(
  product: MockProduct,
  request: RecommendationRequest
): { score: number; factors: GiftRecommendation['matchFactors']; reasoning: string } {
  const { recipient, occasion, budget, engagementAnswers, preferredCategories } = request;

  let totalScore = 0;
  const factors: GiftRecommendation['matchFactors'] = {
    giftingStyleMatch: 0,
    archetypeMatch: 0,
    occasionMatch: 0,
    budgetMatch: 0,
    relationshipMatch: 0,
  };
  const reasoningParts: string[] = [];

  // 1. GIFTING STYLE MATCH (30% weight)
  if (recipient.giftingProfile?.style) {
    const styleMatch = product.giftingStyles.includes(recipient.giftingProfile.style);
    factors.giftingStyleMatch = styleMatch ? 90 : 40;
    totalScore += factors.giftingStyleMatch * 0.3;

    if (styleMatch) {
      reasoningParts.push(`Matches ${recipient.giftingProfile.style} gifting style`);
    }
  } else {
    factors.giftingStyleMatch = 50; // Neutral when unknown
    totalScore += 50 * 0.3;
  }

  // 2. OCCASION MATCH (25% weight)
  const occasionMatch = product.occasions.includes(occasion);
  factors.occasionMatch = occasionMatch ? 95 : 50;
  totalScore += factors.occasionMatch * 0.25;

  if (occasionMatch) {
    reasoningParts.push(`Perfect for ${occasion}`);
  }

  // 3. BUDGET MATCH (20% weight)
  const inBudget = product.estimatedPrice >= budget.min && product.estimatedPrice <= budget.max;
  const budgetProximity = budget.preferred
    ? 100 - Math.min(Math.abs(product.estimatedPrice - budget.preferred) / budget.preferred * 100, 100)
    : inBudget ? 80 : 30;

  factors.budgetMatch = budgetProximity;
  totalScore += budgetProximity * 0.2;

  if (inBudget) {
    reasoningParts.push(`Within your $${budget.min}-$${budget.max} budget`);
  }

  // 4. VIBE/ENGAGEMENT MATCH (15% weight)
  let vibeScore = 50; // Default neutral
  if (engagementAnswers?.pickTheirVibe?.selectedVibes) {
    const vibesMatch = product.vibes.some(v =>
      engagementAnswers.pickTheirVibe!.selectedVibes.includes(v)
    );
    vibeScore = vibesMatch ? 95 : 40;

    if (vibesMatch) {
      const matchedVibes = product.vibes.filter(v =>
        engagementAnswers.pickTheirVibe!.selectedVibes.includes(v)
      );
      reasoningParts.push(`Matches "${matchedVibes[0]}" vibe you selected`);
    }
  }
  factors.archetypeMatch = vibeScore;
  totalScore += vibeScore * 0.15;

  // 5. RELATIONSHIP CONTEXT (10% weight)
  // Adjust based on relationship formality
  let relationshipScore = 70; // Default
  if (recipient.relationship) {
    switch (recipient.relationship) {
      case 'family':
      case 'close_friend':
        // Prefer sentimental, experiential, or personalized
        if ([GiftCategory.PERSONALIZED, GiftCategory.EXPERIENCES, GiftCategory.HANDMADE].includes(product.category)) {
          relationshipScore = 90;
          reasoningParts.push(`Great for close relationships`);
        }
        break;
      case 'colleague':
      case 'professional':
        // Prefer practical, neutral gifts
        if ([GiftCategory.GIFT_CARDS, GiftCategory.FOOD, GiftCategory.BOOKS].includes(product.category)) {
          relationshipScore = 85;
        }
        break;
    }
  }
  factors.relationshipMatch = relationshipScore;
  totalScore += relationshipScore * 0.1;

  // 6. PREFERRED CATEGORIES BOOST
  if (preferredCategories?.includes(product.category)) {
    totalScore += 10;
    reasoningParts.push(`In your preferred "${product.category}" category`);
  }

  const reasoning = reasoningParts.length > 0
    ? reasoningParts.join('. ') + '.'
    : 'Good general match for this occasion.';

  return { score: Math.round(totalScore), factors, reasoning };
}

/**
 * Generate user-friendly "why this gift" explanation
 */
function generateWhyThisGift(
  product: MockProduct,
  recipient: RecipientProfile,
  request: RecommendationRequest
): string {
  const parts: string[] = [];

  // Lead with recipient context
  if (recipient.threeWords && recipient.threeWords.length > 0) {
    parts.push(`Since ${recipient.name || 'they'} is ${recipient.threeWords.join(', ')}`);
  } else if (recipient.giftingProfile?.style) {
    parts.push(`Based on their ${recipient.giftingProfile.style} style`);
  }

  // Add product benefit
  parts.push(`this ${product.name.toLowerCase()} is a perfect choice`);

  // Add specific reasoning
  if (product.category === GiftCategory.EXPERIENCES) {
    parts.push('for creating memorable moments together');
  } else if (product.category === GiftCategory.PERSONALIZED) {
    parts.push('for showing thoughtful, personal attention');
  } else if (product.category === GiftCategory.TECH) {
    parts.push('for combining practicality with innovation');
  } else {
    parts.push(`for ${request.occasion.replace('_', ' ')}`);
  }

  return parts.join(' ') + '.';
}

/**
 * Main recommendation engine
 */
function generateRecommendations(request: RecommendationRequest): GiftRecommendation[] {
  const startTime = Date.now();

  // Filter products by budget first
  const affordableProducts = MOCK_PRODUCTS.filter(p =>
    p.estimatedPrice >= request.budget.min &&
    p.estimatedPrice <= request.budget.max
  );

  // Filter out excluded categories
  const filteredProducts = affordableProducts.filter(p =>
    !request.excludeCategories?.includes(p.category)
  );

  // Calculate scores for all products
  const scoredProducts = filteredProducts.map(product => {
    const { score, factors, reasoning } = calculateMatchScore(product, request);

    const recommendation: GiftRecommendation = {
      id: `rec-${product.id}-${Date.now()}`,
      product: {
        name: product.name,
        description: product.description,
        category: product.category,
        priceRange: product.priceRange,
        estimatedPrice: product.estimatedPrice,
        tags: product.tags,
      },
      confidence: score,
      reasoning,
      matchFactors: factors,
      whyThisGift: generateWhyThisGift(product, request.recipient, request),
      personalizeIdea: `Add a handwritten note about ${request.recipient.name}'s special qualities to make this gift even more meaningful.`,
    };

    return recommendation;
  });

  // Sort by confidence score and return top 10
  const topRecommendations = scoredProducts
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  return topRecommendations;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RecommendationRequest;

    // Validate request
    if (!body.recipient || !body.occasion || !body.budget) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: recipient, occasion, or budget',
          },
        },
        { status: 400 }
      );
    }

    // Validate budget
    if (body.budget.min < 0 || body.budget.max < body.budget.min) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_BUDGET',
            message: 'Budget must be positive and max must be greater than min',
          },
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Generate recommendations
    const recommendations = generateRecommendations(body);

    // If no recommendations found, return helpful message
    if (recommendations.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        recipientSummary: `No gifts found in your budget range ($${body.budget.min}-$${body.budget.max}). Try expanding your budget or adjusting preferences.`,
        totalMatches: 0,
        processingTime: Date.now() - startTime,
        topCategories: [],
        budgetUtilization: { min: 0, max: 0, average: 0 },
        warnings: ['No matching products found. Consider adjusting your budget or preferences.'],
      } as RecommendationResponse);
    }

    // Calculate response metadata
    const topCategories = [...new Set(recommendations.map(r => r.product.category))].slice(0, 5);
    const prices = recommendations.map(r => r.product.estimatedPrice || 0);
    const budgetUtilization = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };

    // Generate recipient summary
    let recipientSummary = `Based on `;
    if (body.recipient.threeWords && body.recipient.threeWords.length > 0) {
      recipientSummary += `your description of ${body.recipient.name || 'them'} as ${body.recipient.threeWords.join(', ')}`;
    } else if (body.recipient.giftingProfile) {
      recipientSummary += `their ${body.recipient.giftingProfile.style} gifting style`;
    } else {
      recipientSummary += `the occasion and your preferences`;
    }
    recipientSummary += `, here are ${recommendations.length} personalized gift recommendations.`;

    const response: RecommendationResponse = {
      success: true,
      recommendations,
      recipientSummary,
      totalMatches: recommendations.length,
      processingTime: Date.now() - startTime,
      topCategories,
      budgetUtilization,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Gift recommendations error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating recommendations',
        },
      } as RecommendationResponse,
      { status: 500 }
    );
  }
}
