/**
 * Simple in-memory rate limiter for Next.js middleware (edge-compatible).
 *
 * Uses a fixed-window counter per key. Suitable for low-to-moderate traffic.
 * For production at scale, swap this for a Redis-backed solution (e.g., Upstash).
 *
 * NOTE: On Vercel serverless each function instance has its own memory, so this
 * counter is NOT shared across concurrent instances. Acceptable at current
 * traffic volumes.
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/** Periodic cleanup to prevent unbounded memory growth */
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether a request identified by `key` is within the rate limit.
 *
 * @param key      Unique identifier (e.g., `auth:<ip>`)
 * @param limit    Maximum requests allowed within the window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanupStaleEntries();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetTime };
}
