import React from 'react';
import './HUD.css';

export function HUD({ health, ammo, armor }) {
    return (
        <div className="hud-container">
            <div className="hud-section">
                <span className="hud-label">AMMO</span>
                <span className="hud-value">{ammo}</span>
            </div>
            <div className="hud-section">
                <span className="hud-label">HEALTH</span>
                <span className="hud-value">{health}%</span>
            </div>
            <div className="hud-face">
                <img src="/doomguy_face.png" alt="Doomguy" />
            </div>
            <div className="hud-section">
                <span className="hud-label">ARMOR</span>
                <span className="hud-value">{armor}%</span>
            </div>
        </div>
    );
}
