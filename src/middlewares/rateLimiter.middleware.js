import { redis } from "../utils/redis.js";

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets (ZSET)
 *
 * Algorithm:
 * 1. Remove request timestamps older than (now - windowSeconds)
 * 2. Count requests remaining in the current sliding window
 * 3. If count >= max -> block request with HTTP 429 & Retry-After header
 * 4. Otherwise -> record current timestamp and proceed with next()
 * 5. Gracefully allows requests if Redis is offline/unreachable
 */
export function rateLimiter({
  prefix = "general",
  getMax = () => 30,
  getWindow = () => 60,
}) {
  return async (req, res, next) => {
    // If Redis is not configured, gracefully allow traffic
    if (!redis) return next();

    const max = Number(getMax()) || 30;
    const windowSeconds = Number(getWindow()) || 60;

    try {
      const identifier = req.userId || req.ip || "anonymous";
      const key = `ratelimit:${prefix}:${identifier}`;
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      const clearBefore = now - windowMs;

      // 1. Remove expired timestamps outside the sliding window
      await redis.zremrangebyscore(key, 0, clearBefore);

      // 2. Count requests inside the sliding window
      const count = await redis.zcard(key);

      if (count >= max) {
        res.set("Retry-After", String(windowSeconds));
        res.set("X-RateLimit-Limit", String(max));
        res.set("X-RateLimit-Remaining", "0");

        return res.status(429).json({
          success: false,
          Status: 429,
          message: `Too many requests for ${prefix}. Limit is ${max} requests per ${windowSeconds}s. Please wait a moment before retrying.`,
        });
      }

      // 3. Record current request timestamp
      await redis.zadd(key, {
        score: now,
        member: `${now}-${Math.random().toString(36).substring(2, 7)}`,
      });
      await redis.expire(key, windowSeconds + 5);

      res.set("X-RateLimit-Limit", String(max));
      res.set("X-RateLimit-Remaining", String(Math.max(0, max - count - 1)));

      next();
    } catch (err) {
      console.warn(`[RateLimiter Warning for ${prefix}]:`, err.message);
      // Graceful fallback: never break valid user requests if Redis errors
      next();
    }
  };
}

// Pre-configured rate limiters based on dynamic .env settings
export const aiRateLimiter = rateLimiter({
  prefix: "ai_chat",
  getMax: () => process.env.AI_RATE_LIMIT_MAX || 10,
  getWindow: () => process.env.AI_RATE_LIMIT_WINDOW_SECONDS || 60,
});

export const fetchRateLimiter = rateLimiter({
  prefix: "question_fetch",
  getMax: () => process.env.FETCH_RATE_LIMIT_MAX || 60,
  getWindow: () => process.env.FETCH_RATE_LIMIT_WINDOW_SECONDS || 60,
});

export const submitRateLimiter = rateLimiter({
  prefix: "question_submit",
  getMax: () => process.env.SUBMIT_RATE_LIMIT_MAX || 30,
  getWindow: () => process.env.SUBMIT_RATE_LIMIT_WINDOW_SECONDS || 60,
});
