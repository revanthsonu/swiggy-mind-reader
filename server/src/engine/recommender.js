import { getDb } from '../db/connection.js';
import { getPlatformCarts, getUserHistoryCarts } from './retrieval.js';
import { filterCarts } from './cartRules.js';
import { rankCarts } from './ranking.js';

/**
 * Recommender Orchestrator — the main pipeline:
 *   1. Retrieve candidate carts (platform + user history)
 *   2. Filter through cart rules (food intelligence)
 *   3. Score and rank
 *   4. Return top-N recommendations
 */

/**
 * Generate recommendations for a specific user + meal slot
 */
export function generateRecommendations(userId, mealSlot, maxResults = 12) {
    const db = getDb();
    const t0 = performance.now();

    // Get user profile
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
        return { recommendations: [], latency: 0, error: 'User not found' };
    }

    // Step 1: Retrieve candidates from both sources
    const platformCarts = getPlatformCarts(mealSlot, 50);
    const t1 = performance.now();

    const historyCarts = getUserHistoryCarts(userId, mealSlot, 30);
    const t2 = performance.now();

    // Merge candidates
    const allCandidates = [...historyCarts, ...platformCarts];

    // Step 2: Filter through cart rules
    const filtered = filterCarts(allCandidates, mealSlot, user.vegness_score);
    const t3 = performance.now();

    // Step 3: Rank
    const ranked = rankCarts(filtered, user, maxResults);
    const t4 = performance.now();

    // Format output
    const recommendations = ranked.map((cart, index) => ({
        rank: index + 1,
        score: Math.round(cart.score * 100) / 100,
        restaurant: cart.restaurant,
        items: cart.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            isVeg: item.is_veg === 1,
            rating: item.rating,
            image: item.image,
            orderCount: item.orderCount || item.order_count,
        })),
        totalPrice: cart.items.reduce((s, i) => s + i.price, 0),
        source: cart.source,
        isPersonalized: cart.source === 'history' || cart.source === 'cross-sell',
    }));

    const totalLatency = Math.round(t4 - t0);

    return {
        recommendations,
        meta: {
            userId,
            mealSlot,
            totalCandidates: allCandidates.length,
            afterFiltering: filtered.length,
            returned: recommendations.length,
            latency: {
                total: totalLatency,
                retrieval: Math.round(t2 - t0),
                filtering: Math.round(t3 - t2),
                ranking: Math.round(t4 - t3),
            },
        },
    };
}

/**
 * Pre-compute recommendations for all users × meal slots
 * Used by the background refresh job
 */
export function preComputeAll() {
    const db = getDb();
    const users = db.prepare('SELECT id FROM users').all();
    const mealSlots = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const results = {};

    for (const user of users) {
        for (const slot of mealSlots) {
            const key = `${user.id}:${slot}`;
            const { recommendations, meta } = generateRecommendations(user.id, slot);
            results[key] = { recommendations, meta };
        }
    }

    return results;
}
