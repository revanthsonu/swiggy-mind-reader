import React from 'react';

const SLOTS = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '☀️' },
    { id: 'snacks', label: 'Snacks', emoji: '🍿' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
];

export default function MealSlotSelector({ activeSlot, onSlotChange }) {
    return (
        <div className="meal-slots">
            <div className="meal-slots-container">
                {SLOTS.map((slot) => (
                    <button
                        key={slot.id}
                        className={`meal-slot-btn ${activeSlot === slot.id ? 'active' : ''}`}
                        onClick={() => onSlotChange(slot.id)}
                    >
                        <span className="slot-emoji">{slot.emoji}</span>
                        <span>{slot.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
