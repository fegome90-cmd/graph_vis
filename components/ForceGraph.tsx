

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular, Position } from 'cytoscape';
import { NodeData, LinkData, NodeType } from '../types';

interface ForceGraphProps {
    nodes: NodeData[];
    links: LinkData[];
}

const graphStyles: cytoscape.Stylesheet[] = [
    {
        selector: 'node',
        style: {
            'shape': 'data(shape)',
            'width': 'data(width)',
            'height': 'data(height)',
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#ffffff',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'transition-property': 'transform, box-shadow',
            'transition-duration': '0.2s',
        },
    },
    {
        selector: 'node[type="FILE"]',
        style: { 'background-color': '#135bec', 'width': 70, 'height': 40, 'shape': 'round-rectangle' },
    },
    {
        selector: 'node[type="CLASS"]',
        style: { 'background-color': '#8b5cf6', 'width': 50, 'height': 50, 'shape': 'diamond' },
    },
    {
        selector: 'node[type="FUNCTION"]',
        style: { 'background-color': '#14b8a6', 'width': 48, 'height': 48, 'shape': 'ellipse' },
    },
    {
        selector: 'node[type="HOTSPOT"]',
        style: { 'background-color': '#ef4444', 'width': 60, 'height': 60, 'shape': 'ellipse' },
    },
    {
        selector: 'edge',
        style: {
            'width': 1.5,
            'line-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'curve-style': 'bezier',
            'transition-property': 'opacity',
            'transition-duration': '0.3s',
        },
    },
     {
        selector: 'edge[type="import"]',
        style: { 'line-color': '#38bdf8', 'target-arrow-color': '#38bdf8' },
    },
    {
        selector: 'edge[type="call"]',
        style: { 'line-color': '#fbbf24', 'target-arrow-color': '#fbbf24' },
    },
    {
        selector: 'node:selected',
        style: {
            'border-width': 4,
            'border-color': '#ffffff',
            'border-opacity': 0.8,
        }
    },
    {
        selector: '.hovered',
        style: {
            'transform': 'scale(1.1)',
        }
    },
    {
        selector: '.faded',
        style: {
            'opacity': 0.2,
        }
    },
];


const GraphLegend: React.FC = () => (
    <div className="absolute bottom-4 left-4 z-10">
        <div className="p-4 rounded-xl border border-white/10 bg-background-dark/80 backdrop-blur-sm text-white shadow-lg w-64">
            <h4 className="font-bold mb-3 text-base">Graph Legend</h4>
            <div className="flex flex-col gap-2 text-sm">
                <h5 className="text-xs font-bold uppercase text-white/50 mt-2 mb-1">Node Types</h5>
                <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 100 100"><rect fill="#135bec" stroke="#60a5fa" height="80" strokeWidth="5" width="80" x="10" y="10" rx="10"></rect></svg><span>File</span></div>
                <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 100 100"><path fill="#8b5cf6" stroke="#a78bfa" d="M50 0 L100 50 L50 100 L0 50 Z" strokeWidth="5"></path></svg><span>Class</span></div>
                <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 100 100"><circle fill="#14b8a6" stroke="#5eead4" cx="50" cy="50" r="45" strokeWidth="5"></circle></svg><span>Function</span></div>
                <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 100 100"><circle fill="#ef4444" stroke="#f87171" cx="50" cy="50" r="45" strokeWidth="5"></circle></svg><span>Hotspot</span></div>
                <h5 className="text-xs font-bold uppercase text-white/50 mt-3 mb-1">Relation Types</h5>
                <div className="flex items-center gap-2"><svg className="w-4 h-2" viewBox="0 0 20 2"><line stroke="#38bdf8" strokeWidth="3" x1="0" x2="20" y1="1" y2="1"></line></svg><span>Import</span></div>
                <div className="flex items-center gap-2"><svg className="w-4 h-2" viewBox="0 0 20 2"><line stroke="#fbbf24" strokeWidth="3" x1="0" x2="20" y1="1" y2="1"></line></svg><span>Call</span></div>
            </div>
        </div>
    </div>
);

const NodeDetailsPanel: React.FC<{ node: NodeData, position: Position, onClose: () => void }> = ({ node, position, onClose }) => (
    <div 
        className="absolute z-20 w-64 rounded-xl border border-white/10 bg-background-dark/80 shadow-2xl backdrop-blur-sm"
        style={{ left: position.x, top: position.y }}
    >
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-white">{node.label}</h3>
                    <p className="text-sm text-white/70">{node.type}</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white">&times;</button>
            </div>
            <p className="mt-2 text-sm text-white/80">{node.details}</p>
            <div className="mt-4 flex flex-col gap-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90">
                    <span className="material-symbols-outlined text-base">code</span>
                    <span>View Code</span>
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-md bg-white/10 py-2 text-sm font-medium text-white/90 hover:bg-white/20">
                    <span className="material-symbols-outlined text-base">filter_alt</span>
                    <span>Filter by File</span>
                </button>
            </div>
        </div>
    </div>
);


export const ForceGraph: React.FC<ForceGraphProps> = ({ nodes, links }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const [panelPosition, setPanelPosition] = useState<Position>({x: 0, y: 0});

    useEffect(() => {
        if (!containerRef.current) return;

        const elements = [
            ...nodes.map(node => ({ data: { ...node } })),
            ...links.map(link => ({ data: { ...link } })),
        ];

        cyRef.current = cytoscape({
            container: containerRef.current,
            elements: elements,
            style: graphStyles,
            layout: {
                name: 'cose',
                animate: true,
                padding: 50,
                nodeRepulsion: () => 400000,
                idealEdgeLength: () => 120,
            },
        });

        const cy = cyRef.current;

        cy.on('tap', 'node', (evt) => {
            const node = evt.target as NodeSingular;
            setSelectedNode(node.data());
            setPanelPosition({ x: evt.renderedPosition.x + 20, y: evt.renderedPosition.y - 20 });
        });
        
        cy.on('tap', (evt) => {
            if(evt.target === cy) {
                setSelectedNode(null);
            }
        });

        cy.on('mouseover', 'node', (e) => {
            const node = e.target;
            cy.elements().addClass('faded');
            node.removeClass('faded');
            node.addClass('hovered');
            node.neighborhood().removeClass('faded');
        });

        cy.on('mouseout', 'node', () => {
             cy.elements().removeClass('faded hovered');
        });

        return () => {
            cy.destroy();
        };

    }, [nodes, links]);


    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark"><span className="material-symbols-outlined text-xl">fullscreen</span></button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark"><span className="material-symbols-outlined text-xl">refresh</span></button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark/80 backdrop-blur-sm text-white hover:bg-background-dark"><span className="material-symbols-outlined text-xl">legend_toggle</span></button>
            </div>
             <GraphLegend />
             {selectedNode && <NodeDetailsPanel node={selectedNode} position={panelPosition} onClose={() => setSelectedNode(null)} />}
            <div ref={containerRef} className="w-full h-full bg-zinc-100 dark:bg-black/40 rounded-xl" />
        </div>
    );
};