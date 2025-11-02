export type NodeType = 'file' | 'function' | 'class';

export interface NodeData {
  id: string;
  name: string;
  type: NodeType;
  isHotspot: boolean;
  importance: number; // For the vertical status bar (0-10)
}

export interface LinkData {
  source: string;
  target: string;
  type: 'calls' | 'uses' | 'imports' | 'extends';
  value?: number; // For variable link thickness
}
