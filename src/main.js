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

// Mobile restart button
const btnRestart = document.getElementById('btnRestartMobile');
if (btnRestart) {
  btnRestart.addEventListener('click', () => {
    game.restart();
    // HUD will be updated on next frame; optionally force immediate update
    scoreEl.textContent = 'Score: ' + game.score;
    livesEl.textContent = 'Lives: ' + game.lives;
    levelEl.textContent = 'Level: ' + game.level;
    highScoreEl.textContent = 'High: ' + game.highScore;
  });
}

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
