import React, { useState, useEffect, useRef } from 'react';
import { getUsers } from '../utils/api';

export default function Header({ currentUser, onUserChange }) {
    const [users, setUsers] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        getUsers().then(setUsers).catch(console.error);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const initials = currentUser
        ? currentUser.name.split(' ').map(n => n[0]).join('')
        : '?';

    const dietLabel = (score) => {
        if (score >= 0.9) return 'Pure Veg';
        if (score >= 0.7) return 'Mostly Veg';
        if (score >= 0.4) return 'Mixed';
        return 'Non-Veg';
    };

    return (
        <header className="header">
            <div className="header-top">
                <div className="header-location">
                    <div className="header-location-icon">📍</div>
                    <div className="header-location-text">
                        <span className="header-location-label">Deliver to</span>
                        <span className="header-location-name">
                            {currentUser?.area || 'Koramangala'} ▾
                        </span>
                    </div>
                </div>

                <div className="user-selector" ref={dropdownRef}>
                    <div
                        className="header-avatar"
                        onClick={() => setDropdownOpen(prev => !prev)}
                        title={currentUser?.name || 'Select user'}
                    >
                        {initials}
                    </div>

                    {dropdownOpen && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-title">Switch User (Demo)</div>
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className={`user-dropdown-item ${currentUser?.id === user.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onUserChange(user);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <div className="user-dropdown-item-avatar">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="user-dropdown-item-info">
                                        <span className="user-dropdown-item-name">{user.name}</span>
                                        <span className="user-dropdown-item-diet">
                                            {dietLabel(user.vegnessScore)} • {user.area}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
