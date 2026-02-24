import { getDb } from '../db/connection.js';

/**
 * Cart Rule Engine — validates candidate carts against dish-family pairing rules
 * and enforces vegness constraints. This is the "Food Intelligence" layer.
 */

// Cache rules in memory for fast lookups
let rulesCache = null;

function loadRules() {
    if (rulesCache) return rulesCache;

    const db = getDb();
    const rows = db.prepare(`
    SELECT r.family_a_id, r.family_b_id, r.meal_slot, r.score,
           fa.name as family_a_name, fb.name as family_b_name
    FROM dish_family_rules r
    JOIN dish_families fa ON fa.id = r.family_a_id
    JOIN dish_families fb ON fb.id = r.family_b_id
  `).all();

    rulesCache = new Map();
    for (const row of rows) {
        const key = `${row.family_a_id}:${row.family_b_id}:${row.meal_slot}`;
        rulesCache.set(key, row.score);
    }
    return rulesCache;
}

/**
 * Check if a two-item cart is a valid (coherent) pairing for the given meal slot
 * @returns {number} pairing score (0 = invalid, >0 = valid)
 */
export function getPairingScore(familyAId, familyBId, mealSlot) {
    const rules = loadRules();
    const key = `${familyAId}:${familyBId}:${mealSlot}`;
    return rules.get(key) || 0;
}

/**
 * Check if a cart respects the user's dietary preferences
 * @param {number} userVegnessScore - 0=pure non-veg, 1=pure veg
 * @param {Array} items - menu items in the cart
 * @returns {boolean}
 */
export function respectsVegness(userVegnessScore, items) {
    // Pure veg users (score >= 0.9) should never see non-veg items
    if (userVegnessScore >= 0.9) {
        return items.every(item => item.is_veg === 1);
    }
    // Mostly veg users (score >= 0.7) — prefer veg but allow non-veg
    // No hard filter, but we'll penalize in ranking
    return true;
}

/**
 * Filter a list of candidate carts, keeping only valid pairings
 * @param {Array} carts - candidate carts [{items: [{id, dish_family_id, ...}], ...}]
 * @param {string} mealSlot
 * @param {number} userVegnessScore
 * @returns {Array} filtered carts with pairing scores
 */
export function filterCarts(carts, mealSlot, userVegnessScore) {
    return carts
        .filter(cart => respectsVegness(userVegnessScore, cart.items))
        .map(cart => {
            let pairingScore = 1.0; // single-item carts always valid
            if (cart.items.length === 2) {
                pairingScore = getPairingScore(
                    cart.items[0].dish_family_id,
                    cart.items[1].dish_family_id,
                    mealSlot
                );
            }
            return { ...cart, pairingScore };
        })
        .filter(cart => cart.items.length === 1 || cart.pairingScore > 0);
}

/**
 * Reset the rules cache (e.g., after seed data changes)
 */
export function resetRulesCache() {
    rulesCache = null;
}
