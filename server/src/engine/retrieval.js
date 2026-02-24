import { getDb } from '../db/connection.js';

/**
 * Candidate Cart Retrieval — two sources:
 *   1. Popular platform carts (from all user orders)
 *   2. User's own order history (personalized)
 */

/**
 * Retrieve popular carts from platform-wide orders for a meal slot
 * These are real 1-2 item orders that have been placed before
 */
export function getPlatformCarts(mealSlot, limit = 50) {
    const db = getDb();

    // Get 2-item carts from platform orders
    const twos = db.prepare(`
    SELECT
      o.restaurant_id,
      r.name as restaurant_name,
      r.rating as restaurant_rating,
      r.delivery_time_min,
      r.cuisine,
      r.image_url as restaurant_image,
      oi1.menu_item_id as item1_id,
      m1.name as item1_name,
      m1.price as item1_price,
      m1.is_veg as item1_veg,
      m1.dish_family_id as item1_family,
      m1.rating as item1_rating,
      m1.order_count as item1_orders,
      m1.image_url as item1_image,
      oi2.menu_item_id as item2_id,
      m2.name as item2_name,
      m2.price as item2_price,
      m2.is_veg as item2_veg,
      m2.dish_family_id as item2_family,
      m2.rating as item2_rating,
      m2.order_count as item2_orders,
      m2.image_url as item2_image,
      COUNT(*) as cart_frequency
    FROM orders o
    JOIN order_items oi1 ON oi1.order_id = o.id
    JOIN order_items oi2 ON oi2.order_id = o.id AND oi2.menu_item_id > oi1.menu_item_id
    JOIN menu_items m1 ON m1.id = oi1.menu_item_id AND m1.is_available = 1
    JOIN menu_items m2 ON m2.id = oi2.menu_item_id AND m2.is_available = 1
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.meal_slot = ?
    GROUP BY oi1.menu_item_id, oi2.menu_item_id
    ORDER BY cart_frequency DESC, (m1.rating + m2.rating) DESC
    LIMIT ?
  `).all(mealSlot, limit);

    // Get single-item popular orders
    const singles = db.prepare(`
    SELECT
      o.restaurant_id,
      r.name as restaurant_name,
      r.rating as restaurant_rating,
      r.delivery_time_min,
      r.cuisine,
      r.image_url as restaurant_image,
      oi.menu_item_id as item1_id,
      m.name as item1_name,
      m.price as item1_price,
      m.is_veg as item1_veg,
      m.dish_family_id as item1_family,
      m.rating as item1_rating,
      m.order_count as item1_orders,
      m.image_url as item1_image,
      COUNT(*) as cart_frequency
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN menu_items m ON m.id = oi.menu_item_id AND m.is_available = 1
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.meal_slot = ?
      AND (SELECT COUNT(*) FROM order_items oi2 WHERE oi2.order_id = o.id) = 1
    GROUP BY oi.menu_item_id
    ORDER BY cart_frequency DESC, m.rating DESC
    LIMIT ?
  `).all(mealSlot, Math.floor(limit / 3));

    const carts = [];

    for (const row of twos) {
        carts.push({
            source: 'platform',
            restaurantId: row.restaurant_id,
            restaurant: {
                id: row.restaurant_id,
                name: row.restaurant_name,
                rating: row.restaurant_rating,
                deliveryTime: row.delivery_time_min,
                cuisine: row.cuisine,
                image: row.restaurant_image,
            },
            items: [
                { id: row.item1_id, name: row.item1_name, price: row.item1_price, is_veg: row.item1_veg, dish_family_id: row.item1_family, rating: row.item1_rating, orderCount: row.item1_orders, image: row.item1_image },
                { id: row.item2_id, name: row.item2_name, price: row.item2_price, is_veg: row.item2_veg, dish_family_id: row.item2_family, rating: row.item2_rating, orderCount: row.item2_orders, image: row.item2_image },
            ],
            frequency: row.cart_frequency,
        });
    }

    for (const row of singles) {
        carts.push({
            source: 'platform',
            restaurantId: row.restaurant_id,
            restaurant: {
                id: row.restaurant_id,
                name: row.restaurant_name,
                rating: row.restaurant_rating,
                deliveryTime: row.delivery_time_min,
                cuisine: row.cuisine,
                image: row.restaurant_image,
            },
            items: [
                { id: row.item1_id, name: row.item1_name, price: row.item1_price, is_veg: row.item1_veg, dish_family_id: row.item1_family, rating: row.item1_rating, orderCount: row.item1_orders, image: row.item1_image },
            ],
            frequency: row.cart_frequency,
        });
    }

    return carts;
}

/**
 * Retrieve carts from user's own order history + cross-sell augmentation
 */
export function getUserHistoryCarts(userId, mealSlot, limit = 30) {
    const db = getDb();

    // Get user's past orders for this meal slot (and all slots for cross-sell)
    const userOrders = db.prepare(`
    SELECT
      o.restaurant_id,
      r.name as restaurant_name,
      r.rating as restaurant_rating,
      r.delivery_time_min,
      r.cuisine,
      r.image_url as restaurant_image,
      GROUP_CONCAT(oi.menu_item_id) as item_ids,
      o.meal_slot,
      o.created_at
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ?
  `).all(userId, limit);

    const carts = [];
    const seenKeys = new Set();

    for (const order of userOrders) {
        const itemIds = order.item_ids.split(',').map(Number);

        // Fetch full item details
        const items = db.prepare(`
      SELECT id, name, price, is_veg, dish_family_id, rating, order_count, image_url as image
      FROM menu_items
      WHERE id IN (${itemIds.map(() => '?').join(',')}) AND is_available = 1
    `).all(...itemIds);

        if (items.length === 0) continue;

        // Build carts from user's actual orders
        if (items.length <= 2) {
            const key = items.map(i => i.id).sort().join('-');
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                carts.push({
                    source: 'history',
                    restaurantId: order.restaurant_id,
                    restaurant: {
                        id: order.restaurant_id,
                        name: order.restaurant_name,
                        rating: order.restaurant_rating,
                        deliveryTime: order.delivery_time_min,
                        cuisine: order.cuisine,
                        image: order.restaurant_image,
                    },
                    items,
                    frequency: 1,
                    isFromHistory: true,
                    mealSlotMatch: order.meal_slot === mealSlot,
                });
            }
        }

        // Cross-sell: for each item the user has ordered, find popular companions
        // from the same restaurant (mimicking Swiggy's cross-sell model)
        if (items.length === 1) {
            const companions = db.prepare(`
        SELECT DISTINCT m.id, m.name, m.price, m.is_veg, m.dish_family_id, m.rating, m.order_count, m.image_url as image
        FROM order_items oi
        JOIN orders o2 ON o2.id = oi.order_id
        JOIN menu_items m ON m.id = oi.menu_item_id AND m.is_available = 1
        WHERE o2.restaurant_id = ? AND m.id != ? AND o2.meal_slot = ?
        ORDER BY m.order_count DESC
        LIMIT 3
      `).all(order.restaurant_id, items[0].id, mealSlot);

            for (const comp of companions) {
                const key = [items[0].id, comp.id].sort().join('-');
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    carts.push({
                        source: 'cross-sell',
                        restaurantId: order.restaurant_id,
                        restaurant: {
                            id: order.restaurant_id,
                            name: order.restaurant_name,
                            rating: order.restaurant_rating,
                            deliveryTime: order.delivery_time_min,
                            cuisine: order.cuisine,
                            image: order.restaurant_image,
                        },
                        items: [items[0], comp],
                        frequency: 1,
                        isFromHistory: true,
                    });
                }
            }
        }
    }

    return carts;
}
