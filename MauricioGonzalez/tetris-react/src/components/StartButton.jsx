import React from 'react';

const StartButton = ({ callback }) => (
    <button
        onClick={callback}
        style={{
            boxSizing: 'border-box',
            margin: '0 0 20px 0',
            padding: '20px',
            minHeight: '30px',
            width: '100%',
            borderRadius: '20px',
            border: 'none',
            color: 'white',
            background: '#333',
            fontFamily: 'Pixel, Arial, Helvetica, sans-serif',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer',
        }}
    >
        Start Game
    </button>
);

export default StartButton;
