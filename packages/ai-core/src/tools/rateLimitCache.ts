/**
 * Rate Limiting and Caching Utilities for Web Search
 * In-memory token bucket rate limiter and LRU cache with TTL
 */

/**
 * Token bucket for rate limiting
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per minute
}

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(maxTokens: number = 100, refillRate: number = 100) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
  }

  /**
   * Check if tenant can make a request (consumes 1 token)
   * @param tenantId - Tenant identifier
   * @returns True if allowed, false if rate limited
   */
  async checkLimit(tenantId: string): Promise<boolean> {
    let bucket = this.buckets.get(tenantId);

    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
        maxTokens: this.maxTokens,
        refillRate: this.refillRate,
      };
      this.buckets.set(tenantId, bucket);
    }

    // Refill tokens based on time passed
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 60000; // minutes
    const tokensToAdd = Math.floor(timePassed * bucket.refillRate);

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Check if we have tokens available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Get current token count for a tenant
   * @param tenantId - Tenant identifier
   * @returns Current token count
   */
  getTokenCount(tenantId: string): number {
    const bucket = this.buckets.get(tenantId);
    return bucket?.tokens ?? this.maxTokens;
  }

  /**
   * Reset rate limit for a tenant
   * @param tenantId - Tenant identifier
   */
  reset(tenantId: string): void {
    this.buckets.delete(tenantId);
  }

  /**
   * Clear all rate limits
   */
  resetAll(): void {
    this.buckets.clear();
  }
}

/**
 * Simple in-memory cache with TTL
 */
export class TTLCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(defaultTTL: number = 300, maxSize: number = 1000) {
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or undefined if not found/expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - TTL in seconds (optional, uses default if not provided)
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const ttl = (ttlSeconds ?? this.defaultTTL) * 1000;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Check if key exists and is not expired
   * @param key - Cache key
   * @returns True if exists and valid
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete entry from cache
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Normalize query for caching (lowercase, trim, collapse whitespace)
 * @param query - Search query
 * @returns Normalized query
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Build cache key from normalized query and params
 * @param query - Normalized query
 * @param n - Max results
 * @returns Cache key
 */
export function buildCacheKey(query: string, n: number): string {
  return `${normalizeQuery(query)}:${n}`;
}
