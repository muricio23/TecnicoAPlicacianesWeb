import React from 'react';
import { Toolbar } from './Toolbar';
import { AlgebraView } from './AlgebraView';
import { GraphicsView } from './GraphicsView';

export const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
            <Toolbar />
            <div className="flex flex-1 overflow-hidden">
                <AlgebraView />
                <GraphicsView />
            </div>
        </div>
    );
};
