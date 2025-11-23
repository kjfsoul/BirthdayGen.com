/**
 * Rate Limiting for Enrichment API
 * Phase 4 Module A Step 2 - BirthdayGen.com
 * 
 * IMPORTANT: This is an in-memory implementation suitable for single-instance deployments.
 * 
 * TODO: PRODUCTION DEPLOYMENT REQUIREMENTS
 * ========================================
 * For production/multi-instance deployments, replace with distributed cache:
 * 
 * Option 1 - Redis (Recommended for self-hosted):
 *   - Use @upstash/redis or ioredis
 *   - Implement sliding window or token bucket algorithm
 *   - Configure TTL for automatic cleanup
 * 
 * Option 2 - Upstash Redis (Recommended for serverless):
 *   - Use @upstash/redis (built for serverless/edge)
 *   - Serverless-friendly pricing model
 *   - Global edge network
 * 
 * Option 3 - Supabase (Not recommended for rate limiting):
 *   - Possible but adds database load for every request
 *   - Higher latency than in-memory cache
 *   - Use only if Redis/Upstash is not available
 * 
 * Current Implementation Notes:
 * - In-memory Map will reset on server restart
 * - Not shared across multiple server instances
 * - Suitable for development and single-instance MVP deployments only
 */

import type { RateLimitConfig, RateLimitStatus } from './types';

// Rate limit configuration
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  maxRequestsPerDay: 10000,
  burstLimit: 10, // Max 10 requests in 10 seconds
};

// In-memory rate limit tracking
// TODO: Replace with Redis/Upstash in production
interface RateLimitRecord {
  minute: { count: number; resetAt: Date };
  hour: { count: number; resetAt: Date };
  day: { count: number; resetAt: Date };
  burst: { timestamps: number[] }; // Last 10 seconds of timestamps
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Check rate limit for a user
 * 
 * TODO: In production, implement with Redis:
 * ```typescript
 * import { Redis } from '@upstash/redis';
 * const redis = Redis.fromEnv();
 * 
 * export async function checkRateLimit(userId: string): Promise<RateLimitStatus> {
 *   const key = `rate_limit:${userId}`;
 *   const count = await redis.incr(key);
 *   await redis.expire(key, 60); // 60 seconds TTL
 *   
 *   if (count > RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
 *     return { allowed: false, remaining: 0, resetAt: ... };
 *   }
 *   
 *   return { allowed: true, remaining: RATE_LIMIT_CONFIG.maxRequestsPerMinute - count, ... };
 * }
 * ```
 */
export async function checkRateLimit(userId: string): Promise<RateLimitStatus> {
  const now = Date.now();
  const record = getOrCreateRecord(userId);
  
  // Clean up burst timestamps (older than 10 seconds)
  record.burst.timestamps = record.burst.timestamps.filter(ts => now - ts < 10000);
  
  // Check burst limit (10 seconds)
  if (record.burst.timestamps.length >= RATE_LIMIT_CONFIG.burstLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now + 10000),
      retryAfter: 10,
    };
  }
  
  // Reset minute counter if expired
  if (now > record.minute.resetAt.getTime()) {
    record.minute = {
      count: 0,
      resetAt: new Date(now + 60000),
    };
  }
  
  // Reset hour counter if expired
  if (now > record.hour.resetAt.getTime()) {
    record.hour = {
      count: 0,
      resetAt: new Date(now + 3600000),
    };
  }
  
  // Reset day counter if expired
  if (now > record.day.resetAt.getTime()) {
    record.day = {
      count: 0,
      resetAt: new Date(now + 86400000),
    };
  }
  
  // Check limits
  if (record.minute.count >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    const retryAfter = Math.ceil((record.minute.resetAt.getTime() - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.minute.resetAt,
      retryAfter,
    };
  }
  
  if (record.hour.count >= RATE_LIMIT_CONFIG.maxRequestsPerHour) {
    const retryAfter = Math.ceil((record.hour.resetAt.getTime() - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.hour.resetAt,
      retryAfter,
    };
  }
  
  if (record.day.count >= RATE_LIMIT_CONFIG.maxRequestsPerDay) {
    const retryAfter = Math.ceil((record.day.resetAt.getTime() - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.day.resetAt,
      retryAfter,
    };
  }
  
  // Increment counters
  record.minute.count++;
  record.hour.count++;
  record.day.count++;
  record.burst.timestamps.push(now);
  
  rateLimitStore.set(userId, record);
  
  // Calculate remaining (use most restrictive limit)
  const remaining = Math.min(
    RATE_LIMIT_CONFIG.maxRequestsPerMinute - record.minute.count,
    RATE_LIMIT_CONFIG.maxRequestsPerHour - record.hour.count,
    RATE_LIMIT_CONFIG.maxRequestsPerDay - record.day.count,
    RATE_LIMIT_CONFIG.burstLimit - record.burst.timestamps.length
  );
  
  return {
    allowed: true,
    remaining,
    resetAt: record.minute.resetAt,
  };
}

/**
 * Get or create rate limit record
 * TODO: Replace with Redis key in production
 */
function getOrCreateRecord(userId: string): RateLimitRecord {
  const existing = rateLimitStore.get(userId);
  if (existing) {
    return existing;
  }
  
  const now = Date.now();
  const newRecord: RateLimitRecord = {
    minute: {
      count: 0,
      resetAt: new Date(now + 60000),
    },
    hour: {
      count: 0,
      resetAt: new Date(now + 3600000),
    },
    day: {
      count: 0,
      resetAt: new Date(now + 86400000),
    },
    burst: {
      timestamps: [],
    },
  };
  
  rateLimitStore.set(userId, newRecord);
  return newRecord;
}

/**
 * Reset rate limit for a user (admin function)
 * TODO: Implement with Redis DEL command in production
 */
export async function resetRateLimit(userId: string): Promise<void> {
  rateLimitStore.delete(userId);
}

/**
 * Get rate limit stats for a user
 * TODO: Implement with Redis multi-key GET in production
 */
export async function getRateLimitStats(userId: string): Promise<{
  minute: { used: number; limit: number; resetAt: Date };
  hour: { used: number; limit: number; resetAt: Date };
  day: { used: number; limit: number; resetAt: Date };
}> {
  const record = getOrCreateRecord(userId);
  
  return {
    minute: {
      used: record.minute.count,
      limit: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
      resetAt: record.minute.resetAt,
    },
    hour: {
      used: record.hour.count,
      limit: RATE_LIMIT_CONFIG.maxRequestsPerHour,
      resetAt: record.hour.resetAt,
    },
    day: {
      used: record.day.count,
      limit: RATE_LIMIT_CONFIG.maxRequestsPerDay,
      resetAt: record.day.resetAt,
    },
  };
}
