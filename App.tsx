


import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { ForceGraph } from './components/ForceGraph';
import { mockNodes, mockLinks } from './constants';
import { NodeData } from './types';

const App: React.FC = () => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const handleNodeClick = (nodeId: string | null) => {
        setSelectedNodeId(nodeId);
    };

    const selectedNode = selectedNodeId ? mockNodes.find(n => n.id === selectedNodeId) || null : null;
    
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <div className="flex grow overflow-hidden">
                <LeftSidebar />
                <main className="flex-1 flex flex-col bg-zinc-100 dark:bg-black/40 overflow-hidden relative">
                    <div className="p-6 border-b border-solid border-white/10">
                        <div className="flex min-w-72 flex-col gap-2">
                            <p className="text-black dark:text-white tracking-light text-[32px] font-bold leading-tight">System Dependency Graph</p>
                            <p className="text-black/60 dark:text-white/60 text-sm font-normal leading-normal">Visualizing component interactions and hotspots</p>
                        </div>
                    </div>
                    <div className="flex-1 p-6 relative">
                        <ForceGraph 
                            nodes={mockNodes} 
                            links={mockLinks} 
                            selectedNodeId={selectedNodeId}
                            onNodeClick={handleNodeClick}
                        />
                    </div>
                </main>
                <RightSidebar node={selectedNode} />
            </div>
        </div>
    );
};

export default App;