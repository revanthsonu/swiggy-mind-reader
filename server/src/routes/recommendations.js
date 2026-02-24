import { Router } from 'express';
import { generateRecommendations } from '../engine/recommender.js';
import { getCached, setCache } from '../cache/redis.js';
import { getDb } from '../db/connection.js';

const router = Router();

/**
 * GET /api/recommendations
 * Query params:
 *   - userId (required)
 *   - mealSlot (optional, auto-detected from time of day)
 *
 * Response: { recommendations: [...], meta: { latency, cacheHit, ... } }
 */
router.get('/', async (req, res) => {
    const t0 = performance.now();

    const userId = parseInt(req.query.userId);
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    // Auto-detect meal slot from time of day if not provided
    let mealSlot = req.query.mealSlot;
    if (!mealSlot) {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) mealSlot = 'breakfast';
        else if (hour >= 11 && hour < 15) mealSlot = 'lunch';
        else if (hour >= 15 && hour < 18) mealSlot = 'snacks';
        else mealSlot = 'dinner';
    }

    // Try cache first (target: <20ms)
    const cached = await getCached(userId, mealSlot);
    if (cached) {
        const totalLatency = Math.round(performance.now() - t0);
        return res.json({
            ...cached.data,
            meta: {
                ...cached.data.meta,
                cacheHit: true,
                cacheLatency: cached.cacheLatency,
                totalApiLatency: totalLatency,
            },
        });
    }

    // Cache miss — compute in real time (target: <200ms)
    const result = generateRecommendations(userId, mealSlot);

    // Write to cache asynchronously (don't block response)
    setCache(userId, mealSlot, result).catch(() => { });

    const totalLatency = Math.round(performance.now() - t0);

    res.json({
        ...result,
        meta: {
            ...result.meta,
            cacheHit: false,
            totalApiLatency: totalLatency,
        },
    });
});

/**
 * GET /api/recommendations/users
 * Returns list of available users for the demo
 */
router.get('/users', (req, res) => {
    const db = getDb();
    const users = db.prepare(`
    SELECT id, name, vegness_score as vegnessScore, preferred_cuisines as preferredCuisines, area
    FROM users
  `).all();

    res.json(users.map(u => ({
        ...u,
        preferredCuisines: JSON.parse(u.preferredCuisines || '[]'),
    })));
});

export default router;
