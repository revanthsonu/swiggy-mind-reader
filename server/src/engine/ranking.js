import { getDb } from '../db/connection.js';

/**
 * Ranking Engine — scores and ranks candidate carts using multiple signals:
 *   1. Pairing score (from rule engine)
 *   2. User affinity (from order history)
 *   3. Item popularity (order count + rating)
 *   4. Recency (prefer recently popular items)
 *   5. Vegness penalty (if user is mostly veg but cart has non-veg)
 *   6. History boost (user has ordered from this restaurant before)
 */

const WEIGHTS = {
    pairing: 0.20,
    popularity: 0.20,
    rating: 0.15,
    userAffinity: 0.25,
    recency: 0.10,
    historyBoost: 0.10,
};

/**
 * Compute a composite score for a candidate cart
 */
export function scoreCart(cart, userProfile) {
    const scores = {};

    // 1. Pairing score (already computed by rule engine)
    scores.pairing = cart.pairingScore || 1.0;

    // 2. Popularity — normalized order count
    const maxOrders = 12000; // approximate max from our data
    const avgOrders = cart.items.reduce((s, i) => s + (i.orderCount || 0), 0) / cart.items.length;
    scores.popularity = Math.min(avgOrders / maxOrders, 1.0);

    // 3. Average item rating
    const avgRating = cart.items.reduce((s, i) => s + (i.rating || 4.0), 0) / cart.items.length;
    scores.rating = (avgRating - 3.0) / 2.0; // normalize 3-5 range to 0-1

    // 4. User affinity — does the user prefer this cuisine/restaurant?
    let affinity = 0.5; // default
    if (userProfile) {
        const preferredCuisines = JSON.parse(userProfile.preferred_cuisines || '[]');
        if (preferredCuisines.includes(cart.restaurant.cuisine)) {
            affinity = 0.9;
        }
        // Boost if user has ordered from this restaurant
        if (cart.isFromHistory) {
            affinity = Math.max(affinity, 0.85);
        }
    }
    scores.userAffinity = affinity;

    // 5. Recency — platform frequency as proxy
    scores.recency = Math.min((cart.frequency || 1) / 5, 1.0);

    // 6. History boost
    scores.historyBoost = cart.isFromHistory ? 1.0 : 0.3;

    // 7. Vegness penalty
    let vegPenalty = 0;
    if (userProfile && userProfile.vegness_score >= 0.7) {
        const hasNonVeg = cart.items.some(i => i.is_veg === 0);
        if (hasNonVeg) {
            vegPenalty = (userProfile.vegness_score - 0.7) * 3.3; // 0 to 1 penalty
        }
    }

    // Weighted composite score
    const composite =
        scores.pairing * WEIGHTS.pairing +
        scores.popularity * WEIGHTS.popularity +
        scores.rating * WEIGHTS.rating +
        scores.userAffinity * WEIGHTS.userAffinity +
        scores.recency * WEIGHTS.recency +
        scores.historyBoost * WEIGHTS.historyBoost -
        vegPenalty * 0.5;

    return {
        score: Math.max(0, Math.min(1, composite)),
        breakdown: scores,
    };
}

/**
 * Rank a list of scored carts — de-duplicate by dish family pairs and restaurant
 */
export function rankCarts(carts, userProfile, maxResults = 15) {
    // Score all carts
    const scored = carts.map(cart => {
        const { score, breakdown } = scoreCart(cart, userProfile);
        return { ...cart, score, scoreBreakdown: breakdown };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // De-duplicate: max 2 carts per restaurant, no duplicate dish-family pairs
    const result = [];
    const restCount = {};
    const familyPairs = new Set();

    for (const cart of scored) {
        if (result.length >= maxResults) break;

        const rid = cart.restaurantId;
        restCount[rid] = (restCount[rid] || 0);
        if (restCount[rid] >= 2) continue;

        // Check dish family pair uniqueness
        const familyIds = cart.items.map(i => i.dish_family_id).sort().join(':');
        if (familyPairs.has(familyIds) && cart.items.length > 1) continue;

        restCount[rid]++;
        familyPairs.add(familyIds);
        result.push(cart);
    }

    return result;
}
