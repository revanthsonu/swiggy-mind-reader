import { useState, useCallback } from 'react';
import { addToCart as apiAddToCart, clearCart as apiClearCart } from '../utils/api';

export function useCart(userId) {
    const [cart, setCart] = useState({ items: [], restaurant: null, totalPrice: 0 });
    const [addedCartIds, setAddedCartIds] = useState(new Set());

    const addToCart = useCallback(async (recommendation) => {
        // Optimistic update
        const cartId = recommendation.items.map(i => i.id).join('-');
        setAddedCartIds(prev => new Set([...prev, cartId]));

        setCart(prev => {
            // If switching restaurants, start fresh
            if (prev.restaurant && prev.restaurant.id !== recommendation.restaurant.id) {
                return {
                    items: recommendation.items,
                    restaurant: recommendation.restaurant,
                    totalPrice: recommendation.totalPrice,
                };
            }
            return {
                items: [...prev.items, ...recommendation.items],
                restaurant: recommendation.restaurant,
                totalPrice: prev.totalPrice + recommendation.totalPrice,
            };
        });

        try {
            await apiAddToCart(userId, recommendation.items, recommendation.restaurant);
        } catch (err) {
            // Revert on error
            setAddedCartIds(prev => {
                const next = new Set(prev);
                next.delete(cartId);
                return next;
            });
            console.error('Failed to add to cart:', err);
        }
    }, [userId]);

    const clearCartState = useCallback(async () => {
        setCart({ items: [], restaurant: null, totalPrice: 0 });
        setAddedCartIds(new Set());
        try {
            await apiClearCart(userId);
        } catch (err) {
            console.error('Failed to clear cart:', err);
        }
    }, [userId]);

    const isAdded = useCallback((recommendation) => {
        const cartId = recommendation.items.map(i => i.id).join('-');
        return addedCartIds.has(cartId);
    }, [addedCartIds]);

    return { cart, addToCart, clearCart: clearCartState, isAdded };
}
