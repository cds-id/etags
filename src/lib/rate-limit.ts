/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export type RateLimitConfig = {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
};

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses IP address and optionally fingerprint for more accurate identification
 */
export function getClientIdentifier(
  ip: string,
  fingerprintId?: string
): string {
  if (fingerprintId) {
    return `${ip}:${fingerprintId}`;
  }
  return ip;
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const RATE_LIMITS = {
  // Scan endpoint: 30 requests per minute per IP+fingerprint
  scan: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  // Claim endpoint: 10 requests per minute per IP+fingerprint
  claim: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Strict limit for suspicious activity: 5 requests per minute
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // Global limit per IP: 100 requests per minute
  global: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Format rate limit headers for response
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    ...(result.retryAfter && { 'Retry-After': String(result.retryAfter) }),
  };
}
