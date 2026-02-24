import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import MealSlotSelector from './components/MealSlotSelector.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import SkeletonLoader from './components/SkeletonLoader.jsx';
import CartBar from './components/CartBar.jsx';
import { useRecommendations } from './hooks/useRecommendations.js';
import { useCart } from './hooks/useCart.js';
import { getUsers } from './utils/api.js';

function getDefaultMealSlot() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'snacks';
    return 'dinner';
}

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [mealSlot, setMealSlot] = useState(getDefaultMealSlot());
    const [initialLoad, setInitialLoad] = useState(true);

    // Load first user on mount
    useEffect(() => {
        getUsers()
            .then((users) => {
                if (users.length > 0) {
                    setCurrentUser(users[0]);
                    setInitialLoad(false);
                }
            })
            .catch(console.error);
    }, []);

    const { data, loading, error, refetch } = useRecommendations(
        currentUser?.id,
        mealSlot
    );
    const { cart, addToCart, clearCart, isAdded } = useCart(currentUser?.id);

    const recommendations = data?.recommendations || [];
    const meta = data?.meta || {};

    if (initialLoad) {
        return (
            <div className="app">
                <div style={{ padding: '24px' }}>
                    <SkeletonLoader count={4} />
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Header
                currentUser={currentUser}
                onUserChange={(user) => setCurrentUser(user)}
            />

            {/* Hero Section */}
            <div className="hero">
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    <span>AI-Powered</span>
                </div>
                <h1>
                    We know what you<br />
                    <span>want to eat</span> 🧠
                </h1>
                <p>
                    Personalized meal suggestions curated from your order history, food preferences, and what's trending around you.
                </p>
            </div>

            {/* Meal Slot Selector */}
            <MealSlotSelector
                activeSlot={mealSlot}
                onSlotChange={setMealSlot}
            />

            {/* Recommendations */}
            <div className="recommendations-section">
                <div className="section-header">
                    <span className="section-title">Suggested for you</span>
                    {meta.latency && (
                        <div className="section-meta">
                            <span className="latency-badge">
                                <span className="latency-badge-dot" />
                                {meta.cacheHit
                                    ? `${meta.totalApiLatency}ms cached`
                                    : `${meta.totalApiLatency}ms`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {loading && !recommendations.length ? (
                    <SkeletonLoader count={4} />
                ) : error && !recommendations.length ? (
                    <div className="error-state">
                        <div className="error-state-title">Something went wrong</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                            {error}
                        </p>
                        <button className="retry-btn" onClick={refetch}>
                            Try Again
                        </button>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-emoji">🔍</div>
                        <div className="empty-state-title">No suggestions yet</div>
                        <div className="empty-state-text">
                            We're still learning your preferences. Try a different meal slot!
                        </div>
                    </div>
                ) : (
                    <div className="rec-cards">
                        {recommendations.map((rec, index) => (
                            <RecommendationCard
                                key={`${rec.restaurant.id}-${rec.items.map(i => i.id).join('-')}`}
                                recommendation={rec}
                                onAddToCart={addToCart}
                                isAdded={isAdded(rec)}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Bar */}
            <CartBar cart={cart} onClear={clearCart} />
        </div>
    );
}
