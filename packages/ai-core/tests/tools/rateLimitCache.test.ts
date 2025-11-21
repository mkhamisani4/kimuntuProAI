/**
 * Tests for Rate Limiting and Caching Utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, TTLCache, normalizeQuery, buildCacheKey } from '../../src/tools/rateLimitCache.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(5, 60); // 5 tokens, 60 per minute
  });

  it('should allow requests within limit', async () => {
    const tenant = 'tenant1';

    for (let i = 0; i < 5; i++) {
      const allowed = await limiter.checkLimit(tenant);
      expect(allowed).toBe(true);
    }
  });

  it('should block requests exceeding limit', async () => {
    const tenant = 'tenant1';

    // Use all tokens
    for (let i = 0; i < 5; i++) {
      await limiter.checkLimit(tenant);
    }

    // Next request should be blocked
    const allowed = await limiter.checkLimit(tenant);
    expect(allowed).toBe(false);
  });

  it('should track separate limits per tenant', async () => {
    const tenant1 = 'tenant1';
    const tenant2 = 'tenant2';

    // Exhaust tenant1's limit
    for (let i = 0; i < 5; i++) {
      await limiter.checkLimit(tenant1);
    }

    // tenant2 should still be allowed
    const allowed = await limiter.checkLimit(tenant2);
    expect(allowed).toBe(true);
  });

  it('should refill tokens over time', async () => {
    const tenant = 'tenant1';

    // Use all tokens
    for (let i = 0; i < 5; i++) {
      await limiter.checkLimit(tenant);
    }

    // Mock time passing (1 minute = 60 tokens refill)
    vi.useFakeTimers();
    vi.advanceTimersByTime(60000);

    const allowed = await limiter.checkLimit(tenant);
    expect(allowed).toBe(true);

    vi.useRealTimers();
  });

  it('should reset tenant limit', async () => {
    const tenant = 'tenant1';

    // Use some tokens
    await limiter.checkLimit(tenant);
    await limiter.checkLimit(tenant);

    // Reset
    limiter.reset(tenant);

    // Should have full tokens again
    const count = limiter.getTokenCount(tenant);
    expect(count).toBe(5);
  });

  it('should reset all limits', async () => {
    await limiter.checkLimit('tenant1');
    await limiter.checkLimit('tenant2');

    limiter.resetAll();

    expect(limiter.getTokenCount('tenant1')).toBe(5);
    expect(limiter.getTokenCount('tenant2')).toBe(5);
  });
});

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>(60, 100); // 60s TTL, 100 max size
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should expire values after TTL', () => {
    cache.set('key1', 'value1', 1); // 1 second TTL

    vi.useFakeTimers();
    vi.advanceTimersByTime(1500); // 1.5 seconds

    expect(cache.get('key1')).toBeUndefined();

    vi.useRealTimers();
  });

  it('should not expire values before TTL', () => {
    cache.set('key1', 'value1', 60);

    vi.useFakeTimers();
    vi.advanceTimersByTime(30000); // 30 seconds

    expect(cache.get('key1')).toBe('value1');

    vi.useRealTimers();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete entries', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');

    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    cache.clear();

    expect(cache.size()).toBe(0);
  });

  it('should evict oldest entry when max size reached', () => {
    const smallCache = new TTLCache<string>(60, 3);

    smallCache.set('key1', 'value1');
    smallCache.set('key2', 'value2');
    smallCache.set('key3', 'value3');
    smallCache.set('key4', 'value4'); // Should evict key1

    expect(smallCache.has('key1')).toBe(false);
    expect(smallCache.has('key4')).toBe(true);
  });

  it('should cleanup expired entries', () => {
    cache.set('key1', 'value1', 1);
    cache.set('key2', 'value2', 60);

    vi.useFakeTimers();
    vi.advanceTimersByTime(1500);

    cache.cleanup();

    expect(cache.size()).toBe(1);
    expect(cache.has('key2')).toBe(true);

    vi.useRealTimers();
  });

  it('should use custom TTL over default', () => {
    cache.set('key1', 'value1', 1); // Custom 1s TTL

    vi.useFakeTimers();
    vi.advanceTimersByTime(1500);

    expect(cache.get('key1')).toBeUndefined();

    vi.useRealTimers();
  });
});

describe('normalizeQuery', () => {
  it('should trim whitespace', () => {
    expect(normalizeQuery('  hello  ')).toBe('hello');
  });

  it('should convert to lowercase', () => {
    expect(normalizeQuery('Hello World')).toBe('hello world');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeQuery('hello    world')).toBe('hello world');
  });

  it('should handle all transformations together', () => {
    expect(normalizeQuery('  Hello   WORLD  ')).toBe('hello world');
  });
});

describe('buildCacheKey', () => {
  it('should create consistent keys', () => {
    const key1 = buildCacheKey('hello world', 5);
    const key2 = buildCacheKey('hello world', 5);

    expect(key1).toBe(key2);
  });

  it('should normalize query in key', () => {
    const key1 = buildCacheKey('  HELLO   WORLD  ', 5);
    const key2 = buildCacheKey('hello world', 5);

    expect(key1).toBe(key2);
  });

  it('should differentiate by n parameter', () => {
    const key1 = buildCacheKey('hello', 5);
    const key2 = buildCacheKey('hello', 10);

    expect(key1).not.toBe(key2);
  });
});
