import { COLS, ROWS } from './constants.js';
/* Level encoding:
  # = wall
  . = small pathogen (collectible)
  o = power antigen cluster (power pellet)
  P = player spawn
  V = enemy (virus) spawn
  B = enemy (bacteria) spawn
  ' ' = empty path
*/

// Basic symmetrical layout (can refine later)
const RAW_LAYOUT = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o####.#####.##.#####.####o#',
  '#.####.#####.##.#####.####.#',
  '#............##............#',
  '#.####.##.########.##.####.#',
  '#.####.##.########.##.####.#',
  '#......##....##....##......#',
  '######.#####  #  ####.######',
  '##### #.##### ## #####.# #####',
  '#.... #.##.... .. ....##.# ....#',
  '#.... #.## ###VV### ##.# ....#',
  '######.## # B  P  B # ##.######',
  '#.....    # V  P  V #    .....#',
  '######.## #   ..   # ##.######',
  '#.... #.## ###..### ##.# ....#',
  '#.... #.##.... .. ....#.# ....#',
  '#.... #.## ######## ##.# ....#',
  '######.#   ####### ##.######',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o..##................##..o#',
  '###.##.##.########.##.##.###',
  '#......##....##....##......#',
  '#.##########.##.##########.#',
  '#............##............#',
  '############################'
];

export function getLevelLayout() {
  // Pad or adjust if ROWS differs
  return RAW_LAYOUT.slice(0, ROWS);
}

export function isWallAt(col, row) {
  const layout = getLevelLayout();
  const line = layout[row];
  if (!line) return true;
  return line[col] === '#';
}
