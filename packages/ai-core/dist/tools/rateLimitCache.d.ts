/**
 * Rate Limiting and Caching Utilities for Web Search
 * In-memory token bucket rate limiter and LRU cache with TTL
 */
/**
 * Rate limiter using token bucket algorithm
 */
export declare class RateLimiter {
    private buckets;
    private readonly maxTokens;
    private readonly refillRate;
    constructor(maxTokens?: number, refillRate?: number);
    /**
     * Check if tenant can make a request (consumes 1 token)
     * @param tenantId - Tenant identifier
     * @returns True if allowed, false if rate limited
     */
    checkLimit(tenantId: string): Promise<boolean>;
    /**
     * Get current token count for a tenant
     * @param tenantId - Tenant identifier
     * @returns Current token count
     */
    getTokenCount(tenantId: string): number;
    /**
     * Reset rate limit for a tenant
     * @param tenantId - Tenant identifier
     */
    reset(tenantId: string): void;
    /**
     * Clear all rate limits
     */
    resetAll(): void;
}
/**
 * Simple in-memory cache with TTL
 */
export declare class TTLCache<T> {
    private cache;
    private readonly defaultTTL;
    private readonly maxSize;
    constructor(defaultTTL?: number, maxSize?: number);
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or undefined if not found/expired
     */
    get(key: string): T | undefined;
    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - TTL in seconds (optional, uses default if not provided)
     */
    set(key: string, value: T, ttlSeconds?: number): void;
    /**
     * Check if key exists and is not expired
     * @param key - Cache key
     * @returns True if exists and valid
     */
    has(key: string): boolean;
    /**
     * Delete entry from cache
     * @param key - Cache key
     */
    delete(key: string): void;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Get cache size
     * @returns Number of entries in cache
     */
    size(): number;
    /**
     * Cleanup expired entries
     */
    cleanup(): void;
}
/**
 * Normalize query for caching (lowercase, trim, collapse whitespace)
 * @param query - Search query
 * @returns Normalized query
 */
export declare function normalizeQuery(query: string): string;
/**
 * Build cache key from normalized query and params
 * @param query - Normalized query
 * @param n - Max results
 * @returns Cache key
 */
export declare function buildCacheKey(query: string, n: number): string;
//# sourceMappingURL=rateLimitCache.d.ts.map