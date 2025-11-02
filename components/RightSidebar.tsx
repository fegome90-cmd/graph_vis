import React from 'react';
import { NodeData } from '../types';

interface RightSidebarProps {
    node: NodeData | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ node }) => {
    return (
        <aside className="w-96 shrink-0 border-l border-white/10 bg-background-light dark:bg-background-dark flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-black dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Context Details</h2>
                <p className="text-sm text-black/60 dark:text-white/60">
                    {node ? `Details for '${node.name}'` : 'Select a node to see more information.'}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {node ? (
                    <div className="flex flex-col gap-4 text-sm">
                        <div>
                            <h3 className="font-bold text-black/80 dark:text-white/80">Name</h3>
                            <p className="text-black dark:text-white">{node.name}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-black/80 dark:text-white/80">Type</h3>
                            <p className="text-black dark:text-white capitalize">{node.type}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-black/80 dark:text-white/80">Importance</h3>
                            <div className="flex items-center gap-2">
                               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${node.importance * 10}%` }}></div>
                                </div>
                                <span className="font-bold text-black dark:text-white">{node.importance} / 10</span>
                            </div>
                        </div>
                        {node.isHotspot && (
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <h3 className="font-bold text-red-500 dark:text-red-400">Hotspot Detected</h3>
                                <p className="text-red-700 dark:text-red-300 text-xs">This component has high churn and complexity. Consider reviewing it for refactoring.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-black/60 dark:text-white/60">
                         <span className="material-symbols-outlined text-5xl mb-4">bubble_chart</span>
                        <p>No node selected</p>
                        <p className="text-xs mt-1">Click on a file, function, or class in the graph to view its details here.</p>
                    </div>
                )}
            </div>
        </aside>
    );
};
