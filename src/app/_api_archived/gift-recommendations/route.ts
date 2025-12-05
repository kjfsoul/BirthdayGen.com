/**
 * Gift Recommendations API Route
 * Module B - Real AI Intelligence (Phase 4)
 * Module D - AI + Product Integration (Phase 5)
 *
 * Handles POST requests for gift recommendations using GPT-4o.
 * NO mock data - all recommendations are AI-generated based on
 * enriched contact profiles from the auto-populate system.
 *
 * Module D Integration:
 * - After GPT-4o generates recommendations, we query ProductService
 * - Attach real product listings from external APIs (Amazon, Etsy, etc.)
 * - Graceful degradation when APIs not configured
 * - Backward compatible response (existing clients can ignore new fields)
 */

/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import type {
  RecommendationRequest,
  RecommendationResponseWithProducts,
  GiftRecommendationWithProducts,
  ProductsStatus,
  Product,
} from '@/lib/gifts/schema';
import { generateGiftRecommendations, type GiftInput } from '@/lib/ai/openai';
import { fetchProductsForRecommendation } from '@/lib/gifts/productService';

/**
 * Build GiftInput from RecommendationRequest
 */
function buildGiftInput(request: RecommendationRequest): GiftInput {
  const { recipient, occasion, budget, engagementAnswers, excludeCategories, preferredCategories, shippingRequired, urgency } = request;

  return {
    recipientName: recipient.name,
    recipientAge: recipient.age,
    recipientGender: recipient.gender,
    relationship: recipient.relationship,
    occasion,
    budgetMin: budget.min,
    budgetMax: budget.max,
    budgetPreferred: budget.preferred,

    // Enriched data
    giftingStyle: recipient.giftingProfile?.style,
    interests: recipient.giftingProfile?.interests || recipient.interests,
    threeWords: recipient.threeWords,
    vibes: recipient.vibes || engagementAnswers?.pickTheirVibe?.selectedVibes,
    archetypes: recipient.archetypes?.map(a => a.name),

    // Preferences
    excludeCategories,
    preferredCategories,
    shippingRequired,
    urgency,
  };
}

/**
 * Determine products status based on fetch result (Module D)
 *
 * @param products - Products fetched from ProductService
 * @param hadError - Whether an error occurred during fetch
 * @returns Status code indicating result
 */
function determineProductsStatus(
  products: Product[],
  hadError: boolean
): ProductsStatus {
  if (hadError) {
    return 'integration_error';
  }

  if (products.length > 0) {
    return 'ok';
  }

  // Check if any APIs are configured by attempting to detect from environment
  // This is a heuristic - we check if any API keys exist
  const hasAnyApiKey = !!(
    process.env.PRINTIFY_API_KEY ||
    process.env.AMAZON_API_KEY ||
    process.env.ETSY_API_KEY ||
    process.env.TIKTOK_SHOP_API_KEY
  );

  if (!hasAnyApiKey) {
    return 'no_products_configured';
  }

  return 'no_products_found';
}

/**
 * Fetch products for all recommendations (Module D)
 *
 * @param recommendations - GPT-4o recommendations
 * @param budget - Budget constraints from request
 * @returns Recommendations with products attached
 */
async function augmentRecommendationsWithProducts(
  recommendations: import('@/lib/gifts/schema').GiftRecommendation[],
  budget: { min: number; max: number }
): Promise<GiftRecommendationWithProducts[]> {
  const augmentedRecommendations: GiftRecommendationWithProducts[] = [];

  for (const recommendation of recommendations) {
    try {
      // Fetch real products for this recommendation
      const products = await fetchProductsForRecommendation(
        recommendation,
        budget
      );

      // Determine status based on result
      const productsStatus = determineProductsStatus(products, false);

      // Attach products and status to recommendation
      augmentedRecommendations.push({
        ...recommendation,
        products,
        productsStatus,
      });

    } catch (error) {
      // If product fetching fails for any reason, log and continue
      // with empty products array and error status
      console.error(
        `[GiftRecommendations] Error fetching products for recommendation ${recommendation.id}:`,
        error
      );

      augmentedRecommendations.push({
        ...recommendation,
        products: [],
        productsStatus: 'integration_error',
      });
    }
  }

  return augmentedRecommendations;
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

    try {
      // Build input for AI
      const giftInput = buildGiftInput(body);

      // ====================================================================
      // STEP 1: Generate recommendations using GPT-4o (Module B)
      // ====================================================================
      const recommendations = await generateGiftRecommendations(giftInput);

      // If no recommendations found, return helpful message
      if (recommendations.length === 0) {
        return NextResponse.json({
          success: true,
          recommendations: [],
          recipientSummary: `No gifts found matching your criteria. Try adjusting your budget ($${body.budget.min}-$${body.budget.max}) or preferences.`,
          totalMatches: 0,
          processingTime: Date.now() - startTime,
          topCategories: [],
          budgetUtilization: { min: 0, max: 0, average: 0 },
          warnings: ['No matching gifts found. Consider adjusting your criteria.'],
        } as RecommendationResponseWithProducts);
      }

      // ====================================================================
      // STEP 2: Augment with real products (Module D)
      // ====================================================================
      let augmentedRecommendations: GiftRecommendationWithProducts[];
      try {
        console.info(
          `[GiftRecommendations] Fetching products for ${recommendations.length} recommendations...`
        );

        augmentedRecommendations = await augmentRecommendationsWithProducts(
          recommendations,
          { min: body.budget.min, max: body.budget.max }
        );

        // Log product fetch summary
        const withProducts = augmentedRecommendations.filter(r => r.products.length > 0).length;
        const totalProducts = augmentedRecommendations.reduce((sum, r) => sum + r.products.length, 0);

        console.info(
          `[GiftRecommendations] Product fetch complete: ${withProducts}/${recommendations.length} recommendations have products (${totalProducts} total products)`
        );

      } catch (productError) {
        // If product augmentation fails entirely, log error but continue
        // with GPT recommendations only (graceful degradation)
        console.error(
          '[GiftRecommendations] Failed to augment recommendations with products:',
          productError
        );

        // Return GPT recommendations with empty products arrays
        augmentedRecommendations = recommendations.map(rec => ({
          ...rec,
          products: [],
          productsStatus: 'integration_error' as ProductsStatus,
        }));
      }

      // ====================================================================
      // STEP 3: Calculate response metadata
      // ====================================================================
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
      recipientSummary += `, here are ${recommendations.length} AI-powered personalized gift recommendations.`;

      // ====================================================================
      // STEP 4: Build response (Module D - extended type)
      // ====================================================================
      const response: RecommendationResponseWithProducts = {
        success: true,
        recommendations: augmentedRecommendations,
        recipientSummary,
        totalMatches: recommendations.length,
        processingTime: Date.now() - startTime,
        topCategories,
        budgetUtilization,
      };

      return NextResponse.json(response);

    } catch (aiError) {
      // Handle AI-specific errors
      console.error('AI gift generation error:', aiError);

      const errorMessage = aiError instanceof Error ? aiError.message : 'Failed to generate gift recommendations';

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_ERROR',
            message: errorMessage,
          },
        } as RecommendationResponseWithProducts,
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Gift recommendations error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing your request',
        },
      } as RecommendationResponseWithProducts,
      { status: 500 }
    );
  }
}
