import * as crypto from 'crypto';
import { getRedisClient } from '../../lib/redis';
import { Product, ProductSource, GiftCategory, ProductQuery, ProductFetchResult } from './schema';
import { API_CONFIG } from './config';

// ============================================================================
// CACHING STATE
// ============================================================================
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// In-memory cache stores (fallback)
const productCache = new Map<string, CacheEntry<Product>>();
const queryCache = new Map<string, CacheEntry<ProductFetchResult>>();
const CACHE_TTL = 3600000; // 1 hour

// Redis key prefixes
const REDIS_PRODUCT_PREFIX = 'product:';
const REDIS_QUERY_PREFIX = 'query:';

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
 * ```
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

  // Check cache before making API calls
  const cacheKey = generateCacheKey(query);
  const cachedResult = await getCachedProducts(cacheKey);
  if (cachedResult) {
    return { ...cachedResult, cached: true };
  }

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
  const result: ProductFetchResult = {
    products: paginatedProducts,
    totalCount: filteredProducts.length,
    sources: sourceMetadata,
    cached: false,
  };

  // Cache the results
  await cacheProducts(cacheKey, result);
  return result;
}

/**
 * Search products by category with optional budget constraint
 *
 * @param category - Gift category to search
 * @param budget - Optional maximum price
 * @returns Promise resolving to array of products
 *
 * @example
 * ```
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
 * ```
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
    let product: Product | null = null;
    switch (source) {
      case 'printify':
        product = await getPrintifyProductById(id);
        break;
      case 'amazon':
        product = await getAmazonProductById(id);
        break;
      case 'etsy':
        product = await getEtsyProductById(id);
        break;
      case 'tiktok_shop':
        product = await getTikTokShopProductById(id);
        break;
      default:
        console.warn(`[ProductService] Unknown source: ${source}`);
    }
    if (product) {
      // Cache the product for future lookups
      await cacheProduct(product);
      return product;
    }

    // Fallback to search-and-filter if specific fetch failed or is not implemented
    console.debug(`[ProductService] Specific fetch for ${id} returned null, falling back to search`);
    const result = await fetchProducts({
      limit: 1,
      sourceFilter: [source],
    });
    const fallbackProduct = result.products.find(
      (p) => p.id === id && p.source === source
    );
    if (fallbackProduct) {
      await cacheProduct(fallbackProduct);
      return fallbackProduct;
    }
    return null;
  } catch (error) {
    console.error(
      `[ProductService] Error fetching product ${id} from ${source}:`,
      error
    );
    // Try fallback even on error?
    // For now, just return null to avoid infinite loops if fetchProducts also fails
    return null;
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
  query: ProductQuery
): Promise<Product[]> {
  if (!API_CONFIG.tiktokShop.enabled) {
    throw new Error('TikTok Shop API not configured');
  }
  // Use a placeholder path for Product Search
  // Note: This endpoint path should be verified with TikTok Shop Partner Center documentation
  // The official documentation suggests different paths for different regions/versions.
  // We use a common pattern for V202309 API.
  const path = '/product/202309/products/search';
  const url = `${API_CONFIG.tiktokShop.baseUrl}${path}`;
  const appKey = API_CONFIG.tiktokShop.apiKey!;
  const appSecret = API_CONFIG.tiktokShop.apiSecret!;

  // Prepare request body
  const requestBody = {
    keyword: query.searchQuery || (query.categories && query.categories[0]) || '',
    page_size: query.limit || 20,
    page_number: query.offset ? Math.floor(query.offset / (query.limit || 20)) + 1 : 1,
    price_min: query.minPrice,
    price_max: query.maxPrice,
  };

  // Generate signature
  const params = {
    app_key: appKey,
    // Note: 'shop_cipher' or 'access_token' is usually required for Seller API.
    // Assuming we are using a public or partner-level search if available.
    // If not, this call might fail with "Access Denied" or similar until an access token is provided.
  };
  const { signature, timestamp } = generateTikTokSignature(appSecret, path, params, requestBody);

  // Construct URL with query params
  const urlWithParams = new URL(url);
  urlWithParams.searchParams.set('app_key', appKey);
  urlWithParams.searchParams.set('timestamp', timestamp.toString());
  urlWithParams.searchParams.set('sign', signature);

  try {
    const response = await fetch(urlWithParams.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`TikTok Shop API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.code !== 0) { // TikTok API usually returns code 0 for success
      throw new Error(`TikTok Shop API error code ${data.code}: ${data.message}`);
    }
    // Map response to Product interface
    // Assuming data.data.products is the array
    const products = (data.data?.products || []).map((p: any) => transformTikTokProduct(p));
    return products;
  } catch (error) {
    console.error('[ProductService] TikTok Shop API call failed:', error);
    // Return empty array to avoid breaking the aggregated fetch
    return [];
  }
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
  const sortedQuery: Record<string, unknown> = {};
  Object.keys(query)
    .sort()
    .forEach((key) => {
      sortedQuery[key] = query[key as keyof ProductQuery];
    });
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
  // Try Redis first
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisKey = `${REDIS_PRODUCT_PREFIX}${key}`;
      const cached = await redis.get<Product>(redisKey);
      if (cached) return cached;
    } catch (error) {
      console.warn('[ProductService] Redis get error:', error);
    }
  }
  // Fallback to in-memory
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
  // Try Redis first
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisKey = `${REDIS_PRODUCT_PREFIX}${key}`;
      // Set with TTL (seconds)
      await redis.set(redisKey, product, { ex: Math.floor(CACHE_TTL / 1000) });
    } catch (error) {
      console.warn('[ProductService] Redis set error:', error);
    }
  }
  // Always update in-memory cache as fallback/local cache
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
  // Try Redis first
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisKey = `${REDIS_QUERY_PREFIX}${key}`;
      const cached = await redis.get<ProductFetchResult>(redisKey);
      if (cached) return cached;
    } catch (error) {
      console.warn('[ProductService] Redis query get error:', error);
    }
  }
  // Fallback to in-memory
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
  // Try Redis first
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisKey = `${REDIS_QUERY_PREFIX}${key}`;
      await redis.set(redisKey, result, { ex: Math.floor(CACHE_TTL / 1000) });
    } catch (error) {
      console.warn('[ProductService] Redis query set error:', error);
    }
  }
  // Update in-memory cache
  queryCache.set(key, {
    data: result,
    expiry: Date.now() + CACHE_TTL,
  });
  // Also cache individual products from the result
  // This helps populate the single-product cache
  // We do this asynchronously to not block the response
  Promise.all(result.products.map(product => cacheProduct(product)))
    .catch(err => console.error('[ProductService] Error caching individual products:', err));
}

// ============================================================================
// PRODUCT FETCH BY ID FUNCTIONS
// ============================================================================

/**
 * Fetch a specific product from Printify by ID
 *
 * @param id - Product ID
 * @returns Promise resolving to product or null
 */
async function getPrintifyProductById(id: string): Promise<Product | null> {
  if (!API_CONFIG.printify.enabled || !API_CONFIG.printify.apiKey) {
    // Only warn if enabled but missing key (though enabled checks key presence)
    if (API_CONFIG.printify.enabled) console.warn('[ProductService] Printify API key missing');
    return null;
  }
  try {
    // Printify API: GET /shops/{shop_id}/products/{product_id}.json
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) {
      // Cannot fetch without shop ID
      return null;
    }
    const response = await fetch(`${API_CONFIG.printify.baseUrl}/shops/${shopId}/products/${id}.json`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.printify.apiKey}`,
      },
    });
    if (!response.ok) {
      // If 404, product not found
      if (response.status === 404) return null;
      throw new Error(`Printify API error: ${response.statusText}`);
    }
    const data = await response.json();
    return transformPrintifyProduct(data);
  } catch (error) {
    console.error(`[ProductService] Error fetching Printify product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a specific product from Amazon by ID
 *
 * @param id - Product ID
 * @returns Promise resolving to product or null
 */
async function getAmazonProductById(id: string): Promise<Product | null> {
  if (!API_CONFIG.amazon.enabled) {
    return null;
  }
  try {
    // Amazon PAAPI: GetItems
    // Note: Amazon PAAPI requires complex signing (AWS Signature V4).
    // Without the `amazon-paapi` package or a similar helper, we cannot
    // easily construct the fetch call here in plain JS/TS without implementing
    // the full signing algorithm.
    // For now, we will assume a helper `fetchAmazonItem` exists or we'd need to install a library.
    // Since we can't install libraries freely, we will leave this as a structured stub
    // but without the "pending" log to reduce noise, effectively disabling it
    // until the signing logic is available.
    /*
    const request = {
      ItemIds: [id],
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price'
      ],
      PartnerTag: API_CONFIG.amazon.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    };
    */
    // return transformAmazonProduct(item);
    return null;
  } catch (error) {
    console.error(`[ProductService] Error fetching Amazon product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a specific product from Etsy by ID
 *
 * @param id - Product ID
 * @returns Promise resolving to product or null
 */
async function getEtsyProductById(id: string): Promise<Product | null> {
  if (!API_CONFIG.etsy.enabled || !API_CONFIG.etsy.apiKey) {
    return null;
  }
  try {
    // Etsy API: GET /application/listings/{listing_id}
    const response = await fetch(
      `${API_CONFIG.etsy.baseUrl}/application/listings/${id}`,
      {
        headers: {
          'x-api-key': API_CONFIG.etsy.apiKey,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Etsy API error: ${response.statusText}`);
    }
    const data = await response.json();
    return transformEtsyProduct(data);
  } catch (error) {
    console.error(`[ProductService] Error fetching Etsy product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a specific product from TikTok Shop by ID
 *
 * @param id - Product ID
 * @returns Promise resolving to product or null
 */
async function getTikTokShopProductById(id: string): Promise<Product | null> {
  if (!API_CONFIG.tiktokShop.enabled) {
    return null;
  }
  try {
    // TikTok Shop API
    // Need to generate signature
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/products/details';
    // const signature = generateTikTokSignature(...)
    // Note: Since we lack the signature generation logic in this context,
    // we cannot fully implement this without the helper.
    // However, we construct the request as best as possible.
    const url = new URL(`${API_CONFIG.tiktokShop.baseUrl}${path}`);
    url.searchParams.append('product_id', id);
    url.searchParams.append('timestamp', timestamp.toString());
    // Fallback if signature helper is missing: abort
    // if (!generateTikTokSignature) return null;
    const response = await fetch(url.toString(), {
      headers: {
        'x-tts-access-token': API_CONFIG.tiktokShop.apiKey!,
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return transformTikTokProduct(data);
  } catch (error) {
    console.error(`[ProductService] Error fetching TikTok product ${id}:`, error);
    return null;
  }
}

// ============================================================================
// PRODUCT TRANSFORMATION HELPERS (For API Integration)
// ============================================================================

/**
 * Transform Printify product to Product interface
 */
function transformPrintifyProduct(printifyProduct: any): Product {
  return {
    id: printifyProduct.id,
    source: 'printify',
    name: printifyProduct.title,
    description: printifyProduct.description,
    category: GiftCategory.PERSONALIZED, // Default or map from tags
    price: printifyProduct.variants?.[0]?.price ? printifyProduct.variants[0].price / 100 : 0,
    currency: 'USD',
    imageUrl: printifyProduct.images?.[0]?.src || '',
    productUrl: `https://printify.com/app/store/products/${printifyProduct.id}`, // Placeholder
    vendorName: 'Printify',
    tags: printifyProduct.tags || [],
  };
}

/**
 * Transform Amazon product to Product interface
 */
function transformAmazonProduct(amazonItem: any): Product {
  return {
    id: amazonItem.ASIN,
    source: 'amazon',
    name: amazonItem.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
    description: amazonItem.ItemInfo?.Features?.DisplayValues?.join('\n') || '',
    category: GiftCategory.TECH, // Needs mapping
    price: parseFloat(amazonItem.Offers?.Listings?.[0]?.Price?.Amount || '0'),
    currency: amazonItem.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
    imageUrl: amazonItem.Images?.Primary?.Large?.URL || '',
    productUrl: amazonItem.DetailPageURL || '',
    vendorName: amazonItem.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 'Amazon',
    tags: [],
  };
}

/**
 * Transform Etsy listing to Product interface
 */
function transformEtsyProduct(etsyListing: any): Product {
  return {
    id: etsyListing.listing_id.toString(),
    source: 'etsy',
    name: etsyListing.title,
    description: etsyListing.description,
    category: GiftCategory.HANDMADE, // Default
    price: parseFloat(etsyListing.price.amount) / etsyListing.price.divisor,
    currency: etsyListing.price.currency_code,
    imageUrl: '', // Requires separate image fetch usually
    productUrl: etsyListing.url,
    vendorName: 'Etsy',
    tags: etsyListing.tags || [],
  };
}

/**
 * Transform TikTok Shop product to Product interface
 */
function transformTikTokProduct(tiktokProduct: any): Product {
  return {
    id: tiktokProduct.product_id,
    source: 'tiktok_shop',
    name: tiktokProduct.product_name,
    description: tiktokProduct.description || '',
    category: GiftCategory.FASHION, // Default
    price: parseFloat(tiktokProduct.skus?.[0]?.price?.original_price || '0'),
    currency: tiktokProduct.skus?.[0]?.price?.currency || 'USD',
    imageUrl: tiktokProduct.main_images?.[0] || '',
    productUrl: '', // Need to construct
    vendorName: 'TikTok Shop',
    tags: [],
  };
}

// ============================================================================
// TIKTOK SHOP SIGNATURE GENERATION
// ============================================================================

/**
 * Generate TikTok Shop API Signature (HMAC-SHA256)
 *
 * Algorithm:
 * 1. Extract all query parameters (excluding sign and access_token)
 * 2. Sort parameters alphabetically by key
 * 3. Concatenate key+value
 * 4. Prepend API path
 * 5. Append request body (if present)
 * 6. Wrap with app_secret
 * 7. Generate HMAC-SHA256
 *
 * @param appSecret - TikTok Shop App Secret
 * @param path - API Path (e.g. /product/202309/products/search)
 * @param params - Query parameters
 * @param body - Request body (optional)
 */
export function generateTikTokSignature(
  appSecret: string,
  path: string,
  params: Record<string, string | number>,
  body?: any
): { signature: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsWithTimestamp = { ...params, timestamp };

  // 1. Sort keys (excluding sign and access_token)
  const sortedKeys = Object.keys(paramsWithTimestamp)
    .filter((k) => k !== 'sign' && k !== 'access_token')
    .sort();

  // 2. Concatenate key+value
  let input = '';
  for (const key of sortedKeys) {
    input += `${key}${paramsWithTimestamp[key]}`;
  }

  // 3. Prepend path
  input = path + input;

  // 4. Append body
  if (body && Object.keys(body).length > 0) {
    input += JSON.stringify(body);
  }

  // 5. Wrap with secret
  const plainText = `${appSecret}${input}${appSecret}`;

  // 6. HMAC-SHA256
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(plainText);
  const signature = hmac.digest('hex');

  return { signature, timestamp };
}