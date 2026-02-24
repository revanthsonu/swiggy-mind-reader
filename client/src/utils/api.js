const API_BASE = '/api';

// Detect if we're running in static mode (Vercel) or dev mode (local with backend)
let staticData = null;
let staticUsers = null;

async function loadStaticData() {
    if (staticData !== null) return; // already loaded or attempted
    try {
        const [recsRes, usersRes] = await Promise.all([
            fetch('/data/recommendations.json'),
            fetch('/data/users.json'),
        ]);
        if (recsRes.ok && usersRes.ok) {
            staticData = await recsRes.json();
            staticUsers = await usersRes.json();
        } else {
            staticData = false; // not available, use API
        }
    } catch {
        staticData = false;
    }
}

function isStaticMode() {
    return staticData && staticData !== false;
}

// Simple in-memory response cache for stale-while-revalidate
const responseCache = new Map();
const CACHE_TTL = 60_000;
const inflightRequests = new Map();

async function fetchWithCache(url) {
    const cached = responseCache.get(url);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    if (inflightRequests.has(url)) return inflightRequests.get(url);

    const promise = fetch(url)
        .then(async (res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            responseCache.set(url, { data, ts: Date.now() });
            inflightRequests.delete(url);
            return data;
        })
        .catch((err) => { inflightRequests.delete(url); throw err; });

    inflightRequests.set(url, promise);
    return promise;
}

export async function getRecommendations(userId, mealSlot) {
    await loadStaticData();
    if (isStaticMode()) {
        const userRecs = staticData[userId];
        if (userRecs && userRecs[mealSlot]) {
            return {
                ...userRecs[mealSlot],
                meta: { ...userRecs[mealSlot].meta, cacheHit: true, totalApiLatency: 0 },
            };
        }
        return { recommendations: [], meta: { cacheHit: true, totalApiLatency: 0 } };
    }
    return fetchWithCache(`${API_BASE}/recommendations?userId=${userId}&mealSlot=${mealSlot}`);
}

export async function getUsers() {
    await loadStaticData();
    if (isStaticMode()) return staticUsers;
    return fetchWithCache(`${API_BASE}/recommendations/users`);
}

// In-memory cart (works in both modes)
const localCart = { items: [], restaurant: null, totalPrice: 0 };

export async function addToCart(userId, items, restaurant) {
    if (isStaticMode()) {
        if (localCart.restaurant && localCart.restaurant.id !== restaurant.id) {
            localCart.items = [];
        }
        localCart.restaurant = restaurant;
        localCart.items.push(...items);
        localCart.totalPrice = localCart.items.reduce((s, i) => s + i.price, 0);
        return { cart: { ...localCart } };
    }
    const res = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items, restaurant }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export async function getCart(userId) {
    if (isStaticMode()) return { cart: { ...localCart } };
    return fetchWithCache(`${API_BASE}/cart/${userId}`);
}

export async function clearCart(userId) {
    if (isStaticMode()) {
        localCart.items = [];
        localCart.restaurant = null;
        localCart.totalPrice = 0;
        return { message: 'Cart cleared' };
    }
    responseCache.delete(`${API_BASE}/cart/${userId}`);
    const res = await fetch(`${API_BASE}/cart/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export function invalidateRecommendations() {
    for (const key of responseCache.keys()) {
        if (key.includes('/recommendations?')) responseCache.delete(key);
    }
}
