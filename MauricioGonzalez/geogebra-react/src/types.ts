export type Point = {
    x: number;
    y: number;
};

export type GeometricObject =
    | { type: 'point'; id: string; x: number; y: number; label: string; color: string }
    | { type: 'line'; id: string; p1Id: string; p2Id: string; label: string; color: string }
    | { type: 'circle'; id: string; centerId: string; pointId: string; label: string; color: string };

export type Tool = 'select' | 'point' | 'line' | 'circle' | 'move';
