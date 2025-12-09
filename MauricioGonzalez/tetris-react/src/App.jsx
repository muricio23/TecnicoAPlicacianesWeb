import React, { useState, useRef } from 'react';

import { createStage, checkCollision } from './utils/gameHelpers';

// Custom Hooks
import { useInterval } from './hooks/useInterval';
import { usePlayer } from './hooks/usePlayer';
import { useStage } from './hooks/useStage';
import { useGameStatus } from './hooks/useGameStatus';

// Components
import Stage from './components/Stage';
import Display from './components/Display';
import StartButton from './components/StartButton';

const App = () => {
  const gameArea = useRef(null);
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(
    rowsCleared
  );

  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    gameArea.current.focus();
  };

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        console.log('GAME OVER!!!');
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = (e) => {
    if (!gameOver) {
      if (e.keyCode === 37) {
        e.preventDefault();
        movePlayer(-1);
      } else if (e.keyCode === 39) {
        e.preventDefault();
        movePlayer(1);
      } else if (e.keyCode === 40) {
        e.preventDefault();
        dropPlayer();
      } else if (e.keyCode === 38) {
        e.preventDefault();
        playerRotate(stage, 1);
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyDown={(e) => move(e)}
      onKeyUp={keyUp}
      ref={gameArea}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'url(https://raw.githubusercontent.com/weibenfalk/react-tetris/master/src/img/bg.png) #000',
        backgroundSize: 'cover',
        overflow: 'hidden',
        outline: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '50px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '40px',
          margin: '0 auto',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        <Stage stage={stage} />
        <aside
          style={{
            width: '100%',
            maxWidth: '200px',
            display: 'block',
            padding: '0 20px',
          }}
        >
          {gameOver ? (
            <Display gameOver={gameOver} text="Game Over" />
          ) : (
            <div>
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Level: ${level}`} />
            </div>
          )}
          <StartButton callback={startGame} />
          <div style={{ color: 'white', fontFamily: 'Pixel, Arial, Helvetica, sans-serif', fontSize: '0.8rem', marginTop: '20px' }}>
            <p>Controls:</p>
            <p>⬅️ Left</p>
            <p>➡️ Right</p>
            <p>⬇️ Drop</p>
            <p>⬆️ Rotate</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
