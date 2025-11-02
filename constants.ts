import { NodeData, LinkData, NodeType } from './types';

// FIX: Re-export types so consumers of this module can use them.
export { NodeType };
export type { NodeData, LinkData };

export const mockNodes: NodeData[] = [
    { id: 'auth.js', label: 'auth.js', type: NodeType.FILE, details: 'Core authentication service file. Modified in this PR.' },
    { id: 'AuthService', label: 'AuthService', type: NodeType.CLASS, details: 'Handles user authentication logic.' },
    { id: 'getUser', label: 'getUser', type: NodeType.FUNCTION, details: 'Fetches user data from the database.' },
    { id: 'createSession', label: 'createSession', type: NodeType.HOTSPOT, details: 'Creates a new user session. Identified as a high-churn hotspot.' },
    { id: 'jwtHelper.js', label: 'jwtHelper.js', type: NodeType.FILE, details: 'Utility for JWT token creation and validation.' },
    { id: 'db.js', label: 'db.js', type: NodeType.FILE, details: 'Database connection and query helpers.' },
    { id: 'User', label: 'User', type: NodeType.CLASS, details: 'User model/schema definition.' },
];

export const mockLinks: LinkData[] = [
    { source: 'auth.js', target: 'AuthService', type: 'import' },
    { source: 'auth.js', target: 'getUser', type: 'import' },
    { source: 'AuthService', target: 'createSession', type: 'call' },
    { source: 'AuthService', target: 'jwtHelper.js', type: 'import' },
    { source: 'getUser', target: 'db.js', type: 'import' },
    { source: 'getUser', target: 'User', type: 'import' },
    { source: 'createSession', target: 'jwtHelper.js', type: 'call' },
];