import { Router } from 'express';
import { getDb } from '../db/connection.js';

const router = Router();

// In-memory cart store (in production would be Redis/DB)
const activeCarts = new Map();

/**
 * POST /api/cart/add
 * Body: { userId, items: [{ id, name, price, restaurantId, restaurantName }] }
 */
router.post('/add', (req, res) => {
    const { userId, items, restaurant } = req.body;

    if (!userId || !items || !items.length) {
        return res.status(400).json({ error: 'userId and items are required' });
    }

    let cart = activeCarts.get(userId) || { userId, items: [], restaurant: null, totalPrice: 0 };

    // If switching restaurants, clear cart
    if (restaurant && cart.restaurant && cart.restaurant.id !== restaurant.id) {
        cart = { userId, items: [], restaurant: null, totalPrice: 0 };
    }

    cart.restaurant = restaurant;
    cart.items.push(...items);
    cart.totalPrice = cart.items.reduce((s, i) => s + i.price, 0);
    cart.updatedAt = new Date().toISOString();

    activeCarts.set(userId, cart);

    res.json({ cart, message: 'Items added to cart' });
});

/**
 * GET /api/cart/:userId
 */
router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const cart = activeCarts.get(userId) || { userId, items: [], restaurant: null, totalPrice: 0 };
    res.json({ cart });
});

/**
 * DELETE /api/cart/:userId
 */
router.delete('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    activeCarts.delete(userId);
    res.json({ message: 'Cart cleared' });
});

export default router;
