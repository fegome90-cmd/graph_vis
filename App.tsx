

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { ForceGraph } from './components/ForceGraph';
import { mockNodes, NodeData, mockLinks } from './constants';

const App: React.FC = () => {
    
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <div className="flex grow overflow-hidden">
                <LeftSidebar />
                <main className="flex-1 flex flex-col bg-zinc-100 dark:bg-black/40 overflow-hidden relative">
                    <div className="p-6 border-b border-solid border-white/10">
                        <div className="flex min-w-72 flex-col gap-2">
                            <p className="text-black dark:text-white tracking-light text-[32px] font-bold leading-tight">Pull Request Impact Analysis</p>
                            <p className="text-black/60 dark:text-white/60 text-sm font-normal leading-normal">Showing dependencies for PR #12345</p>
                        </div>
                    </div>
                    <div className="flex-1 p-6 relative">
                        <ForceGraph 
                            nodes={mockNodes} 
                            links={mockLinks} 
                        />
                    </div>
                </main>
                <RightSidebar />
            </div>
        </div>
    );
};

export default App;