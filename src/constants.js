export const TILE_SIZE = 24; // px
export const COLS = 28; // standard pac-like width
export const ROWS = 31; // standard pac-like height
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
  eaten: '#ffffff'
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1, name: 'UP' },
  DOWN: { x: 0, y: 1, name: 'DOWN' },
  LEFT: { x: -1, y: 0, name: 'LEFT' },
  RIGHT: { x: 1, y: 0, name: 'RIGHT' }
};
export const DIR_LIST = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

export const PLAYER_SPEED = 5; // tiles per second (converted to px per frame)
export const ENEMY_SPEED = 3.8; // lowered base for early survivability
export const FRIGHTENED_SPEED = 3.2;
export const SPEED_INCREMENT = 0.3;

export const FRIGHTENED_DURATION = 6000; // ms
export const FRIGHTENED_WARNING = 1200; // last ms of frightened where enemies flash
export const ENEMY_RESPAWN_TIME = 3000; // ms after being eaten
export const ENEMY_RELEASE_INTERVAL = 3500; // ms between enemy releases at level 1
export const ENEMY_RELEASE_DECREMENT = 250; // reduce interval per level (min clamp)

// Harm activation mechanics
// Enemies (virus/bacteria) are harmless until player reaches a score threshold. Once threshold reached,
// each enemy becomes harmful only during a repeating window (default 5s harmful, then safe until next trigger if desired).
// For now we implement a single 5s harmful activation that begins once threshold crossed; after that, standard frightened / eaten logic applies.
export const HARM_SCORE_THRESHOLD = 300; // points after which enemies can start harming the player
export const HARM_ACTIVE_DURATION = 5000; // ms window after threshold when enemies are harmful (outside frightened/eaten overrides)

export const SCORE_VALUES = {
  pathogen: 10,
  power: 50,
  enemyBase: 200 // doubles per chain
};

export const START_LIVES = 3;
