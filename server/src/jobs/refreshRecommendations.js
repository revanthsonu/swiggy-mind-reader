import { preComputeAll } from '../engine/recommender.js';
import { setCache, clearCache } from '../cache/redis.js';

/**
 * Background job: pre-computes recommendations for all users × meal slots
 * and writes them to the cache for sub-20ms API responses.
 */
export async function refreshRecommendations() {
    console.log('🔄 Refreshing recommendations for all users...');
    const t0 = performance.now();

    try {
        // Clear old cache
        await clearCache();

        // Compute fresh recommendations
        const allRecs = preComputeAll();

        // Write to cache
        let count = 0;
        for (const [key, data] of Object.entries(allRecs)) {
            const [userId, mealSlot] = key.split(':');
            await setCache(parseInt(userId), mealSlot, data);
            count++;
        }

        const elapsed = Math.round(performance.now() - t0);
        console.log(`✅ Pre-computed ${count} recommendation sets in ${elapsed}ms`);

        return { count, elapsed };
    } catch (err) {
        console.error('❌ Recommendation refresh failed:', err.message);
        throw err;
    }
}
