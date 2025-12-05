/**
 * OpenAI GPT-4o Integration for Gift Recommendations
 * Module B - Real AI Intelligence (Phase 4)
 *
 * Provides GPT-4o-backed gift recommendations with structured outputs.
 * NO mock data, NO fallbacks - fails gracefully with clear errors.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import type {
  GiftRecommendation,
  GiftCategory,
  PriceRange,
} from '@/lib/gifts/schema';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Initialize OpenAI client
 * Throws error if OPENAI_API_KEY is not configured
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Please set this environment variable to enable AI gift recommendations.'
    );
  }

  return new OpenAI({
    apiKey,
  });
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

/**
 * Zod schema for individual gift recommendation from GPT-4o
 */
const GiftRecommendationSchema = z.object({
  product_name: z.string().min(1),
  description: z.string().min(10),
  category: z.enum([
    'experiences', 'events', 'travel',
    'tech', 'fashion', 'home_decor', 'beauty', 'books',
    'food', 'wine', 'gourmet',
    'sports', 'gaming', 'art', 'music', 'wellness',
    'personalized', 'handmade', 'jewelry',
    'subscription', 'gift_cards', 'eco_friendly',
  ]),
  price_range: z.enum(['budget', 'affordable', 'moderate', 'premium', 'luxury']),
  estimated_price: z.number().min(0),
  tags: z.array(z.string()).min(1),
  confidence_score: z.number().min(0).max(100),
  reasoning: z.string().min(10),
  why_this_gift: z.string().min(10),
  personalize_idea: z.string().min(10),
  match_factors: z.object({
    gifting_style_match: z.number().min(0).max(100),
    archetype_match: z.number().min(0).max(100),
    occasion_match: z.number().min(0).max(100),
    budget_match: z.number().min(0).max(100),
    relationship_match: z.number().min(0).max(100),
  }),
});

/**
 * Zod schema for complete GPT-4o response
 */
const GiftRecommendationsResponseSchema = z.object({
  recommendations: z.array(GiftRecommendationSchema).min(1).max(10),
  recipient_summary: z.string().min(10),
  top_categories: z.array(z.string()).min(1).max(5),
});

// Removed unused types GPTRecommendation and GPTRecommendationsResponse

// ============================================================================
// GIFT INPUT TYPE
// ============================================================================

export interface GiftInput {
  recipientName: string;
  recipientAge?: number;
  recipientGender?: string;
  relationship?: string;
  occasion: string;
  budgetMin: number;
  budgetMax: number;
  budgetPreferred?: number;

  // Enriched data
  giftingStyle?: string;
  interests?: string[];
  threeWords?: string[];
  vibes?: string[];
  archetypes?: string[];

  // Preferences
  excludeCategories?: string[];
  preferredCategories?: string[];
  shippingRequired?: boolean;
  urgency?: string;
}

// ============================================================================
// MAIN AI FUNCTION
// ============================================================================

/**
 * Generate gift recommendations using GPT-4o
 *
 * @param input - Gift recommendation input parameters
 * @returns Array of gift recommendations with confidence scores
 * @throws Error if OpenAI API is not configured or request fails
 */
export async function generateGiftRecommendations(
  input: GiftInput
): Promise<GiftRecommendation[]> {
  const client = getOpenAIClient();

  // Build context for GPT-4o
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  try {
    // Call GPT-4o with structured output using JSON mode
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8, // Creative but not too random
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('OpenAI returned empty response');
    }

    // Parse and validate response
    const parsedResponse = JSON.parse(responseContent);
    const validatedResponse = GiftRecommendationsResponseSchema.parse(parsedResponse);

    // Transform GPT response to our internal format
    const recommendations: GiftRecommendation[] = validatedResponse.recommendations.map(
      (rec, index) => ({
        id: `ai-${Date.now()}-${index}`,
        product: {
          name: rec.product_name,
          description: rec.description,
          category: rec.category as GiftCategory,
          priceRange: rec.price_range as PriceRange,
          estimatedPrice: rec.estimated_price,
          tags: rec.tags,
        },
        confidence: rec.confidence_score,
        reasoning: rec.reasoning,
        matchFactors: {
          giftingStyleMatch: rec.match_factors.gifting_style_match,
          archetypeMatch: rec.match_factors.archetype_match,
          occasionMatch: rec.match_factors.occasion_match,
          budgetMatch: rec.match_factors.budget_match,
          relationshipMatch: rec.match_factors.relationship_match,
        },
        whyThisGift: rec.why_this_gift,
        personalizeIdea: rec.personalize_idea,
      })
    );

    return recommendations;
  } catch (error) {
    // Handle errors gracefully
    if (error instanceof z.ZodError) {
      console.error('OpenAI response validation failed:', error);
      throw new Error(
        'AI generated invalid gift recommendations. Please try again.'
      );
    }

    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error.message, error.status);

      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check configuration.');
      }

      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }

      throw new Error(`OpenAI API error: ${error.message}`);
    }

    console.error('Unexpected error in generateGiftRecommendations:', error);
    throw new Error('Failed to generate gift recommendations. Please try again.');
  }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build system prompt for GPT-4o
 */
function buildSystemPrompt(): string {
  return `You are an expert gift recommendation AI for BirthdayGen.com, specializing in personalized, thoughtful gift suggestions.

Your task is to analyze recipient profiles and generate highly relevant gift recommendations with detailed reasoning.

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "product_name": "string",
      "description": "string (min 10 chars)",
      "category": "experiences|events|travel|tech|fashion|home_decor|beauty|books|food|wine|gourmet|sports|gaming|art|music|wellness|personalized|handmade|jewelry|subscription|gift_cards|eco_friendly",
      "price_range": "budget|affordable|moderate|premium|luxury",
      "estimated_price": number,
      "tags": ["string"],
      "confidence_score": number (0-100),
      "reasoning": "string (explain why this matches their profile)",
      "why_this_gift": "string (user-friendly explanation)",
      "personalize_idea": "string (how to make it more personal)",
      "match_factors": {
        "gifting_style_match": number (0-100),
        "archetype_match": number (0-100),
        "occasion_match": number (0-100),
        "budget_match": number (0-100),
        "relationship_match": number (0-100)
      }
    }
  ],
  "recipient_summary": "string (summarize the recipient's profile)",
  "top_categories": ["string"] (1-5 most relevant categories)
}

GUIDELINES:
1. Generate 5-10 diverse gift recommendations
2. Prioritize uniqueness and personalization over generic gifts
3. Consider the relationship context (formal vs. close)
4. Match the occasion appropriately
5. Stay within the specified budget range
6. Use the recipient's interests, vibes, and personality traits
7. Provide specific, actionable gift ideas (not vague categories)
8. Explain your reasoning clearly
9. Suggest how to personalize each gift
10. Calculate realistic match factors based on the input data

IMPORTANT:
- Return ONLY valid JSON matching the schema above
- NO markdown formatting, NO code blocks, NO extra text
- Ensure all numeric fields are actual numbers, not strings
- Ensure all required fields are present and non-empty`;
}

/**
 * Build user prompt with recipient context
 */
function buildUserPrompt(input: GiftInput): string {
  const parts: string[] = [];

  // Recipient basics
  parts.push(`RECIPIENT PROFILE:`);
  parts.push(`- Name: ${input.recipientName}`);

  if (input.recipientAge) {
    parts.push(`- Age: ${input.recipientAge}`);
  }

  if (input.recipientGender) {
    parts.push(`- Gender: ${input.recipientGender}`);
  }

  if (input.relationship) {
    parts.push(`- Relationship: ${input.relationship}`);
  }

  // Enriched profile data
  if (input.giftingStyle) {
    parts.push(`- Gifting Style: ${input.giftingStyle}`);
  }

  if (input.interests && input.interests.length > 0) {
    parts.push(`- Interests: ${input.interests.join(', ')}`);
  }

  if (input.threeWords && input.threeWords.length > 0) {
    parts.push(`- Personality (3 words): ${input.threeWords.join(', ')}`);
  }

  if (input.vibes && input.vibes.length > 0) {
    parts.push(`- Vibes/Aesthetics: ${input.vibes.join(', ')}`);
  }

  if (input.archetypes && input.archetypes.length > 0) {
    parts.push(`- Archetypes: ${input.archetypes.join(', ')}`);
  }

  // Occasion and budget
  parts.push('');
  parts.push(`OCCASION: ${input.occasion}`);
  parts.push('');
  parts.push(`BUDGET:`);
  parts.push(`- Range: $${input.budgetMin} - $${input.budgetMax}`);

  if (input.budgetPreferred) {
    parts.push(`- Preferred: $${input.budgetPreferred}`);
  }

  // Preferences and constraints
  if (input.preferredCategories && input.preferredCategories.length > 0) {
    parts.push('');
    parts.push(`PREFERRED CATEGORIES: ${input.preferredCategories.join(', ')}`);
  }

  if (input.excludeCategories && input.excludeCategories.length > 0) {
    parts.push('');
    parts.push(`EXCLUDE CATEGORIES: ${input.excludeCategories.join(', ')}`);
  }

  if (input.shippingRequired !== undefined) {
    parts.push('');
    parts.push(`Shipping Required: ${input.shippingRequired ? 'Yes' : 'No'}`);
  }

  if (input.urgency) {
    parts.push(`Urgency: ${input.urgency}`);
  }

  parts.push('');
  parts.push('Please generate personalized gift recommendations based on this profile.');

  return parts.join('\n');
}
