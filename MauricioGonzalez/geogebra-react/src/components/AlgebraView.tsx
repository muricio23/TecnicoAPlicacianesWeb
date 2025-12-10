import React from 'react';
import { useStore } from '../store/useStore';

import { GeometricObject } from '../types';

const ObjectItem: React.FC<{ object: GeometricObject }> = ({ object }) => {
    let description = '';
    switch (object.type) {
        case 'point':
            description = `(${object.x.toFixed(2)}, ${object.y.toFixed(2)})`;
            break;
        case 'line':
            description = `Line(${object.p1Id}, ${object.p2Id})`;
            break;
        case 'circle':
            description = `Circle(${object.centerId}, ${object.pointId})`;
            break;
    }

    return (
        <div className="p-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer group">
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: object.color }}
                />
                <span className="font-medium text-gray-700">{object.label}</span>
                <span className="text-gray-400 text-xs">=</span>
                <span className="text-gray-600 text-sm font-mono">{description}</span>
            </div>
        </div>
    );
};

export const AlgebraView: React.FC = () => {
    const { objects } = useStore();

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
            <div className="h-10 border-b border-gray-100 flex items-center px-4 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Algebra</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {objects.length === 0 ? (
                    <div className="text-center mt-10 text-gray-400 text-sm">
                        No objects created
                    </div>
                ) : (
                    objects.map((obj) => <ObjectItem key={obj.id} object={obj} />)
                )}
            </div>
        </div>
    );
};
