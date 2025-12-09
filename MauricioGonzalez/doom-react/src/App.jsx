import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import './App.css';

function App() {
  const [stats, setStats] = useState({ health: 100, ammo: 50, armor: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Key to force remount

  const handleStatsUpdate = useCallback((newStats) => {
    setStats(newStats);
    if (newStats.health <= 0) {
      setIsGameOver(true);
    }
  }, []);

  const handleRestart = () => {
    setIsGameOver(false);
    setStats({ health: 100, ammo: 50, armor: 0 });
    setGameKey(prev => prev + 1); // Remount GameCanvas to reset game
  };

  return (
    <div className="App">
      <h1>Doom React Port</h1>
      <div className="game-wrapper">
        <div className="game-container" style={{ position: 'relative' }}>
          <GameCanvas key={gameKey} onStatsUpdate={handleStatsUpdate} isGameOver={isGameOver} />

          {isGameOver && (
            <div className="game-over-overlay">
              <h2>GAME OVER</h2>
              <button onClick={handleRestart}>Reiniciar</button>
            </div>
          )}
        </div>
        <HUD health={stats.health} ammo={stats.ammo} armor={stats.armor} />
      </div>
      <p>Use WASD or Arrow Keys to move.</p>
    </div>
  );
}

export default App;
