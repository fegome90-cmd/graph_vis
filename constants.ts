import { NodeData, LinkData } from './types';

export type { NodeData, LinkData };

export const mockNodes: NodeData[] = [
  { id: 'auth.js', name: 'auth.js', type: 'file', isHotspot: true, importance: 9 },
  { id: 'session.js', name: 'session.js', type: 'file', isHotspot: false, importance: 4 },
  { id: 'User', name: 'User', type: 'class', isHotspot: false, importance: 7 },
  { id: 'AuthService', name: 'AuthService', type: 'class', isHotspot: true, importance: 10 },
  { id: 'login', name: 'login', type: 'function', isHotspot: false, importance: 5 },
  { id: 'logout', name: 'logout', type: 'function', isHotspot: false, importance: 2 },
  { id: 'verifyToken', name: 'verifyToken', type: 'function', isHotspot: true, importance: 8 },
  { id: 'db.js', name: 'db.js', type: 'file', isHotspot: false, importance: 6 },
  { id: 'getUser', name: 'getUser', type: 'function', isHotspot: false, importance: 3 },
];

export const mockLinks: LinkData[] = [
  { source: 'auth.js', target: 'AuthService', type: 'imports' },
  { source: 'auth.js', target: 'session.js', type: 'imports' },
  { source: 'AuthService', target: 'login', type: 'calls' },
  { source: 'AuthService', target: 'logout', type: 'calls' },
  { source: 'AuthService', target: 'verifyToken', type: 'calls' },
  { source: 'login', target: 'User', type: 'uses' },
  { source: 'login', target: 'session.js', type: 'uses' },
  { source: 'verifyToken', target: 'session.js', type: 'uses' },
  { source: 'session.js', target: 'db.js', type: 'imports' },
  { source: 'User', target: 'db.js', type: 'imports' },
  { source: 'db.js', target: 'getUser', type: 'calls' },
  { source: 'User', target: 'getUser', type: 'calls' },
];
