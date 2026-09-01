import { Redis } from "@upstash/redis";

// Initialize Upstash Redis instance (reads from .env)
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Reusable Cache-Aside Helper Function:
 * 1. Checks Redis cache by key (Cache HIT) -> returns cached data
 * 2. If not found in Redis (Cache MISS) -> executes fetchFn(), caches result with TTL, and returns it
 * 3. Gracefully degrades to database query if Redis is unreachable or unconfigured
 *
 * @param {string} key - Redis cache key
 * @param {number} ttlSeconds - Time-To-Live in seconds (e.g., 86400 = 24 hours)
 * @param {Function} fetchFn - Async function to fetch fresh data from database
 */
export async function getOrSetCache(key, ttlSeconds, fetchFn) {
  if (!redis) {
    return await fetchFn();
  }

  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`⚡ [Redis CACHE HIT]: ${key}`);
      return cachedData;
    }
  } catch (err) {
    console.warn(`⚠️ [Redis Warning on GET for ${key}]:`, err.message);
  }

  // Cache MISS: Query database
  console.log(`🐢 [Redis CACHE MISS]: ${key}`);
  const freshData = await fetchFn();

  if (freshData) {
    try {
      await redis.set(key, freshData, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`⚠️ [Redis Warning on SET for ${key}]:`, err.message);
    }
  }

  return freshData;
}
