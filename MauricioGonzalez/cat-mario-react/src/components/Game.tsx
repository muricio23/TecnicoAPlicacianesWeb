import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { config } from '../game/config';

const Game: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current === null) {
            gameRef.current = new Phaser.Game(config);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '800px', height: '600px' }}>
            <div id="phaser-game" style={{ width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                textShadow: '2px 2px 4px #000000',
                pointerEvents: 'none',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                Controls: Arrows to Move, Space to Jump
            </div>
        </div>
    );
};

export default Game;
