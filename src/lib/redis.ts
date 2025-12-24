/**
 * Shared Redis Client
 *
 * Provides a lazy-initialized Redis client for use across the application.
 * Uses @upstash/redis.
 *
 * REQUIRED ENVIRONMENT VARIABLES:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;
let isInitialized = false;

/**
 * Get the shared Redis client instance.
 * Returns null if environment variables are not set.
 */
export function getRedisClient(): Redis | null {
  if (isInitialized) return redisInstance;

  isInitialized = true;

  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisInstance = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      console.warn('[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Redis features will be disabled.');
    }
  } catch (error) {
    console.warn('[Redis] Failed to initialize Redis client:', error);
    redisInstance = null;
  }

  return redisInstance;
}
