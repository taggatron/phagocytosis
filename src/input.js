import { DIRECTIONS } from './constants.js';

export function setupInput(player) {
  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': player.setDirection(DIRECTIONS.UP); break;
      case 'ArrowDown': case 's': case 'S': player.setDirection(DIRECTIONS.DOWN); break;
      case 'ArrowLeft': case 'a': case 'A': player.setDirection(DIRECTIONS.LEFT); break;
      case 'ArrowRight': case 'd': case 'D': player.setDirection(DIRECTIONS.RIGHT); break;
    }
  });
}
