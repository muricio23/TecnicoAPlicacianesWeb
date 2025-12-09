import React from 'react';

const Display = ({ gameOver, text }) => (
    <div
        style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 20px 0',
            padding: '20px',
            border: '4px solid #333',
            minHeight: '30px',
            width: '100%',
            borderRadius: '20px',
            color: `${gameOver ? 'red' : '#999'}`,
            background: '#000',
            fontFamily: 'Pixel, Arial, Helvetica, sans-serif',
            fontSize: '0.8rem',
        }}
    >
        {text}
    </div>
);

export default Display;
