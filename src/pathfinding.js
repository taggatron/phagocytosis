import { DIR_LIST } from './constants.js';
import { isWallAt } from './level.js';

// Simple tile-based shortest direction chooser using BFS limited radius
export function chooseNextDirection(gridX, gridY, targetX, targetY) {
  if (gridX === targetX && gridY === targetY) return null;
  const visited = new Set();
  const queue = [];
  queue.push({ x: gridX, y: gridY, path: [] });
  visited.add(gridX + ',' + gridY);
  const MAX_EXPANSIONS = 200; // limit to prevent perf explosion
  let expansions = 0;
  while (queue.length) {
    const node = queue.shift();
    expansions++;
    if (expansions > MAX_EXPANSIONS) break;
    if (node.x === targetX && node.y === targetY) {
      return node.path[0] || null;
    }
    for (const dir of DIR_LIST) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;
      const key = nx + ',' + ny;
      if (visited.has(key)) continue;
      if (isWallAt(nx, ny)) continue;
      visited.add(key);
      queue.push({ x: nx, y: ny, path: [...node.path, dir] });
    }
  }
  return null; // fallback
}
