import { Game } from './game.js';
import { setupInput } from './input.js';
import { setupTouch } from './touch.js';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');

const game = new Game(canvas);
setupInput(game.player);
setupTouch(game.player);

function loop() {
  const now = performance.now();
  const dt = now - (game.lastTime || now);
  game.lastTime = now;
  game.update(dt);
  game.draw();
  scoreEl.textContent = 'Score: ' + game.score;
  livesEl.textContent = 'Lives: ' + game.lives;
  levelEl.textContent = 'Level: ' + game.level;
  highScoreEl.textContent = 'High: ' + game.highScore;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
