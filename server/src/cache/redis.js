/**
 * Cache Layer — Redis with in-memory Map fallback
 *
 * Key schema: recs:{userId}:{mealSlot}
 * TTL: 24 hours
 *
 * Falls back to an in-memory Map for local dev without Redis.
 * This ensures sub-20ms response times for cached recommendations.
 */

let redis = null;
let memoryCache = new Map();
let useMemoryFallback = true;

const TTL = 86400; // 24 hours in seconds

export async function initCache() {
    try {
        const { default: Redis } = await import('ioredis');
        redis = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
            maxRetriesPerRequest: 1,
            connectTimeout: 2000,
            lazyConnect: true,
            retryStrategy: () => null, // Don't retry if Redis is unavailable
        });
        redis.on('error', () => { }); // Suppress connection error logging

        await redis.connect();
        await redis.ping();
        useMemoryFallback = false;
        console.log('📦 Redis connected — using Redis cache');
    } catch (err) {
        console.log('📦 Redis unavailable — using in-memory cache (this is fine for local dev)');
        useMemoryFallback = true;
        redis = null;
    }
}

/**
 * Get cached recommendations
 * @returns {object|null} parsed recommendations or null
 */
export async function getCached(userId, mealSlot) {
    const key = `recs:${userId}:${mealSlot}`;
    const t0 = performance.now();

    try {
        if (useMemoryFallback) {
            const entry = memoryCache.get(key);
            if (entry && Date.now() - entry.ts < TTL * 1000) {
                return { data: entry.data, cacheLatency: Math.round(performance.now() - t0) };
            }
            return null;
        }

        const raw = await redis.get(key);
        if (raw) {
            return { data: JSON.parse(raw), cacheLatency: Math.round(performance.now() - t0) };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Store recommendations in cache
 */
export async function setCache(userId, mealSlot, data) {
    const key = `recs:${userId}:${mealSlot}`;

    try {
        if (useMemoryFallback) {
            memoryCache.set(key, { data, ts: Date.now() });
            return;
        }

        await redis.setex(key, TTL, JSON.stringify(data));
    } catch (err) {
        // Fallback to memory on write failure
        memoryCache.set(key, { data, ts: Date.now() });
    }
}

/**
 * Clear all cached recommendations
 */
export async function clearCache() {
    try {
        if (useMemoryFallback) {
            memoryCache.clear();
            return;
        }

        const keys = await redis.keys('recs:*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        memoryCache.clear();
    }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
    return {
        type: useMemoryFallback ? 'memory' : 'redis',
        entries: useMemoryFallback ? memoryCache.size : 'N/A',
    };
}
