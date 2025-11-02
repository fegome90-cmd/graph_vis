

export enum NodeType {
    FILE = 'FILE',
    CLASS = 'CLASS',
    FUNCTION = 'FUNCTION',
    HOTSPOT = 'HOTSPOT',
}

export interface NodeData {
    id: string;
    label: string;
    type: NodeType;
    details: string;
}

export interface LinkData {
    source: string;
    target: string;
    type: 'import' | 'call';
}