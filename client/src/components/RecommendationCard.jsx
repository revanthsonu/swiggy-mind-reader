import React from 'react';

const CUISINE_EMOJI = {
    'Mughlai': '🍖',
    'Andhra': '🌶️',
    'Hyderabadi': '🍚',
    'South Indian': '🥘',
    'Continental': '🍽️',
    'North Indian': '🍛',
    'Fast Food': '🍔',
    'Cafe': '☕',
    'Chinese': '🥡',
    'Italian': '🍕',
    'Multi-Cuisine': '🍱',
    'Healthy': '🥗',
    'Snacks': '🍿',
    'Mexican': '🌮',
};

export default function RecommendationCard({ recommendation, onAddToCart, isAdded, index }) {
    const { restaurant, items, totalPrice, score, source, isPersonalized } = recommendation;
    const emoji = CUISINE_EMOJI[restaurant.cuisine] || '🍽️';

    return (
        <div
            className="rec-card"
            style={{ animationDelay: `${0.05 * index}s` }}
        >
            {/* Header */}
            <div className="rec-card-header">
                <div className="rec-restaurant">
                    <div className="rec-restaurant-logo">{emoji}</div>
                    <div className="rec-restaurant-info">
                        <div className="rec-restaurant-name">{restaurant.name}</div>
                        <div className="rec-restaurant-meta">
                            <span className="rec-restaurant-rating">
                                ★ {restaurant.rating}
                            </span>
                            <span>•</span>
                            <span>{restaurant.deliveryTime} min</span>
                            <span>•</span>
                            <span>{restaurant.cuisine}</span>
                        </div>
                    </div>
                </div>
                <span className={`rec-score-badge ${isPersonalized ? 'rec-personalized-badge' : ''}`}>
                    {isPersonalized ? '✨ For You' : `${Math.round(score * 100)}%`}
                </span>
            </div>

            {/* Items */}
            <div className="rec-items">
                {items.map((item) => (
                    <div key={item.id} className="rec-item">
                        <div className="rec-item-left">
                            <div className={`veg-badge ${item.isVeg ? '' : 'non-veg'}`}>
                                <div className="veg-badge-dot" />
                            </div>
                            <span className="rec-item-name">{item.name}</span>
                        </div>
                        <span className="rec-item-price">₹{item.price}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="rec-card-footer">
                <div className="rec-total">
                    <span className="rec-total-label">Total</span>
                    <span className="rec-total-price">₹{totalPrice}</span>
                </div>
                <button
                    className={`add-btn ${isAdded ? 'added' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAdded) onAddToCart(recommendation);
                    }}
                    disabled={isAdded}
                >
                    {isAdded ? (
                        <>✓ Added</>
                    ) : (
                        <>+ Add</>
                    )}
                </button>
            </div>
        </div>
    );
}
