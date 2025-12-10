import { create } from 'zustand';
import { GeometricObject, Tool } from '../types';

interface AppState {
    objects: GeometricObject[];
    tool: Tool;
    selectedIds: string[];
    scale: number;
    offset: { x: number; y: number };
    setTool: (tool: Tool) => void;
    addObject: (object: GeometricObject) => void;
    updateObject: (id: string, updates: Partial<GeometricObject>) => void;
    setSelection: (ids: string[]) => void;
    setScale: (scale: number) => void;
    setOffset: (offset: { x: number; y: number }) => void;
}

export const useStore = create<AppState>((set) => ({
    objects: [],
    tool: 'select',
    selectedIds: [],
    scale: 50, // pixels per unit
    offset: { x: 0, y: 0 },
    setTool: (tool) => set({ tool }),
    addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
    updateObject: (id, updates) =>
        set((state) => ({
            objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...updates } as GeometricObject : obj)),
        })),
    setSelection: (ids) => set({ selectedIds: ids }),
    setScale: (scale) => set({ scale }),
    setOffset: (offset) => set({ offset }),
}));
