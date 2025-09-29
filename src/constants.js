export const TILE_SIZE = 24; // px
export const COLS = 28; // standard pac-like width
export const ROWS = 33; // added top skin and bottom blood wall rows
export const CANVAS_WIDTH = COLS * TILE_SIZE;
export const CANVAS_HEIGHT = ROWS * TILE_SIZE;

export const COLORS = {
  wall: '#1f3b52',
  wallAccent: '#2e5e7a',
  background: '#000000',
  pathogen: '#86d1ff',
  power: '#ffda5c',
  player: '#6bff9c',
  frightened: '#4d6bff',
  eaten: '#ffffff',
  skinRow: '#ffccd9', // light pink (skin)
  bloodRow: '#ffb3b3' // light red (blood)
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1, name: 'UP' },
  DOWN: { x: 0, y: 1, name: 'DOWN' },
  LEFT: { x: -1, y: 0, name: 'LEFT' },
  RIGHT: { x: 1, y: 0, name: 'RIGHT' }
};
export const DIR_LIST = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

export const PLAYER_SPEED = 5; // tiles per second (converted to px per frame)
export const ENEMY_SPEED = 3.2; // slower base speed
export const FRIGHTENED_SPEED = 3.2;
export const SPEED_INCREMENT = 0.3;

export const FRIGHTENED_DURATION = 6000; // ms
export const FRIGHTENED_WARNING = 1200; // last ms of frightened where enemies flash
export const ENEMY_RESPAWN_TIME = 3000; // ms after being eaten
export const ENEMY_RELEASE_INTERVAL = 3500; // ms between enemy releases at level 1
export const ENEMY_RELEASE_DECREMENT = 250; // reduce interval per level (min clamp)

// Activation cycle: enemies always harmful, but periodically enter an "activated" heightened mode (faster, stronger visual pulse)
export const ACTIVATION_CYCLE_DURATION = 14000; // total cycle length ms
export const ACTIVATION_ACTIVE_DURATION = 3000; // ms at start of each cycle that enemies are in activated mode
export const ACTIVATED_SPEED_MULTIPLIER = 1.35; // speed boost during activated mode

// Simple global scatter/chase cycle (classic arcade style)
export const SCATTER_DURATION = 6000; // ms enemies retreat to corners
export const CHASE_DURATION = 20000; // ms enemies aggressively pursue player

export const SCORE_VALUES = {
  pathogen: 10,
  power: 50,
  enemyBase: 200 // doubles per chain
};

export const START_LIVES = 3;
