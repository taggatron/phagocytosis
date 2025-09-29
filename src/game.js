import { TILE_SIZE, COLORS, SCORE_VALUES, START_LIVES, FRIGHTENED_DURATION, ENEMY_RESPAWN_TIME, SPEED_INCREMENT, ENEMY_RELEASE_INTERVAL, ENEMY_RELEASE_DECREMENT } from './constants.js';
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
  this.graceStart = performance.now();
  this.graceDuration = 2500; // ms of post-spawn invulnerability

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
      const kind = (s.ch === 'B') ? 'bacteria' : 'virus';
      const e = new Enemy(s.col, s.row, corners[i % corners.length], kind);
      e.released = (i === 0); // only first released
      e.releaseTime = performance.now() + (i * ENEMY_RELEASE_INTERVAL);
      this.enemies.push(e);
    });
    this.baseReleaseInterval = ENEMY_RELEASE_INTERVAL;

    this.bindKeys();
  }
  bindKeys() {
    window.addEventListener('keydown', e => {
      if (e.key === 'p' || e.key === 'P') this.paused = !this.paused;
      if (this.gameOver && (e.key === 'r' || e.key === 'R')) this.restart();
    });
  }
  populateCollectibles() {
    const ghostHouseRows = new Set();
    // Roughly detect ghost house by presence of V/B or internal blanks
    this.layout.forEach((line, r) => { if (/[VB]/.test(line)) ghostHouseRows.add(r); });
    this.layout.forEach((line, r) => {
      [...line].forEach((c, col) => {
        const key = col + ',' + r;
        if (c === '.' || c === 'o') {
          this.collectibles.set(key, c);
        } else if (c === ' ') {
          // auto pellet except inside ghost house zone (row with enemies plus one above/below)
          const inGhost = ghostHouseRows.has(r) || ghostHouseRows.has(r-1) || ghostHouseRows.has(r+1);
          if (!inGhost) this.collectibles.set(key, '.');
        }
      });
    });
  }
  update(dt) {
    if (this.gameOver || this.paused) return;
    this.player.update(dt, this.layout);
    for (const enemy of this.enemies) {
      if (!enemy.released) {
        if (performance.now() >= enemy.releaseTime) enemy.released = true;
        else continue; // skip update until released
      }
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
      this.player.triggerEngulf();
    }

    // enemies
    const inGrace = (performance.now() - this.graceStart) < this.graceDuration;
    for (const enemy of this.enemies) {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distSq = dx*dx + dy*dy;
      const touchDist = (enemy.radius + this.player.radius) * 0.7;
      if (distSq < touchDist * touchDist) {
        if (enemy.state === EnemyState.FRIGHTENED && !inGrace) {
          enemy.state = EnemyState.EATEN;
          enemy.respawnTimer = performance.now();
          this.score += enemy.pointsValue * (2 ** this.frightenedChain);
          this.frightenedChain++;
          this.player.triggerEngulf();
        } else if (enemy.state !== EnemyState.EATEN && !inGrace) {
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
  this.graceStart = performance.now();

    const enemySpawns = [];
    this.layout.forEach((line,r)=>{[...line].forEach((c,col)=>{ if(c==='V'||c==='B') enemySpawns.push({col,row:r}); });});
    this.enemies.forEach((e,i)=>{
      const s = enemySpawns[i];
      if (s) {
        e.x = s.col * TILE_SIZE + TILE_SIZE/2;
        e.y = s.row * TILE_SIZE + TILE_SIZE/2;
        e.state = EnemyState.SCATTER;
        e.pointsValue = SCORE_VALUES.enemyBase;
        e.released = (i===0);
        e.releaseTime = performance.now() + (i * Math.max(1200, this.baseReleaseInterval));
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
      // Faster releases next level
      this.baseReleaseInterval = Math.max(1200, this.baseReleaseInterval - ENEMY_RELEASE_DECREMENT);
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
    const inGrace = (performance.now() - this.graceStart) < this.graceDuration;
    if (inGrace) {
      const t = performance.now();
      const pulse = 8 + Math.sin(t/120)*3;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.radius + pulse, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (Math.floor(t/150)%2===0) {
        ctx.globalAlpha = 0.6;
        this.player.draw(ctx, this.frightenedChain);
        ctx.globalAlpha = 1;
      } else {
        this.player.draw(ctx, this.frightenedChain);
      }
    } else {
      this.player.draw(ctx, this.frightenedChain);
    }
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
    const t = performance.now();
    for (const [key,type] of this.collectibles.entries()) {
      const [c,r] = key.split(',').map(Number);
      const x = c*TILE_SIZE + TILE_SIZE/2;
      const y = r*TILE_SIZE + TILE_SIZE/2;
      if (type === '.') {
        const pulse = 2.2 + Math.sin(t/180 + (c+r))*0.8;
        const grad = ctx.createRadialGradient(x,y,0,x,y,pulse+2);
        grad.addColorStop(0,'#bfe9ff');
        grad.addColorStop(1,COLORS.pathogen);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x,y,pulse,0,Math.PI*2); ctx.fill();
      } else if (type === 'o') {
        const glow = 7 + Math.sin(t/140 + c)*1.5;
        const grad = ctx.createRadialGradient(x,y,0,x,y,glow+4);
        grad.addColorStop(0,'#fff4bf');
        grad.addColorStop(0.5,COLORS.power);
        grad.addColorStop(1,'rgba(255,218,92,0.05)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x,y,glow,0,Math.PI*2); ctx.fill();
      }
    }
  }
  restart() {
    this.score = 0; this.lives = START_LIVES; this.level = 1; this.gameOver = false; this.frightenedChain = 0;
    this.collectibles.clear();
    this.populateCollectibles();
    this.resetPositions();
    this.baseReleaseInterval = ENEMY_RELEASE_INTERVAL;
    for (const e of this.enemies) { e.baseSpeed = 3.8; e.state = EnemyState.SCATTER; }
    this.graceStart = performance.now();
  }
}
