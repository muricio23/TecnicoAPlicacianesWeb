import React from 'react';
import { MousePointer2, Circle, Minus, Dot } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Tool } from '../types';
import clsx from 'clsx';

const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Move' },
    { id: 'point', icon: Dot, label: 'Point' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'circle', icon: Circle, label: 'Circle' },
];

export const Toolbar: React.FC = () => {
    const { tool, setTool } = useStore();

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shadow-sm z-10 relative">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        className={clsx(
                            'p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium',
                            tool === t.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        )}
                        title={t.label}
                    >
                        <t.icon size={20} />
                        <span className="hidden md:inline">{t.label}</span>
                    </button>
                ))}
            </div>
            <div className="ml-auto text-sm text-gray-500 font-medium">
                GeoGebra Clone
            </div>
        </div>
    );
};
