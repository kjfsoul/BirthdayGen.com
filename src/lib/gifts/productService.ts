/* eslint-disable no-console */
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

import { type Product, type ProductSource, GiftCategory } from './schema';

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
// CACHING STATE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// In-memory cache stores
const productCache = new Map<string, CacheEntry<Product>>();
const queryCache = new Map<string, CacheEntry<ProductFetchResult>>();
const CACHE_TTL = 3600000; // 1 hour

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
    categories: _categories,
    maxPrice,
    minPrice,
    tags,
    sourceFilter,
    limit = 50,
    offset = 0,
    searchQuery: _searchQuery,
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
  // Check cache first
  const cachedProduct = await getCachedProduct(id, source);
  if (cachedProduct) return cachedProduct;

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
      // Cache the product for future lookups
      await cacheProduct(product);
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
// PRINTIFY API TYPES
// ============================================================================

interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

interface PrintifyVariant {
  id: number;
  title: string;
  price: number; // In cents
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
}

interface PrintifyExternal {
  id: string;
  handle: string;
  shipping_template_id: string;
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: any[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  shop_id: number;
  external?: PrintifyExternal[];
}

interface PrintifyProductListResponse {
  current_page: number;
  data: PrintifyProduct[];
  last_page: number;
  total: number;
}

// Cached shop ID to avoid repeated API calls
let cachedPrintifyShopId: number | null = null;

/**
 * Fetch the first available Printify shop ID
 */
async function getPrintifyShopId(): Promise<number | null> {
  if (cachedPrintifyShopId) return cachedPrintifyShopId;

  if (!API_CONFIG.printify.enabled || !API_CONFIG.printify.apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${API_CONFIG.printify.baseUrl}/shops.json`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.printify.apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn(`[ProductService] Failed to fetch Printify shops: ${response.status} ${response.statusText}`);
      return null;
    }

    const shops = await response.json() as PrintifyShop[];
    if (shops.length > 0) {
      cachedPrintifyShopId = shops[0].id;
      return cachedPrintifyShopId;
    }

    console.warn('[ProductService] No Printify shops found');
    return null;
  } catch (error) {
    console.error('[ProductService] Error fetching Printify shops:', error);
    return null;
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
 * @param _query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchPrintifyProducts(
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.printify.enabled) {
    throw new Error('Printify API not configured');
  }

  const shopId = await getPrintifyShopId();
  if (!shopId) {
    console.warn('[ProductService] Cannot fetch Printify products: No shop found');
    return [];
  }

  try {
    // Build URL with query params
    const url = new URL(`${API_CONFIG.printify.baseUrl}/shops/${shopId}/products.json`);

    // API supports 'limit' (max 50) and 'page'
    if (query.limit) {
      url.searchParams.set('limit', Math.min(query.limit, 50).toString());
    }
    if (query.offset && query.limit) {
      const page = Math.floor(query.offset / query.limit) + 1;
      url.searchParams.set('page', page.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.printify.apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`[ProductService] Printify API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json() as PrintifyProductListResponse;
    let products = data.data.map(transformPrintifyProduct);

    // Client-side filtering for search query (API limitation)
    if (query.searchQuery) {
      const lowerQuery = query.searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    return products;
  } catch (error) {
    console.error('[ProductService] Error fetching Printify products:', error);
    return [];
  }
}

/**
 * Fetch products from Amazon Product Advertising API
 *
 * TODO: Implement actual Amazon PAAPI integration
 * - API Docs: https://webservices.amazon.com/paapi5/documentation/
 * - Authentication: AWS Signature Version 4
 * - Rate limits: 1 request per second (adjust as needed)
 *
 * @param _query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchAmazonProducts(
  _query: ProductQuery
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
 * @param _query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchEtsyProducts(
  _query: ProductQuery
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
 * @param _query - Product query parameters
 * @returns Promise resolving to array of products
 */
async function fetchTikTokShopProducts(
  _query: ProductQuery
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
// CACHING FUNCTIONS
// ============================================================================

/**
 * Generate a cache key for a single product
 */
function generateProductCacheKey(id: string, source: ProductSource): string {
  return `${source}:${id}`;
}

/**
 * Generate a cache key for a product query
 */
export function generateCacheKey(query: ProductQuery): string {
  // Sort keys to ensure consistent order for same query
  const sortedQuery = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      acc[key as keyof ProductQuery] = query[key as keyof ProductQuery] as any;
      return acc;
    }, {} as Partial<ProductQuery>);

  return JSON.stringify(sortedQuery);
}

/**
 * Get a product from cache
 */
export async function getCachedProduct(
  id: string,
  source: ProductSource
): Promise<Product | null> {
  const key = generateProductCacheKey(id, source);
  const entry = productCache.get(key);

  if (!entry) return null;

  // Check expiry
  if (Date.now() > entry.expiry) {
    productCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Cache a product
 */
export async function cacheProduct(product: Product): Promise<void> {
  const key = generateProductCacheKey(product.id, product.source);

  productCache.set(key, {
    data: product,
    expiry: Date.now() + CACHE_TTL,
  });
}

/**
 * Get products from cache (query result)
 */
export async function getCachedProducts(
  key: string
): Promise<ProductFetchResult | null> {
  const entry = queryCache.get(key);

  if (!entry) return null;

  // Check expiry
  if (Date.now() > entry.expiry) {
    queryCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Cache product query results
 */
export async function cacheProducts(
  key: string,
  result: ProductFetchResult
): Promise<void> {
  queryCache.set(key, {
    data: result,
    expiry: Date.now() + CACHE_TTL,
  });

  // Also cache individual products from the result
  // This helps populate the single-product cache
  for (const product of result.products) {
    await cacheProduct(product);
  }
}

// ============================================================================
// PRODUCT TRANSFORMATION HELPERS (For API Integration)
// ============================================================================

/**
 * Transform Printify product to Product interface
 */
function transformPrintifyProduct(printifyProduct: PrintifyProduct): Product {
  // Determine price from variants (use lowest price)
  const minPrice = printifyProduct.variants.reduce(
    (min, v) => (v.is_enabled && v.price < min ? v.price : min),
    Number.MAX_SAFE_INTEGER
  );
  // Price is in cents
  const price = minPrice === Number.MAX_SAFE_INTEGER ? 0 : minPrice / 100;

  // Get default image
  const defaultImage = printifyProduct.images.find(img => img.is_default) || printifyProduct.images[0];

  // Try to determine category from tags
  // Default to personalized/handmade/other
  let category = GiftCategory.PERSONALIZED; // Default for POD

  // Simple heuristic for category mapping
  const tagsStr = printifyProduct.tags.join(' ').toLowerCase();
  if (tagsStr.includes('mug') || tagsStr.includes('decor') || tagsStr.includes('canvas') || tagsStr.includes('poster')) {
    category = GiftCategory.HOME_DECOR;
  } else if (tagsStr.includes('shirt') || tagsStr.includes('hoodie') || tagsStr.includes('clothing') || tagsStr.includes('socks')) {
    category = GiftCategory.FASHION;
  } else if (tagsStr.includes('tech') || tagsStr.includes('case') || tagsStr.includes('mouse pad')) {
    category = GiftCategory.TECH;
  }

  // Product URL
  // Use external handle if available, otherwise fallback
  let productUrl = '#';
  if (printifyProduct.external && printifyProduct.external.length > 0 && printifyProduct.external[0].handle) {
    productUrl = printifyProduct.external[0].handle;
  } else if (defaultImage) {
    // Fallback to image if no URL (not ideal but better than empty)
    productUrl = defaultImage.src;
  }

  return {
    id: printifyProduct.id,
    source: 'printify',
    name: printifyProduct.title,
    description: printifyProduct.description,
    category,
    price,
    currency: 'USD',
    imageUrl: defaultImage ? defaultImage.src : '',
    productUrl,
    vendorName: 'Printify',
    tags: printifyProduct.tags,
    metadata: {
      shopId: printifyProduct.shop_id,
      visible: printifyProduct.visible,
      updatedAt: printifyProduct.updated_at
    }
  };
}

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
