import { DIRECTIONS } from './constants.js';

const KEY_TO_DIR = new Map([
  ['ArrowUp', DIRECTIONS.UP], ['w', DIRECTIONS.UP], ['W', DIRECTIONS.UP],
  ['ArrowDown', DIRECTIONS.DOWN], ['s', DIRECTIONS.DOWN], ['S', DIRECTIONS.DOWN],
  ['ArrowLeft', DIRECTIONS.LEFT], ['a', DIRECTIONS.LEFT], ['A', DIRECTIONS.LEFT],
  ['ArrowRight', DIRECTIONS.RIGHT], ['d', DIRECTIONS.RIGHT], ['D', DIRECTIONS.RIGHT]
]);

export function setupInput(player) {
  const activeKeys = new Set();
  window.addEventListener('keydown', e => {
    if (KEY_TO_DIR.has(e.key)) {
      activeKeys.add(e.key);
      player.setDirection(KEY_TO_DIR.get(e.key));
      player.moving = true;
    }
  });
  window.addEventListener('keyup', e => {
    if (KEY_TO_DIR.has(e.key)) {
      activeKeys.delete(e.key);
      if (activeKeys.size === 0) {
        player.moving = false;
      } else {
        // continue with most recently pressed key still in set
        const last = Array.from(activeKeys).pop();
        player.setDirection(KEY_TO_DIR.get(last));
      }
    }
  });
}
