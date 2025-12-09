import React, { useRef, useEffect } from 'react';
import { Game } from '../engine/Game';

export function GameCanvas({ onStatsUpdate, isGameOver }) {
    const canvasRef = useRef(null);
    const gameRef = useRef(new Game());

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let frameCount = 0;

        let lastTime = performance.now();

        const render = (time) => {
            if (isGameOver) return; // Stop loop if game over

            if (!time) time = performance.now();
            const deltaTime = (time - lastTime) / 1000; // Seconds
            lastTime = time;

            gameRef.current.update(deltaTime);
            gameRef.current.render(ctx, canvas.width, canvas.height);

            // Update stats every 10 frames to avoid excessive React re-renders
            if (frameCount % 10 === 0 && onStatsUpdate) {
                const player = gameRef.current.player;
                onStatsUpdate({
                    health: player.health,
                    ammo: player.ammo,
                    armor: player.armor
                });
            }
            frameCount++;

            animationFrameId = window.requestAnimationFrame(render);
        };

        if (!isGameOver) {
            animationFrameId = window.requestAnimationFrame(render);
        }

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [onStatsUpdate, isGameOver]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            if (e.code === 'ArrowUp' || e.code === 'KeyW') gameRef.current.player.walkDirection = 1;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') gameRef.current.player.walkDirection = -1;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') gameRef.current.player.turnDirection = 1;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameRef.current.player.turnDirection = -1;
            if (e.code === 'Space' || e.code === 'ControlLeft') gameRef.current.player.fire();
        };

        const handleKeyUp = (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') gameRef.current.player.walkDirection = 0;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') gameRef.current.player.walkDirection = 0;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') gameRef.current.player.turnDirection = 0;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameRef.current.player.turnDirection = 0;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return <canvas ref={canvasRef} width={640} height={400} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />;
}
