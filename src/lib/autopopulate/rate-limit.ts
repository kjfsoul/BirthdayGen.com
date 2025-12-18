/**
 * Rate Limiting for Enrichment API
 * Phase 4 Module A Step 2 - BirthdayGen.com
 * 
 * IMPORTANT: This implementation supports both in-memory (development) and Redis (production).
 * 
 * PRODUCTION DEPLOYMENT REQUIREMENTS
 * ========================================
 * Ensure the following environment variables are set:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import type { RateLimitConfig, RateLimitStatus } from './types';

// Rate limit configuration
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  maxRequestsPerDay: 10000,
  burstLimit: 10, // Max 10 requests in 10 seconds
};

// Redis client initialization (lazy)
let redis: Redis | null = null;
let limiters: {
  burst: Ratelimit;
  minute: Ratelimit;
  hour: Ratelimit;
  day: Ratelimit;
} | null = null;
let isInitialized = false;

function getLimiters() {
  if (isInitialized) return limiters;

  isInitialized = true;

  try {
    // Check for Upstash Redis variables
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      limiters = {
        burst: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.burstLimit, "10 s"),
          prefix: "@upstash/ratelimit:burst",
          analytics: true,
        }),
        minute: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.maxRequestsPerMinute, "1 m"),
          prefix: "@upstash/ratelimit:minute",
          analytics: true,
        }),
        hour: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.maxRequestsPerHour, "1 h"),
          prefix: "@upstash/ratelimit:hour",
          analytics: true,
        }),
        day: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.maxRequestsPerDay, "1 d"),
          prefix: "@upstash/ratelimit:day",
          analytics: true,
        }),
      };
    }
  } catch (error) {
    console.warn("Failed to initialize Redis rate limiter, falling back to in-memory:", error);
    limiters = null;
  }

  return limiters;
}

// In-memory fallback
interface RateLimitRecord {
  minute: { count: number; resetAt: Date };
  hour: { count: number; resetAt: Date };
  day: { count: number; resetAt: Date };
  burst: { timestamps: number[] }; // Last 10 seconds of timestamps
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Check rate limit for a user
 */
export async function checkRateLimit(userId: string): Promise<RateLimitStatus> {
  const limits = getLimiters();
  if (limits) {
    return checkRateLimitRedis(userId, limits);
  }
  return checkRateLimitMemory(userId);
}

/**
 * Redis implementation of rate limiting
 */
async function checkRateLimitRedis(
  userId: string,
  limits: NonNullable<typeof limiters>
): Promise<RateLimitStatus> {
  try {
    // Check all limits in parallel
    const [burst, minute, hour, day] = await Promise.all([
      limits.burst.limit(userId),
      limits.minute.limit(userId),
      limits.hour.limit(userId),
      limits.day.limit(userId)
    ]);

    const results = [burst, minute, hour, day];
    const blocked = results.find(r => !r.success);

    if (blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(blocked.reset),
        retryAfter: Math.ceil((blocked.reset - Date.now()) / 1000)
      };
    }

    // Find the most restrictive remaining count
    const minRemaining = Math.min(...results.map(r => r.remaining));

    // Use the reset time of the limiter that has the least remaining relative to its window?
    // Let's use the one with minimum remaining count for consistency
    const limitingResult = results.reduce((prev, curr) => prev.remaining < curr.remaining ? prev : curr);

    return {
      allowed: true,
      remaining: minRemaining,
      resetAt: new Date(limitingResult.reset),
    };
  } catch (error) {
    console.error("Redis rate limit check failed:", error);
    // Fallback to fail-open (allow) with warning
    return {
      allowed: true,
      remaining: 1,
      resetAt: new Date(),
    };
  }
}

/**
 * In-memory implementation of rate limiting
 */
async function checkRateLimitMemory(userId: string): Promise<RateLimitStatus> {
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
 * Get or create rate limit record (Memory only helper)
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
 */
export async function resetRateLimit(userId: string): Promise<void> {
  const limits = getLimiters();
  if (limits) {
    try {
      await Promise.all([
        limits.burst.resetUsedTokens(userId),
        limits.minute.resetUsedTokens(userId),
        limits.hour.resetUsedTokens(userId),
        limits.day.resetUsedTokens(userId),
      ]);
    } catch (error) {
       console.warn("Failed to reset Redis rate limit:", error);
    }
    return;
  }
  rateLimitStore.delete(userId);
}

/**
 * Get rate limit stats for a user
 */
export async function getRateLimitStats(userId: string): Promise<{
  minute: { used: number; limit: number; resetAt: Date };
  hour: { used: number; limit: number; resetAt: Date };
  day: { used: number; limit: number; resetAt: Date };
}> {
  const limits = getLimiters();
  if (limits) {
    try {
      // Use rate: 0 to check status without consuming tokens
      const [minute, hour, day] = await Promise.all([
        limits.minute.limit(userId, { rate: 0 }),
        limits.hour.limit(userId, { rate: 0 }),
        limits.day.limit(userId, { rate: 0 }),
      ]);

      return {
        minute: {
          used: minute.limit - minute.remaining,
          limit: minute.limit,
          resetAt: new Date(minute.reset)
        },
        hour: {
          used: hour.limit - hour.remaining,
          limit: hour.limit,
          resetAt: new Date(hour.reset)
        },
        day: {
          used: day.limit - day.remaining,
          limit: day.limit,
          resetAt: new Date(day.reset)
        },
      };
    } catch (error) {
      console.error("Failed to fetch Redis rate limit stats:", error);
      // Fallback to empty stats if Redis fails
      return {
        minute: { used: 0, limit: RATE_LIMIT_CONFIG.maxRequestsPerMinute, resetAt: new Date() },
        hour: { used: 0, limit: RATE_LIMIT_CONFIG.maxRequestsPerHour, resetAt: new Date() },
        day: { used: 0, limit: RATE_LIMIT_CONFIG.maxRequestsPerDay, resetAt: new Date() },
      };
    }
  }

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
