import { TILE_SIZE, COLORS, SCORE_VALUES, START_LIVES, FRIGHTENED_DURATION, ENEMY_RESPAWN_TIME, SPEED_INCREMENT } from './constants.js';
import { getLevelLayout, isWallAt } from './level.js';
import { Player, Enemy, EnemyState } from './entities.js';

function findSpawns(layout, charList) {
  const found = [];
  layout.forEach((line, r) => {
    [...line].forEach((c, col) => {
      if (charList.includes(c)) found.push({ col, row: r, ch: c });
    });
  });
  return found;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layout = getLevelLayout();
    this.score = 0;
    this.lives = START_LIVES;
    this.level = 1;
    this.highScore = Number(localStorage.getItem('phagoHigh') || 0);
    this.gameOver = false;
    this.paused = false;
    this.lastTime = performance.now();
    this.frightenedChain = 0;

    this.frightenedDuration = FRIGHTENED_DURATION;
    this.enemyRespawnTime = ENEMY_RESPAWN_TIME;

    this.collectibles = new Map(); // key: col,row => type: '.' or 'o'
    this.populateCollectibles();

    const playerSpawn = findSpawns(this.layout, ['P'])[0] || { col: 14, row: 23 };
    this.player = new Player(playerSpawn.col, playerSpawn.row);

    this.enemies = [];
    const enemySpawns = findSpawns(this.layout, ['V', 'B']);
    // scatter corners
    const corners = [ { col:1,row:1 }, { col:26,row:1 }, { col:1,row:29 }, { col:26,row:29 } ];
    enemySpawns.forEach((s,i) => {
      this.enemies.push(new Enemy(s.col, s.row, corners[i % corners.length]));
    });

    this.bindKeys();
  }
  bindKeys() {
    window.addEventListener('keydown', e => {
      if (e.key === 'p' || e.key === 'P') this.paused = !this.paused;
      if (this.gameOver && (e.key === 'r' || e.key === 'R')) this.restart();
    });
  }
  populateCollectibles() {
    this.layout.forEach((line, r) => {
      [...line].forEach((c, col) => {
        if (c === '.' || c === 'o') {
          this.collectibles.set(col + ',' + r, c);
        }
      });
    });
  }
  update(dt) {
    if (this.gameOver || this.paused) return;
    this.player.update(dt, this.layout);
    for (const enemy of this.enemies) {
      enemy.update(dt, this);
    }
    this.handleCollisions();
    this.checkLevelComplete();
  }
  handleCollisions() {
    // player with collectibles
    const pPos = this.player.gridPos();
    const key = pPos.col + ',' + pPos.row;
    if (this.collectibles.has(key)) {
      const type = this.collectibles.get(key);
      if (type === '.') this.score += SCORE_VALUES.pathogen;
      if (type === 'o') {
        this.score += SCORE_VALUES.power;
        this.triggerFrightened();
      }
      this.collectibles.delete(key);
    }

    // enemies
    for (const enemy of this.enemies) {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distSq = dx*dx + dy*dy;
      const touchDist = (enemy.radius + this.player.radius) * 0.7;
      if (distSq < touchDist * touchDist) {
        if (enemy.state === EnemyState.FRIGHTENED) {
          enemy.state = EnemyState.EATEN;
          enemy.respawnTimer = performance.now();
          this.score += enemy.pointsValue * (2 ** this.frightenedChain);
          this.frightenedChain++;
        } else if (enemy.state !== EnemyState.EATEN) {
          this.killPlayer();
          break;
        }
      }
    }
  }
  triggerFrightened() {
    this.frightenedChain = 0;
    for (const enemy of this.enemies) {
      if (enemy.state !== EnemyState.EATEN) enemy.setState(EnemyState.FRIGHTENED, performance.now());
    }
  }
  killPlayer() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('phagoHigh', String(this.highScore));
      }
      return;
    }
    this.resetPositions();
  }
  resetPositions() {
    // Reset player and enemies to spawn points
    const playerSpawn = this.layout.reduce((acc,line,r) => {
      if (acc) return acc;
      const idx = line.indexOf('P');
      if (idx !== -1) return { col: idx, row: r };
      return null;
    }, null) || { col: 14, row: 23 };
    this.player.x = playerSpawn.col * TILE_SIZE + TILE_SIZE/2;
    this.player.y = playerSpawn.row * TILE_SIZE + TILE_SIZE/2;
    this.player.dir = { x: -1, y:0};

    const enemySpawns = [];
    this.layout.forEach((line,r)=>{[...line].forEach((c,col)=>{ if(c==='V'||c==='B') enemySpawns.push({col,row:r}); });});
    this.enemies.forEach((e,i)=>{
      const s = enemySpawns[i];
      if (s) {
        e.x = s.col * TILE_SIZE + TILE_SIZE/2;
        e.y = s.row * TILE_SIZE + TILE_SIZE/2;
        e.state = EnemyState.SCATTER;
        e.pointsValue = SCORE_VALUES.enemyBase;
      }
    });
  }
  checkLevelComplete() {
    if (this.collectibles.size === 0) {
      this.level++;
      // Increase speeds a bit
      for (const e of this.enemies) {
        e.baseSpeed += SPEED_INCREMENT;
      }
      this.populateCollectibles();
      this.resetPositions();
    }
  }
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.drawWalls();
    this.drawCollectibles();
    for (const enemy of this.enemies) enemy.draw(ctx);
    this.player.draw(ctx, this.frightenedChain);
    if (this.gameOver) this.drawOverlay('GAME OVER - Press R');
    else if (this.paused) this.drawOverlay('PAUSED');
  }
  drawOverlay(text) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle = '#ffda5c';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, this.canvas.width/2, this.canvas.height/2);
  }
  drawWalls() {
    const ctx = this.ctx;
    ctx.strokeStyle = COLORS.wallAccent;
    ctx.lineWidth = 2;
    this.layout.forEach((line,r)=>{
      [...line].forEach((c,col)=>{
        if (c === '#') {
          ctx.fillStyle = COLORS.wall;
          ctx.fillRect(col*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });
    });
  }
  drawCollectibles() {
    const ctx = this.ctx;
    for (const [key,type] of this.collectibles.entries()) {
      const [c,r] = key.split(',').map(Number);
      const x = c*TILE_SIZE + TILE_SIZE/2;
      const y = r*TILE_SIZE + TILE_SIZE/2;
      if (type === '.') {
        ctx.fillStyle = COLORS.pathogen;
        ctx.beginPath();
        ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
      } else if (type === 'o') {
        ctx.fillStyle = COLORS.power;
        ctx.beginPath();
        ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
      }
    }
  }
  restart() {
    this.score = 0; this.lives = START_LIVES; this.level = 1; this.gameOver = false; this.frightenedChain = 0;
    this.collectibles.clear();
    this.populateCollectibles();
    this.resetPositions();
    for (const e of this.enemies) { e.baseSpeed = 4.5; e.state = EnemyState.SCATTER; }
  }
}
