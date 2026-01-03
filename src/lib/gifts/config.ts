/**
 * Gift Product Service Configuration
 * API configuration for external product sources
 */

const API_CONFIG = {
  printify: {
    enabled: false, // Set to true and provide API key to enable
    apiKey: process.env.PRINTIFY_API_KEY || '',
    baseUrl: 'https://api.printify.com/v1',
  },
  amazon: {
    enabled: false, // Set to true and provide credentials to enable
    partnerTag: process.env.AMAZON_ASSOCIATES_TAG || '',
    accessKey: process.env.AMAZON_ACCESS_KEY || '',
    secretKey: process.env.AMAZON_SECRET_KEY || '',
    baseUrl: 'https://webservices.amazon.com/paapi5',
  },
  etsy: {
    enabled: false, // Set to true and provide API key to enable
    apiKey: process.env.ETSY_API_KEY || '',
    baseUrl: 'https://api.etsy.com/v3',
  },
  tiktokShop: {
    enabled: false, // Set to true and provide API credentials to enable
    apiKey: process.env.TIKTOK_SHOP_API_KEY || '',
    apiSecret: process.env.TIKTOK_SHOP_API_SECRET || '',
    baseUrl: 'https://open-api.tiktokglobalshop.com',
  },
};

// Rate limiting configuration
export const RATE_LIMITS = {
  printify: {
    maxRequestsPerMinute: 60,
    burstLimit: 10,
  },
  amazon: {
    maxRequestsPerSecond: 1,
    burstLimit: 5,
  },
  etsy: {
    maxRequestsPerMinute: 120,
    burstLimit: 20,
  },
  tiktokShop: {
    maxRequestsPerMinute: 30,
    burstLimit: 5,
  },
};

// Cache configuration
export const CACHE_CONFIG = {
  defaultTTL: 3600000, // 1 hour in milliseconds
  maxItems: 1000,
  redisEnabled: process.env.REDIS_URL ? true : false,
};

// Feature flags
export const FEATURE_FLAGS = {
  enableProductCaching: true,
  enableRateLimiting: true,
  enableMultiSourceAggregation: true,
  enableAffiliateLinks: false,
};

export { API_CONFIG };