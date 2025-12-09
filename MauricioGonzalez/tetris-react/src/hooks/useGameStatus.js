import { useState, useEffect, useCallback } from 'react';

export const useGameStatus = (rowsCleared) => {
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);

    useEffect(() => {
        if (rowsCleared > 0) {
            setScore((prev) => prev + rowsCleared * 10 * (level + 1)); // Simple scoring
            setRows((prev) => prev + rowsCleared);
            setLevel((prev) => prev + Math.floor(rowsCleared / 10)); // Increase level every 10 rows
        }
    }, [rowsCleared, level]);

    return [score, setScore, rows, setRows, level, setLevel];
};
