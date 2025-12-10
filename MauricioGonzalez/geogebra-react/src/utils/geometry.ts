import { Point } from '../types';

export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const screenToWorld = (
    screenX: number,
    screenY: number,
    scale: number,
    offsetX: number,
    offsetY: number
): Point => {
    const x = (screenX - offsetX) / scale;
    // In math, Y grows upwards, in canvas Y grows downwards.
    const y = -(screenY - offsetY) / scale;
    return { x, y };
};

export const worldToScreen = (
    worldX: number,
    worldY: number,
    scale: number,
    offsetX: number,
    offsetY: number
): Point => {
    const x = worldX * scale + offsetX;
    const y = -worldY * scale + offsetY;
    return { x, y };
};
