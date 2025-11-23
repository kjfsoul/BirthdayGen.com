/**
 * Product Service - External API Integration Layer
 * Phase 4 - Module C (Real Product Data Structure)
 * 
 * Production-ready product data layer with scaffolding for external API integrations.
 * Supports Printify, Amazon, Etsy, and TikTok Shop APIs.
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - PRINTIFY_API_KEY: Printify API authentication key
 * - AMAZON_API_KEY: Amazon Product Advertising API key
 * - AMAZON_API_SECRET: Amazon Product Advertising API secret
 * - AMAZON_PARTNER_TAG: Amazon Associates partner tag for affiliate links
 * - ETSY_API_KEY: Etsy API key
 * - TIKTOK_SHOP_API_KEY: TikTok Shop API key
 * - TIKTOK_SHOP_API_SECRET: TikTok Shop API secret
 */

import type { Product, ProductSource, GiftCategory } from './schema';

// ============================================================================
// CONFIGURATION & ENVIRONMENT
// ============================================================================

/**
 * API configuration with environment variable checks
 */
const API_CONFIG = {
  printify: {
    enabled: !!process.env.PRINTIFY_API_KEY,
    apiKey: process.env.PRINTIFY_API_KEY,
    baseUrl: 'https://api.printify.com/v1',
  },
  amazon: {
    enabled: !!(
      process.env.AMAZON_API_KEY &&
      process.env.AMAZON_API_SECRET &&
      process.env.AMAZON_PARTNER_TAG
    ),
    apiKey: process.env.AMAZON_API_KEY,
    apiSecret: process.env.AMAZON_API_SECRET,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    baseUrl: 'https://webservices.amazon.com/paapi5',
  },
  etsy: {
    enabled: !!process.env.ETSY_API_KEY,
    apiKey: process.env.ETSY_API_KEY,
    baseUrl: 'https://openapi.etsy.com/v3',
  },
  tiktokShop: {
    enabled: !!(
      process.env.TIKTOK_SHOP_API_KEY &&
      process.env.TIKTOK_SHOP_API_SECRET
    ),
    apiKey: process.env.TIKTOK_SHOP_API_KEY,
    apiSecret: process.env.TIKTOK_SHOP_API_SECRET,
    baseUrl: 'https://open-api.tiktokglobalshop.com',
  },
};

/**
 * Log API configuration status on module load
 */
function logApiStatus() {
  const statuses = Object.entries(API_CONFIG).map(([source, config]) => ({
    source,
    enabled: config.enabled,
  }));

  const enabledCount = statuses.filter((s) => s.enabled).length;
  const totalCount = statuses.length;

  if (enabledCount === 0) {
    console.warn(
      '⚠️  [ProductService] No external product APIs configured. All product fetches will return empty results.'
    );
    console.warn(
      '   Configure at least one API by setting the appropriate environment variables.'
    );
  } else {
    console.info(
      `✅ [ProductService] ${enabledCount}/${totalCount} product sources configured`
    );
    statuses.forEach(({ source, enabled }) => {
      if (enabled) {
        console.info(`   ✓ ${source}: enabled`);
      } else {
        console.info(`   ✗ ${source}: disabled (missing API keys)`);
      }
    });
  }
}

// Log status on module initialization
logApiStatus();

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Product query parameters for searching and filtering
 */
export interface ProductQuery {
  // Filter by categories
  categories?: GiftCategory[];

  // Price range filtering
  maxPrice?: number;
  minPrice?: number;

  // Tag-based search
  tags?: string[];

  // Source filtering (which APIs to query)
  sourceFilter?: ProductSource[];

  // Pagination & limits
  limit?: number;
  offset?: number;

  // Search keywords
  searchQuery?: string;

  // Sorting
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity';
}

/**
 * Product fetch result with metadata
 */
export interface ProductFetchResult {
  products: Product[];
  totalCount: number;
  sources: {
    source: ProductSource;
    count: number;
    error?: string;
  }[];
  cached: boolean;
}

// ============================================================================
// CORE PRODUCT FETCHING FUNCTIONS
// ============================================================================

/**
 * Main product fetching function with multi-source aggregation
 * 
 * @param query - Product query parameters
 * @returns Promise resolving to product fetch result
 * 
 * @example
 * ```typescript
 * const result = await fetchProducts({
 *   categories: [GiftCategory.TECH],
 *   maxPrice: 100,
 *   limit: 20,
 * });
 * ```
 */
export async function fetchProducts(
  query: ProductQuery
): Promise<ProductFetchResult> {
  const {
    categories,
    maxPrice,
    minPrice,
    tags,
    sourceFilter,
    limit = 50,
    offset = 0,
    searchQuery,
    sortBy = 'popularity',
  } = query;

  // Determine which sources to query
  const sourcesToQuery: ProductSource[] = sourceFilter || [
    'printify',
    'amazon',
    'etsy',
    'tiktok_shop',
  ];

  // Check if any sources are configured
  const configuredSources = sourcesToQuery.filter((source) => {
    const sourceKey = source === 'tiktok_shop' ? 'tiktokShop' : source;
    return API_CONFIG[sourceKey as keyof typeof API_CONFIG]?.enabled;
  });

  if (configuredSources.length === 0) {
    console.warn(
      '[ProductService] No configured sources available for query. Returning empty result.'
    );
    return {
      products: [],
      totalCount: 0,
      sources: sourcesToQuery.map((source) => ({
        source,
        count: 0,
        error: 'API not configured',
      })),
      cached: false,
    };
  }

  // TODO: Check cache before making API calls
  // const cacheKey = generateCacheKey(query);
  // const cachedResult = await getCachedProducts(cacheKey);
  // if (cachedResult) {
  //   return { ...cachedResult, cached: true };
  // }

  // Fetch from all configured sources in parallel
  const sourceResults = await Promise.allSettled(
    configuredSources.map(async (source) => {
      try {
        let products: Product[] = [];

        switch (source) {
          case 'printify':
            products = await fetchPrintifyProducts(query);
            break;
          case 'amazon':
            products = await fetchAmazonProducts(query);
            break;
          case 'etsy':
            products = await fetchEtsyProducts(query);
            break;
          case 'tiktok_shop':
            products = await fetchTikTokShopProducts(query);
            break;
          default:
            console.warn(`[ProductService] Unknown source: ${source}`);
        }

        return {
          source,
          products,
          count: products.length,
        };
      } catch (error) {
        console.error(
          `[ProductService] Error fetching from ${source}:`,
          error
        );
        return {
          source,
          products: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  // Aggregate results from all sources
  let allProducts: Product[] = [];
  const sourceMetadata: ProductFetchResult['sources'] = [];

  sourceResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      allProducts = allProducts.concat(result.value.products);
      sourceMetadata.push({
        source: result.value.source,
        count: result.value.count,
        error: result.value.error,
      });
    } else {
      console.error('[ProductService] Source fetch failed:', result.reason);
    }
  });

  // Apply post-fetch filtering
  let filteredProducts = allProducts;

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filteredProducts = filterByPriceRange(
      filteredProducts,
      minPrice,
      maxPrice
    );
  }

  // Filter by tags if specified
  if (tags && tags.length > 0) {
    filteredProducts = filterByTags(filteredProducts, tags);
  }

  // Sort products
  filteredProducts = sortProducts(filteredProducts, sortBy);

  // Apply pagination
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  // TODO: Cache the results
  // await cacheProducts(cacheKey, {
  //   products: paginatedProducts,
  //   totalCount: filteredProducts.length,
  //   sources: sourceMetadata,
  //   cached: false,
  // });

  return {
    products: paginatedProducts,
    totalCount: filteredProducts.length,
    sources: sourceMetadata,
    cached: false,
  };
}

/**
 * Search products by category with optional budget constraint
 * 
 * @param category - Gift category to search
 * @param budget - Optional maximum price
 * @returns Promise resolving to array of products
 * 
 * @example
 * ```typescript
 * const products = await searchProductsByCategory(
 *   GiftCategory.TECH,
 *   100
 * );
 * ```
 */
export async function searchProductsByCategory(
  category: GiftCategory,
  budget?: number
): Promise<Product[]> {
  const query: ProductQuery = {
    categories: [category],
    limit: 50,
  };

  if (budget !== undefined) {
    query.maxPrice = budget;
  }

  const result = await fetchProducts(query);
  return result.products;
}

/**
 * Get a specific product by ID and source
 * 
 * @param id - Product ID
 * @param source - Product source
 * @returns Promise resolving to product or null if not found
 * 
 * @example
 * ```typescript
 * const product = await getProductById('12345', 'amazon');
 * ```
 */
export async function getProductById(
  id: string,
  source: ProductSource
): Promise<Product | null> {
  // TODO: Check cache first
  // const cachedProduct = await getCachedProduct(id, source);
  // if (cachedProduct) return cachedProduct;

  // Check if source is configured
  const sourceKey =
    source === 'tiktok_shop' ? 'tiktokShop' : source;
  
  if (source === 'internal') {
    // TODO: Implement internal product lookup from database
    console.warn('[ProductService] Internal product lookup not yet implemented');
    return null;
  }

  if (!API_CONFIG[sourceKey as keyof typeof API_CONFIG]?.enabled) {
    console.warn(
      `[ProductService] Cannot fetch product ${id}: ${source} API not configured`
    );
    return null;
  }

  try {
    // TODO: Implement source-specific product fetching by ID
    // For now, fetch and filter
    const result = await fetchProducts({
      limit: 1,
      sourceFilter: [source],
    });

    const product = result.products.find(
      (p) => p.id === id && p.source === source
    );

    if (product) {
      // TODO: Cache the product
      return product;
    }

    return null;
  } catch (error) {
    console.error(
      `[ProductService] Error fetching product ${id} from ${source}:`,
      error
    );
    return null;
  }
}

/**
 * Fetch real products for a GPT-4o gift recommendation (Module D)
 * 
 * Integrates ProductService with AI recommendations by:
 * - Extracting category and tags from GPT recommendation
 * - Querying configured product APIs (Amazon, Etsy, etc.)
 * - Applying budget constraints
 * - Returning matching products or empty array if APIs not configured
 * 
 * This function gracefully handles API errors and missing configurations,
 * ensuring the gift recommendation API never crashes due to product service issues.
 * 
 * @param recommendation - GPT-4o generated gift recommendation
 * @param budget - Optional budget constraints (overrides recommendation price)
 * @returns Promise resolving to array of matching products (empty if APIs not configured)
 * 
 * @example
 * ```typescript
 * // After GPT-4o generates recommendations
 * const products = await fetchProductsForRecommendation(
 *   recommendation,
 *   { min: 20, max: 50 }
 * );
 * 
 * if (products.length > 0) {
 *   console.log('Found real products matching AI recommendation');
 * }
 * ```
 */
export async function fetchProductsForRecommendation(
  recommendation: import('./schema').GiftRecommendation,
  budget?: { min: number; max: number }
): Promise<Product[]> {
  try {
    // Extract category from recommendation
    const category = recommendation.product.category;
    
    // Extract tags for more refined search
    const tags = recommendation.product.tags || [];
    
    // Determine budget constraints
    // Use provided budget, or fall back to recommendation's estimated price
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    
    if (budget) {
      minPrice = budget.min;
      maxPrice = budget.max;
    } else if (recommendation.product.estimatedPrice) {
      // Allow ±20% range around estimated price
      const estimatedPrice = recommendation.product.estimatedPrice;
      minPrice = Math.max(0, estimatedPrice * 0.8);
      maxPrice = estimatedPrice * 1.2;
    }
    
    // Build query for ProductService
    const query: ProductQuery = {
      categories: [category],
      tags: tags.length > 0 ? tags : undefined,
      minPrice,
      maxPrice,
      limit: 10, // Return top 10 matching products
      sortBy: 'popularity',
    };
    
    // Fetch products from configured APIs
    const result = await fetchProducts(query);
    
    // Log result for debugging
    if (result.products.length > 0) {
      console.info(
        `[ProductService] Found ${result.products.length} products for recommendation "${recommendation.product.name}"`
      );
    } else {
      const configuredSources = result.sources.filter(s => !s.error || s.error !== 'API not configured');
      if (configuredSources.length === 0) {
        console.info(
          `[ProductService] No products found for "${recommendation.product.name}" - APIs not configured`
        );
      } else {
        console.info(
          `[ProductService] No products found for "${recommendation.product.name}" - no matches in configured APIs`
        );
      }
    }
    
    return result.products;
    
  } catch (error) {
    // Graceful error handling - never throw, just return empty array
    console.error(
      `[ProductService] Error fetching products for recommendation:`,
      error
    );
    return [];
  }
}

// ============================================================================
// SOURCE-SPECIFIC FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch products from Printify API
 * 
 * TODO: Implement actual Printify API integration
 * - API Docs: https://developers.printify.com/
 * - Authentication: Bearer token
 * - Rate limits: Consider implementing rate limiting
 * 
 * @param query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchPrintifyProducts(
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.printify.enabled) {
    throw new Error('Printify API not configured');
  }

  // TODO: Implement Printify API call
  // const response = await fetch(`${API_CONFIG.printify.baseUrl}/shops/{shop_id}/products.json`, {
  //   headers: {
  //     'Authorization': `Bearer ${API_CONFIG.printify.apiKey}`,
  //   },
  // });
  // const data = await response.json();
  // return data.products.map(transformPrintifyProduct);

  console.info('[ProductService] Printify API integration pending implementation');
  return [];
}

/**
 * Fetch products from Amazon Product Advertising API
 * 
 * TODO: Implement actual Amazon PAAPI integration
 * - API Docs: https://webservices.amazon.com/paapi5/documentation/
 * - Authentication: AWS Signature Version 4
 * - Rate limits: 1 request per second (adjust as needed)
 * 
 * @param query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchAmazonProducts(
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.amazon.enabled) {
    throw new Error('Amazon API not configured');
  }

  // TODO: Implement Amazon PAAPI call
  // - Use AWS SDK or implement signature authentication
  // - Map query.categories to Amazon browse nodes
  // - Transform response to Product interface
  // const request = {
  //   Keywords: query.searchQuery,
  //   Resources: ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'],
  //   PartnerTag: API_CONFIG.amazon.partnerTag,
  // };
  // const response = await amazonClient.searchItems(request);
  // return response.SearchResult.Items.map(transformAmazonProduct);

  console.info('[ProductService] Amazon API integration pending implementation');
  return [];
}

/**
 * Fetch products from Etsy API
 * 
 * TODO: Implement actual Etsy API integration
 * - API Docs: https://www.etsy.com/developers/documentation
 * - Authentication: OAuth 2.0 or API key
 * - Rate limits: Consider implementing backoff strategy
 * 
 * @param query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchEtsyProducts(
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.etsy.enabled) {
    throw new Error('Etsy API not configured');
  }

  // TODO: Implement Etsy API call
  // const response = await fetch(
  //   `${API_CONFIG.etsy.baseUrl}/application/listings/active`,
  //   {
  //     headers: {
  //       'x-api-key': API_CONFIG.etsy.apiKey,
  //     },
  //   }
  // );
  // const data = await response.json();
  // return data.results.map(transformEtsyProduct);

  console.info('[ProductService] Etsy API integration pending implementation');
  return [];
}

/**
 * Fetch products from TikTok Shop API
 * 
 * TODO: Implement actual TikTok Shop API integration
 * - API Docs: https://partner.tiktokshop.com/docv2/page/
 * - Authentication: API key + signature
 * - Rate limits: Check TikTok Shop API documentation
 * 
 * @param query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchTikTokShopProducts(
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.tiktokShop.enabled) {
    throw new Error('TikTok Shop API not configured');
  }

  // TODO: Implement TikTok Shop API call
  // - Implement signature generation for requests
  // - Map product data to Product interface
  // const timestamp = Date.now();
  // const signature = generateTikTokSignature(timestamp);
  // const response = await fetch(
  //   `${API_CONFIG.tiktokShop.baseUrl}/api/products/search`,
  //   {
  //     headers: {
  //       'x-tts-access-token': API_CONFIG.tiktokShop.apiKey,
  //     },
  //   }
  // );

  console.info('[ProductService] TikTok Shop API integration pending implementation');
  return [];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build affiliate URL for a product
 * 
 * @param product - Product to build affiliate URL for
 * @returns Affiliate URL or product URL if affiliate not available
 */
export function buildAffiliateUrl(product: Product): string {
  if (product.affiliateUrl) {
    return product.affiliateUrl;
  }

  // TODO: Implement source-specific affiliate URL generation
  switch (product.source) {
    case 'amazon':
      // Add Amazon Associates tag if available
      if (API_CONFIG.amazon.partnerTag) {
        const url = new URL(product.productUrl);
        url.searchParams.set('tag', API_CONFIG.amazon.partnerTag);
        return url.toString();
      }
      break;

    case 'etsy':
      // TODO: Add Etsy affiliate parameters
      break;

    case 'printify':
      // Printify typically doesn't use affiliate links
      break;

    case 'tiktok_shop':
      // TODO: Add TikTok Shop affiliate parameters
      break;

    default:
      break;
  }

  return product.productUrl;
}

/**
 * Filter products by price range
 * 
 * @param products - Products to filter
 * @param minPrice - Minimum price (inclusive)
 * @param maxPrice - Maximum price (inclusive)
 * @returns Filtered products
 */
export function filterByPriceRange(
  products: Product[],
  minPrice?: number,
  maxPrice?: number
): Product[] {
  return products.filter((product) => {
    if (minPrice !== undefined && product.price < minPrice) {
      return false;
    }
    if (maxPrice !== undefined && product.price > maxPrice) {
      return false;
    }
    return true;
  });
}

/**
 * Filter products by tags (any matching tag)
 * 
 * @param products - Products to filter
 * @param tags - Tags to filter by
 * @returns Filtered products
 */
export function filterByTags(
  products: Product[],
  tags: string[]
): Product[] {
  const lowercaseTags = tags.map((t) => t.toLowerCase());
  
  return products.filter((product) => {
    const productTags = product.tags.map((t) => t.toLowerCase());
    return lowercaseTags.some((tag) => productTags.includes(tag));
  });
}

/**
 * Sort products by specified criteria
 * 
 * @param products - Products to sort
 * @param sortBy - Sort criteria
 * @returns Sorted products
 */
export function sortProducts(
  products: Product[],
  sortBy: ProductQuery['sortBy']
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;

    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;

    case 'rating':
      sorted.sort((a, b) => {
        const ratingA = a.metadata?.rating || 0;
        const ratingB = b.metadata?.rating || 0;
        return ratingB - ratingA;
      });
      break;

    case 'popularity':
      // Sort by review count as proxy for popularity
      sorted.sort((a, b) => {
        const countA = a.metadata?.reviewCount || 0;
        const countB = b.metadata?.reviewCount || 0;
        return countB - countA;
      });
      break;

    default:
      // No sorting
      break;
  }

  return sorted;
}

// ============================================================================
// CACHING FUNCTIONS (Scaffolding)
// ============================================================================

/**
 * Generate cache key from query parameters
 * 
 * TODO: Implement actual cache key generation
 * 
 * @param query - Product query
 * @returns Cache key string
 */
function generateCacheKey(query: ProductQuery): string {
  // TODO: Implement robust cache key generation
  return JSON.stringify(query);
}

/**
 * Get cached products
 * 
 * TODO: Implement with Redis or other caching solution
 * - Cache TTL: 1 hour recommended
 * - Consider cache invalidation strategy
 * 
 * @param cacheKey - Cache key
 * @returns Cached result or null
 */
async function getCachedProducts(
  cacheKey: string
): Promise<ProductFetchResult | null> {
  // TODO: Implement Redis cache lookup
  // const cached = await redisClient.get(cacheKey);
  // if (cached) {
  //   return JSON.parse(cached);
  // }
  return null;
}

/**
 * Cache product fetch results
 * 
 * TODO: Implement with Redis or other caching solution
 * 
 * @param cacheKey - Cache key
 * @param result - Result to cache
 */
async function cacheProducts(
  cacheKey: string,
  result: ProductFetchResult
): Promise<void> {
  // TODO: Implement Redis cache storage
  // await redisClient.setex(cacheKey, 3600, JSON.stringify(result));
}

/**
 * Get cached product by ID
 * 
 * TODO: Implement with Redis or other caching solution
 * 
 * @param id - Product ID
 * @param source - Product source
 * @returns Cached product or null
 */
async function getCachedProduct(
  id: string,
  source: ProductSource
): Promise<Product | null> {
  // TODO: Implement Redis cache lookup
  // const cacheKey = `product:${source}:${id}`;
  // const cached = await redisClient.get(cacheKey);
  // if (cached) {
  //   return JSON.parse(cached);
  // }
  return null;
}

// ============================================================================
// PRODUCT TRANSFORMATION HELPERS (For API Integration)
// ============================================================================

/**
 * Transform Printify product to Product interface
 * 
 * TODO: Implement when Printify API is integrated
 */
// function transformPrintifyProduct(printifyProduct: any): Product {
//   return {
//     id: printifyProduct.id,
//     source: 'printify',
//     name: printifyProduct.title,
//     description: printifyProduct.description,
//     // ... map other fields
//   };
// }

/**
 * Transform Amazon product to Product interface
 * 
 * TODO: Implement when Amazon PAAPI is integrated
 */
// function transformAmazonProduct(amazonItem: any): Product {
//   return {
//     id: amazonItem.ASIN,
//     source: 'amazon',
//     name: amazonItem.ItemInfo.Title.DisplayValue,
//     // ... map other fields
//   };
// }

/**
 * Transform Etsy listing to Product interface
 * 
 * TODO: Implement when Etsy API is integrated
 */
// function transformEtsyProduct(etsyListing: any): Product {
//   return {
//     id: etsyListing.listing_id.toString(),
//     source: 'etsy',
//     name: etsyListing.title,
//     // ... map other fields
//   };
// }

/**
 * Transform TikTok Shop product to Product interface
 * 
 * TODO: Implement when TikTok Shop API is integrated
 */
// function transformTikTokProduct(tiktokProduct: any): Product {
//   return {
//     id: tiktokProduct.product_id,
//     source: 'tiktok_shop',
//     name: tiktokProduct.product_name,
//     // ... map other fields
//   };
// }
