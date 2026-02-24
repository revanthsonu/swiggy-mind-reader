import React from 'react';

export default function CartBar({ cart, onClear }) {
    if (!cart.items.length) return null;

    const itemCount = cart.items.length;
    const itemText = itemCount === 1 ? '1 item' : `${itemCount} items`;

    return (
        <div className="cart-bar">
            <div className="cart-bar-inner">
                <div className="cart-bar-left">
                    <span className="cart-bar-items">{itemText} | ₹{cart.totalPrice}</span>
                    <span className="cart-bar-restaurant">
                        From {cart.restaurant?.name || 'Restaurant'}
                    </span>
                </div>
                <div className="cart-bar-right" onClick={onClear} title="View cart">
                    <span>View Cart</span>
                    <span className="cart-bar-arrow">→</span>
                </div>
            </div>
        </div>
    );
}
