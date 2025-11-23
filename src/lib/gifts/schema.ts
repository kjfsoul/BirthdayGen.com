/**
 * Gift Recommendation Engine - Type Definitions & Schema
 * Phase 3 - BirthdayGen.com (AI Gift Recommendation Foundation)
 * 
 * Defines all types for gift recommendations, engagement games,
 * recipient profiling, and recommendation logic.
 */

import type { EnrichedContact, GiftingProfile, GiftingStyle, RelationshipType } from '@/lib/autopopulate/types';

// ============================================================================
// CORE GIFT RECOMMENDATION TYPES
// ============================================================================

/**
 * Gift category taxonomy
 */
export enum GiftCategory {
  // Experience-based
  EXPERIENCES = 'experiences',
  EVENTS = 'events',
  TRAVEL = 'travel',
  
  // Physical gifts
  TECH = 'tech',
  FASHION = 'fashion',
  HOME_DECOR = 'home_decor',
  BEAUTY = 'beauty',
  BOOKS = 'books',
  
  // Food & Beverage
  FOOD = 'food',
  WINE = 'wine',
  GOURMET = 'gourmet',
  
  // Hobby-based
  SPORTS = 'sports',
  GAMING = 'gaming',
  ART = 'art',
  MUSIC = 'music',
  WELLNESS = 'wellness',
  
  // Sentimental
  PERSONALIZED = 'personalized',
  HANDMADE = 'handmade',
  JEWELRY = 'jewelry',
  
  // Other
  SUBSCRIPTION = 'subscription',
  GIFT_CARDS = 'gift_cards',
  ECO_FRIENDLY = 'eco_friendly',
}

/**
 * Price range brackets
 */
export enum PriceRange {
  BUDGET = 'budget', // $0-$25
  AFFORDABLE = 'affordable', // $25-$50
  MODERATE = 'moderate', // $50-$100
  PREMIUM = 'premium', // $100-$250
  LUXURY = 'luxury', // $250+
}

/**
 * Occasion types
 */
export enum OccasionType {
  BIRTHDAY = 'birthday',
  CHRISTMAS = 'christmas',
  ANNIVERSARY = 'anniversary',
  VALENTINES = 'valentines',
  MOTHERS_DAY = 'mothers_day',
  FATHERS_DAY = 'fathers_day',
  GRADUATION = 'graduation',
  WEDDING = 'wedding',
  HOUSEWARMING = 'housewarming',
  THANK_YOU = 'thank_you',
  JUST_BECAUSE = 'just_because',
}

/**
 * Product details for gift recommendations
 */
export interface ProductDetails {
  name: string;
  description: string;
  category: GiftCategory;
  priceRange: PriceRange;
  estimatedPrice?: number;
  imageUrl?: string;
  affiliateLink?: string;
  vendor?: string;
  tags: string[];
}

/**
 * Gift recommendation with confidence and reasoning
 */
export interface GiftRecommendation {
  id: string;
  product: ProductDetails;
  confidence: number; // 0-100
  reasoning: string;
  
  // Matching factors
  matchFactors: {
    giftingStyleMatch: number; // 0-100
    archetypeMatch: number; // 0-100
    occasionMatch: number; // 0-100
    budgetMatch: number; // 0-100
    relationshipMatch: number; // 0-100
  };
  
  // Additional context
  whyThisGift: string; // User-friendly explanation
  alternativeSuggestions?: string[];
  personalizeIdea?: string; // How to make it more personal
}

// ============================================================================
// RECIPIENT PROFILE TYPES
// ============================================================================

/**
 * Recipient profile for gift recommendations
 * Combines enriched contact data with engagement game data
 */
export interface RecipientProfile {
  // From enriched contact (auto-populate)
  name: string;
  relationship?: RelationshipType;
  giftingProfile?: GiftingProfile;
  archetypes?: Array<{ name: string; tags: string[]; confidence: number }>;
  interests?: string[];
  
  // From engagement games
  threeWords?: string[]; // From ThreeWordsGame
  vibes?: string[]; // From PickTheirVibeGame
  
  // User-provided
  age?: number;
  gender?: string;
  
  // Metadata
  enrichmentConfidence?: number; // Overall confidence from auto-populate
}

// ============================================================================
// ENGAGEMENT GAME TYPES
// ============================================================================

/**
 * Answer from ThreeWordsGame
 */
export interface ThreeWordsGameAnswer {
  words: string[]; // Exactly 3 words
  extractedTraits: {
    personality: string[]; // e.g., ["adventurous", "creative"]
    tone: string[]; // e.g., ["playful", "sophisticated"]
    aesthetic: string[]; // e.g., ["minimalist", "bohemian"]
  };
}

/**
 * Answer from PickTheirVibeGame
 */
export interface PickTheirVibeGameAnswer {
  selectedVibes: string[]; // e.g., ["cozy", "cosmic", "tech"]
  categoryPreferences: GiftCategory[]; // Derived from vibes
  aestheticProfile: string; // e.g., "warm_minimalist"
}

/**
 * Combined engagement game answers
 */
export interface EngagementGameAnswers {
  threeWords?: ThreeWordsGameAnswer;
  pickTheirVibe?: PickTheirVibeGameAnswer;
}

// ============================================================================
// RECOMMENDATION REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to get gift recommendations
 */
export interface RecommendationRequest {
  // Required
  recipient: RecipientProfile;
  occasion: OccasionType;
  budget: {
    min: number;
    max: number;
    preferred?: number;
  };
  
  // Optional
  engagementAnswers?: EngagementGameAnswers;
  excludeCategories?: GiftCategory[];
  preferredCategories?: GiftCategory[];
  
  // Context
  urgency?: 'low' | 'medium' | 'high'; // Affects experiential vs physical
  shippingRequired?: boolean;
  giftMessage?: string;
}

/**
 * Response with gift recommendations
 */
export interface RecommendationResponse {
  success: boolean;
  recommendations: GiftRecommendation[];
  
  // Metadata
  recipientSummary: string; // E.g., "Based on your adventurous, creative friend..."
  totalMatches: number;
  processingTime: number; // milliseconds
  
  // Insights
  topCategories: GiftCategory[];
  budgetUtilization: {
    min: number;
    max: number;
    average: number;
  };
  
  // Error handling
  error?: {
    code: string;
    message: string;
  };
  warnings?: string[];
}

// ============================================================================
// VIBE TAXONOMY (For PickTheirVibeGame)
// ============================================================================

/**
 * Vibe options with associated categories and aesthetics
 */
export interface VibeOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  associatedCategories: GiftCategory[];
  aestheticTags: string[];
  color: string; // For UI display
}

/**
 * Pre-defined vibe taxonomy
 */
export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'cozy',
    label: 'Cozy',
    emoji: '🕯️',
    description: 'Warm, comfortable, hygge vibes',
    associatedCategories: [GiftCategory.HOME_DECOR, GiftCategory.WELLNESS, GiftCategory.BOOKS],
    aestheticTags: ['warm', 'comfortable', 'soft', 'intimate'],
    color: '#D4A574',
  },
  {
    id: 'cosmic',
    label: 'Cosmic',
    emoji: '✨',
    description: 'Mystical, celestial, dreamy',
    associatedCategories: [GiftCategory.JEWELRY, GiftCategory.ART, GiftCategory.PERSONALIZED],
    aestheticTags: ['mystical', 'dreamy', 'spiritual', 'ethereal'],
    color: '#8B7EC8',
  },
  {
    id: 'glam',
    label: 'Glam',
    emoji: '💎',
    description: 'Luxurious, sophisticated, chic',
    associatedCategories: [GiftCategory.FASHION, GiftCategory.BEAUTY, GiftCategory.JEWELRY],
    aestheticTags: ['luxurious', 'elegant', 'sophisticated', 'polished'],
    color: '#E6B8A2',
  },
  {
    id: 'tech',
    label: 'Tech',
    emoji: '🤖',
    description: 'Modern, innovative, gadget-lover',
    associatedCategories: [GiftCategory.TECH, GiftCategory.GAMING, GiftCategory.SUBSCRIPTION],
    aestheticTags: ['modern', 'innovative', 'sleek', 'futuristic'],
    color: '#5FA3D0',
  },
  {
    id: 'sporty',
    label: 'Sporty',
    emoji: '🏃',
    description: 'Active, athletic, energetic',
    associatedCategories: [GiftCategory.SPORTS, GiftCategory.WELLNESS, GiftCategory.EXPERIENCES],
    aestheticTags: ['active', 'dynamic', 'energetic', 'outdoorsy'],
    color: '#88C273',
  },
  {
    id: 'artsy',
    label: 'Artsy',
    emoji: '🎨',
    description: 'Creative, expressive, unique',
    associatedCategories: [GiftCategory.ART, GiftCategory.HANDMADE, GiftCategory.BOOKS],
    aestheticTags: ['creative', 'expressive', 'unique', 'bohemian'],
    color: '#F4A259',
  },
  {
    id: 'foodie',
    label: 'Foodie',
    emoji: '🍷',
    description: 'Culinary enthusiast, gourmet lover',
    associatedCategories: [GiftCategory.FOOD, GiftCategory.WINE, GiftCategory.GOURMET],
    aestheticTags: ['culinary', 'gourmet', 'epicurean', 'refined'],
    color: '#C8553D',
  },
  {
    id: 'zen',
    label: 'Zen',
    emoji: '🧘',
    description: 'Mindful, peaceful, balanced',
    associatedCategories: [GiftCategory.WELLNESS, GiftCategory.ECO_FRIENDLY, GiftCategory.EXPERIENCES],
    aestheticTags: ['mindful', 'peaceful', 'natural', 'serene'],
    color: '#7EBC89',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🏔️',
    description: 'Explorer, thrill-seeker, outdoorsy',
    associatedCategories: [GiftCategory.TRAVEL, GiftCategory.EXPERIENCES, GiftCategory.SPORTS],
    aestheticTags: ['adventurous', 'bold', 'outdoorsy', 'explorer'],
    color: '#588B8B',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    emoji: '📻',
    description: 'Retro, nostalgic, classic',
    associatedCategories: [GiftCategory.HOME_DECOR, GiftCategory.BOOKS, GiftCategory.MUSIC],
    aestheticTags: ['retro', 'nostalgic', 'classic', 'timeless'],
    color: '#B89B7B',
  },
];

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Price range helper to convert enum to actual values
 */
export const PRICE_RANGE_VALUES: Record<PriceRange, { min: number; max: number }> = {
  [PriceRange.BUDGET]: { min: 0, max: 25 },
  [PriceRange.AFFORDABLE]: { min: 25, max: 50 },
  [PriceRange.MODERATE]: { min: 50, max: 100 },
  [PriceRange.PREMIUM]: { min: 100, max: 250 },
  [PriceRange.LUXURY]: { min: 250, max: 10000 },
};

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<GiftCategory, string> = {
  [GiftCategory.EXPERIENCES]: 'Experiences',
  [GiftCategory.EVENTS]: 'Events',
  [GiftCategory.TRAVEL]: 'Travel',
  [GiftCategory.TECH]: 'Tech & Gadgets',
  [GiftCategory.FASHION]: 'Fashion',
  [GiftCategory.HOME_DECOR]: 'Home & Decor',
  [GiftCategory.BEAUTY]: 'Beauty',
  [GiftCategory.BOOKS]: 'Books',
  [GiftCategory.FOOD]: 'Food',
  [GiftCategory.WINE]: 'Wine & Spirits',
  [GiftCategory.GOURMET]: 'Gourmet',
  [GiftCategory.SPORTS]: 'Sports & Fitness',
  [GiftCategory.GAMING]: 'Gaming',
  [GiftCategory.ART]: 'Art & Crafts',
  [GiftCategory.MUSIC]: 'Music',
  [GiftCategory.WELLNESS]: 'Wellness',
  [GiftCategory.PERSONALIZED]: 'Personalized',
  [GiftCategory.HANDMADE]: 'Handmade',
  [GiftCategory.JEWELRY]: 'Jewelry',
  [GiftCategory.SUBSCRIPTION]: 'Subscriptions',
  [GiftCategory.GIFT_CARDS]: 'Gift Cards',
  [GiftCategory.ECO_FRIENDLY]: 'Eco-Friendly',
};

/**
 * Occasion display names
 */
export const OCCASION_LABELS: Record<OccasionType, string> = {
  [OccasionType.BIRTHDAY]: 'Birthday',
  [OccasionType.CHRISTMAS]: 'Christmas',
  [OccasionType.ANNIVERSARY]: 'Anniversary',
  [OccasionType.VALENTINES]: "Valentine's Day",
  [OccasionType.MOTHERS_DAY]: "Mother's Day",
  [OccasionType.FATHERS_DAY]: "Father's Day",
  [OccasionType.GRADUATION]: 'Graduation',
  [OccasionType.WEDDING]: 'Wedding',
  [OccasionType.HOUSEWARMING]: 'Housewarming',
  [OccasionType.THANK_YOU]: 'Thank You',
  [OccasionType.JUST_BECAUSE]: 'Just Because',
};
