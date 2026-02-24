import React from 'react';

export default function SkeletonLoader({ count = 3 }) {
    return (
        <div className="rec-cards">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="skeleton-header">
                        <div className="skeleton-avatar" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="skeleton-line w-60 h-md" />
                            <div className="skeleton-line w-40" />
                        </div>
                    </div>
                    <div className="skeleton-items">
                        <div className="skeleton-line w-full h-lg" />
                        <div className="skeleton-line w-full h-lg" />
                    </div>
                    <div className="skeleton-footer">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="skeleton-line w-40" />
                            <div className="skeleton-line w-60 h-md" />
                        </div>
                        <div className="skeleton-line h-lg" style={{ width: 80 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
