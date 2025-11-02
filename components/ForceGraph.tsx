import React, { useEffect, useRef, useMemo, useState } from 'react';
import cytoscape from 'cytoscape';
import { NodeData, LinkData } from '../types';

interface ForceGraphProps {
    nodes: NodeData[];
    links: LinkData[];
    selectedNodeId?: string | null;
    onNodeClick?: (nodeId: string | null) => void;
}

// --- Color and Style Constants ---
const nodeHeaderBgColor = '#e2e8f0'; // slate-200
const nodeBodyBgColor = '#f8fafc'; // slate-50
const nodeBorderColor = '#cbd5e1'; // slate-300
const nodeHotspotBorderColor = '#ef4444'; // red-500
const selectedNodeBorderColor = '#4f46e5'; // indigo-600
const nodeWidth = 160;
const nodeHeight = 60;

// --- Helper function to create SVG for nodes ---
// This function now only creates the background, icon, and status bar.
// Borders and labels are handled by Cytoscape styles for better performance and consistency.
const createNodeSvg = (node: NodeData): string => {
    const { type, importance } = node;
    const statusBarWidth = 6;
    const headerHeight = 24;
    const bodyHeight = nodeHeight - headerHeight;
    const statusBarHeight = bodyHeight - 16;
    const statusBarFillHeight = ((importance || 0) / 10) * statusBarHeight;
    
    // Color scale from green to yellow to red
    const getColor = (value: number) => {
        const h = (1 - value / 10) * 120;
        return `hsl(${h}, 80%, 50%)`;
    };
    const statusBarColor = getColor(importance);

    const iconPath = {
        file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
        function: 'M12.4 5H18a2 2 0 0 1 2 2v2h-2V7h-5.6l2.3 2.3-1.4 1.4-4-4 4-4 1.4 1.4L12.4 5zM6 15h5.6l-2.3-2.3 1.4-1.4 4 4-4 4-1.4-1.4L11.6 19H6a2 2 0 0 1-2-2v-2h2v2z',
        class: 'M6.1 14.6L1.5 12l4.6-2.6L8.5 12l-2.4 2.6zm11.8 0L22.5 12l-4.6-2.6L15.5 12l2.4 2.6zm-6.4-10.2L9.4 17.2l1.2 1.2 2.1-12.8-1.2-1.2z',
    };

    const hotspotIndicatorSvg = node.isHotspot
        ? `<circle cx="${nodeWidth - 12}" cy="12" r="5" fill="${nodeHotspotBorderColor}" stroke="#fff" stroke-width="1.5" />`
        : '';
    
    // Using a clipPath for robust rounded corners.
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${nodeWidth}" height="${nodeHeight}">
            <defs>
                <clipPath id="rounded-corners">
                    <rect x="0" y="0" width="${nodeWidth}" height="${nodeHeight}" rx="8" ry="8"/>
                </clipPath>
            </defs>
            <g clip-path="url(#rounded-corners)">
                <rect x="0" y="0" width="${nodeWidth}" height="${nodeHeight}" fill="${nodeBodyBgColor}"/>
                <rect x="0" y="0" width="${nodeWidth}" height="${headerHeight}" fill="${nodeHeaderBgColor}"/>
                
                <g transform="translate(8, 5)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#475569">
                        <path d="${iconPath[type]}"></path>
                    </svg>
                </g>
                
                <rect x="8" y="${headerHeight + 8}" width="${statusBarWidth}" height="${statusBarHeight}" fill="#e2e8f0" rx="3" ry="3"/>
                <rect x="8" y="${headerHeight + 8 + (statusBarHeight - statusBarFillHeight)}" width="${statusBarWidth}" height="${statusBarFillHeight}" fill="${statusBarColor}" rx="3" ry="3"/>
            </g>
            ${hotspotIndicatorSvg}
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Fix: Corrected cytoscape style type from Stylesheet to StylesheetCSS based on the error.
const graphStyles: cytoscape.StylesheetCSS[] = [
    {
        selector: 'node',
        style: {
            'shape': 'rectangle',
            'background-color': 'transparent',
            'background-image': 'data(svg)',
            'border-width': 2,
            'border-color': nodeBorderColor, // Default border color
            'width': nodeWidth,
            'height': nodeHeight,
            // Label styles - positioned carefully within the header
            'label': 'data(name)',
            'text-valign': 'top',
            'text-halign': 'left',
            'text-margin-x': 28, // Left padding (8px) + icon width (14px) + text padding (6px)
            'text-margin-y': 6,  // Vertical centering in header (height 24px, font 12px)
            'font-family': 'Space Grotesk, sans-serif',
            'font-size': '12px',
            'font-weight': '600',
            'color': '#1e293b',
            'text-max-width': 110, // Max width before truncating
            'text-overflow': 'ellipsis',
            'text-wrap': 'none',
            'transition-property': 'width, height, overlay-opacity, overlay-padding, border-color',
            'transition-duration': '0.2s',
            'overlay-color': selectedNodeBorderColor,
            'overlay-opacity': 0,
            'overlay-padding': 0,
        },
    },
    {
        selector: 'edge',
        style: {
            'width': 2.5,
            'line-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#94a3b8',
            'curve-style': 'bezier',
            'opacity': 0.7,
            'transition-property': 'opacity',
            'transition-duration': '0.2s',
        },
    },
    {
        selector: 'node:selected',
        style: {
            'border-color': selectedNodeBorderColor,
            'border-width': 4,
        }
    },
    {
        selector: '.hovered',
        style: {
            'width': nodeWidth * 1.05,
            'height': nodeHeight * 1.05,
            'overlay-opacity': 0.2,
            'overlay-padding': 8,
        }
    },
    {
        selector: '.grabbed',
        style: {
            'width': nodeWidth * 1.1,
            'height': nodeHeight * 1.1,
            'overlay-opacity': 0.5,
            'overlay-padding': 15,
        }
    },
    {
        selector: '.faded',
        style: {
            'opacity': 0.2,
        }
    },
     {
        selector: 'node[?isHotspot]',
        style: {
            'border-color': nodeHotspotBorderColor,
        },
    },
];

const GraphLegend: React.FC = () => (
    <div className="absolute bottom-4 left-4 z-10">
        <div className="p-4 rounded-xl border border-white/10 bg-background-dark/80 backdrop-blur-sm text-white shadow-lg w-64">
            <h4 className="font-bold mb-3 text-base">Graph Legend</h4>
            <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path></svg>
                    <span>File</span>
                </div>
                 <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.1 14.6L1.5 12l4.6-2.6L8.5 12l-2.4 2.6zm11.8 0L22.5 12l-4.6-2.6L15.5 12l2.4 2.6zm-6.4-10.2L9.4 17.2l1.2 1.2 2.1-12.8-1.2-1.2z"></path></svg>
                    <span>Class</span>
                </div>
                 <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.4 5H18a2 2 0 0 1 2 2v2h-2V7h-5.6l2.3 2.3-1.4 1.4-4-4 4-4 1.4 1.4L12.4 5zM6 15h5.6l-2.3-2.3 1.4-1.4 4 4-4 4-1.4-1.4L11.6 19H6a2 2 0 0 1-2-2v-2h2v2z"></path></svg>
                    <span>Function</span>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-red-500/50"></div>
                    <span>Hotspot</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-gradient-to-t from-green-500 to-red-500 rounded-full"></div>
                    <span className="text-xs">Importance</span>
                </div>
            </div>
        </div>
    </div>
);

const NodeDetailsPanel: React.FC<{ node: NodeData, onClose: () => void }> = ({ node, onClose }) => {
    return (
    <div 
        className="absolute z-20 w-80 rounded-xl border border-white/10 bg-background-dark/80 shadow-2xl backdrop-blur-sm top-4 left-4"
    >
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-white text-lg">{node.name}</h3>
                    <p className="text-sm text-white/70 capitalize">{node.type}</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
             <div className="mt-3 text-sm text-white/80 space-y-1">
                <p><span className="font-bold">Importance:</span> {node.importance}</p>
                {node.isHotspot && <p className="font-bold text-red-400">This is a hotspot!</p>}
            </div>
        </div>
    </div>
)};

export const ForceGraph: React.FC<ForceGraphProps> = ({ nodes, links, selectedNodeId, onNodeClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [isLegendVisible, setIsLegendVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Ref to hold the latest props, preventing stale closures in event handlers.
    const propsRef = useRef({ onNodeClick, selectedNodeId });
    propsRef.current = { onNodeClick, selectedNodeId };
    
    const elements = useMemo(() => {
        return {
            nodes: nodes.map(node => ({
                data: { ...node, svg: createNodeSvg(node) }
            })),
            edges: links.map(link => ({ data: { ...link } }))
        };
    }, [nodes, links]);

    const layoutConfig = useMemo(() => ({
        name: 'cose',
        animate: 'end' as const,
        padding: 100,
        nodeRepulsion: () => 4000,
        idealEdgeLength: () => 180,
        nodeOverlap: 25,
        gravity: 40,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
    }), []);

    const handleRefresh = () => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.layout(layoutConfig).run();
    };

    const handleToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    
    const handleToggleLegend = () => {
        setIsLegendVisible(!isLegendVisible);
    };

    // Effect for initializing and destroying the graph
    useEffect(() => {
        if (!containerRef.current) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements: elements,
            style: graphStyles,
            layout: layoutConfig,
            boxSelectionEnabled: false,
        });
        cyRef.current = cy;
        
        return () => {
            cy.destroy();
            cyRef.current = null;
        }
    }, [elements, layoutConfig]);

    // Effect for handling events, runs only once on mount
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const handleNodeTap = (evt: cytoscape.EventObject) => {
            const nodeId = evt.target.id();
            const { onNodeClick: currentOnNodeClick, selectedNodeId: currentSelectedNodeId } = propsRef.current;
            currentOnNodeClick?.(currentSelectedNodeId === nodeId ? null : nodeId);
        };
        const handleBackgroundTap = (evt: cytoscape.EventObject) => {
            if(evt.target === cy) {
                 const { onNodeClick: currentOnNodeClick } = propsRef.current;
                 currentOnNodeClick?.(null);
            }
        };
        const handleMouseOver = (e: cytoscape.EventObject) => {
            const { selectedNodeId: currentSelectedNodeId } = propsRef.current;
            if (!currentSelectedNodeId) {
                cy.elements().addClass('faded');
                e.target.removeClass('faded').addClass('hovered');
                e.target.neighborhood().removeClass('faded');
            }
            if (e.target.isNode()) {
                 const container = cy.container();
                 if(container) container.style.cursor = 'pointer';
            }
        };
        const handleMouseOut = (e: cytoscape.EventObject) => {
            const { selectedNodeId: currentSelectedNodeId } = propsRef.current;
            if (!currentSelectedNodeId) {
                cy.elements().removeClass('faded hovered');
            }
            const container = cy.container();
            if(container) container.style.cursor = 'default';
        };
        const handleGrab = (e: cytoscape.EventObject) => e.target.addClass('grabbed');
        const handleFree = (e: cytoscape.EventObject) => e.target.removeClass('grabbed');

        cy.on('tap', 'node', handleNodeTap);
        cy.on('tap', handleBackgroundTap);
        cy.on('mouseover', 'node', handleMouseOver);
        cy.on('mouseout', 'node', handleMouseOut);
        cy.on('grab', 'node', handleGrab);
        cy.on('free', 'node', handleFree);

        return () => {
            cy.off('tap', 'node', handleNodeTap);
            cy.off('tap', handleBackgroundTap);
            cy.off('mouseover', 'node', handleMouseOver);
            cy.off('mouseout', 'node', handleMouseOut);
            cy.off('grab', 'node', handleGrab);
            cy.off('free', 'node', handleFree);
        }
    }, []); // Empty dependency array ensures this runs only once


    // Effect for syncing selection and focus state from props
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        // Clear previous selections and styles
        cy.$('node:selected').unselect();
        cy.elements().removeClass('faded hovered');

        if (selectedNodeId) {
            const nodeToSelect = cy.$id(selectedNodeId);
            if(nodeToSelect.length > 0) {
                nodeToSelect.select();
                
                // Apply focus effect
                cy.elements().addClass('faded');
                nodeToSelect.removeClass('faded');
                nodeToSelect.neighborhood().removeClass('faded');
            }
        }
    }, [selectedNodeId]);

    // Effect for handling resize on fullscreen toggle
    useEffect(() => {
        const cy = cyRef.current;
        if (cy) {
            const resizeTimeout = setTimeout(() => {
                cy.resize();
                cy.fit(undefined, 50); // Fit with padding
            }, 100); 

            return () => clearTimeout(resizeTimeout);
        }
    }, [isFullscreen]);


    const nodeForPanel = useMemo(() => {
        if (!selectedNodeId) return null;
        return nodes.find(n => n.id === selectedNodeId) ?? null;
    }, [selectedNodeId, nodes]);

    const containerClasses = `w-full h-full relative bg-zinc-100 dark:bg-black/40 rounded-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 !rounded-none' : ''
    }`;

    return (
        <div className={containerClasses}>
             <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button onClick={handleToggleFullscreen} className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark">
                    <span className="material-symbols-outlined text-xl">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                </button>
                <button onClick={handleRefresh} className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark">
                    <span className="material-symbols-outlined text-xl">refresh</span>
                </button>
                <button onClick={handleToggleLegend} className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark">
                    <span className="material-symbols-outlined text-xl">legend_toggle</span>
                </button>
            </div>
             {isLegendVisible && <GraphLegend />}
             {nodeForPanel && <NodeDetailsPanel node={nodeForPanel} onClose={() => onNodeClick?.(null)} />}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};
