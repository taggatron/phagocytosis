import { TILE_SIZE, DIRECTIONS, PLAYER_SPEED, ENEMY_SPEED, FRIGHTENED_SPEED, COLORS, SCORE_VALUES, FRIGHTENED_DURATION, FRIGHTENED_WARNING } from './constants.js';
import { chooseNextDirection } from './pathfinding.js';
import { isWallAt } from './level.js';

export class Entity {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.x = col * TILE_SIZE + TILE_SIZE / 2;
    this.y = row * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIRECTIONS.LEFT;
    this.pendingDir = null;
    this.speed = 0;
    this.radius = TILE_SIZE * 0.4;
  }
  gridPos() { return { col: Math.floor(this.x / TILE_SIZE), row: Math.floor(this.y / TILE_SIZE) }; }
  centerOffset() { return { cx: this.x, cy: this.y }; }
  drawCircle(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class Player extends Entity {
  constructor(col, row) {
    super(col, row);
    this.speed = PLAYER_SPEED * (TILE_SIZE / 60); // px per frame at ~60fps
    this.alive = true;
    this.mouthAngle = 0; // simple animation variable optional later
    this.moving = false; // only move when direction actively pressed/dragged
    this.membranePhase = 0;
    this.engulfTimer = 0; // ms timestamp when engulf started
    this.engulfStage = null; // 'grab' | 'digest' | 'expel'
  }
  setDirection(dir) { this.pendingDir = dir; }
  update(dt, level) {
    if (!this.alive) return;
    if (!this.moving) return; // halt if not actively commanded
    this.tryTurn(level);
    this.move(level);
    this.membranePhase += dt * 0.004; // slow wave
    if (this.engulfStage) this.updateEngulf();
  }
  triggerEngulf() {
    this.engulfTimer = performance.now();
    this.engulfStage = 'grab';
  }
  updateEngulf() {
    const elapsed = performance.now() - this.engulfTimer;
    if (this.engulfStage === 'grab' && elapsed > 250) this.engulfStage = 'digest';
    else if (this.engulfStage === 'digest' && elapsed > 900) this.engulfStage = 'expel';
    else if (this.engulfStage === 'expel' && elapsed > 1200) this.engulfStage = null;
  }
  tryTurn(level) {
    if (!this.pendingDir) return;
    // Allow instant reversal
    if (this.pendingDir.x === -this.dir.x && this.pendingDir.y === -this.dir.y) {
      this.dir = this.pendingDir;
      this.pendingDir = null;
      return;
    }
    const { col, row } = this.gridPos();
    const centerX = col * TILE_SIZE + TILE_SIZE / 2;
    const centerY = row * TILE_SIZE + TILE_SIZE / 2;
    const offCenterX = Math.abs(this.x - centerX);
    const offCenterY = Math.abs(this.y - centerY);
    const perpendicular = (this.pendingDir.x !== 0 && this.dir.y !== 0) || (this.pendingDir.y !== 0 && this.dir.x !== 0);
    const looseThreshold = 6; // permit slight drift
    if (!perpendicular) {
      if (offCenterX > 3 || offCenterY > 3) return; // need closer center for non-perpendicular
    } else {
      // If turning perpendicular, gently snap axis not used by new direction
      if (this.pendingDir.x !== 0) {
        if (offCenterY < looseThreshold) this.y = centerY; else return;
      } else if (this.pendingDir.y !== 0) {
        if (offCenterX < looseThreshold) this.x = centerX; else return;
      }
    }
    const nextC = col + this.pendingDir.x;
    const nextR = row + this.pendingDir.y;
    if (!isWallAt(nextC, nextR)) { this.dir = this.pendingDir; this.pendingDir = null; }
  }
  move(level) {
    // Axis-separated movement to reduce corner sticking
    const stepX = this.dir.x * this.speed;
    const stepY = this.dir.y * this.speed;
    if (stepX !== 0) {
      const nx = this.x + stepX;
      if (!this.collidesExpanded(nx, this.y)) this.x = nx; else this.snapAxis('x');
    }
    if (stepY !== 0) {
      const ny = this.y + stepY;
      if (!this.collidesExpanded(this.x, ny)) this.y = ny; else this.snapAxis('y');
    }
    // Attempt gentle snap toward center of current tile to keep alignment
    const { col, row } = this.gridPos();
    const centerX = col * TILE_SIZE + TILE_SIZE / 2;
    const centerY = row * TILE_SIZE + TILE_SIZE / 2;
    const snapThreshold = 1.1; // px
    if (Math.abs(this.x - centerX) < snapThreshold) this.x = centerX;
    if (Math.abs(this.y - centerY) < snapThreshold) this.y = centerY;
  }
  collidesWithWall(nx, ny) {
    const col = Math.floor(nx / TILE_SIZE);
    const row = Math.floor(ny / TILE_SIZE);
    return isWallAt(col, row);
  }
  collidesExpanded(nx, ny) {
    // Sample four corners of the circle's bounding box
    const r = this.radius * 0.85;
    const points = [
      { x: nx - r, y: ny - r },
      { x: nx + r, y: ny - r },
      { x: nx - r, y: ny + r },
      { x: nx + r, y: ny + r }
    ];
    return points.some(p => {
      const c = Math.floor(p.x / TILE_SIZE);
      const rRow = Math.floor(p.y / TILE_SIZE);
      return isWallAt(c, rRow);
    });
  }
  snapAxis(axis) {
    const { col, row } = this.gridPos();
    if (axis === 'x') this.x = col * TILE_SIZE + TILE_SIZE / 2;
    if (axis === 'y') this.y = row * TILE_SIZE + TILE_SIZE / 2;
  }
  draw(ctx, frightenedChain) {
    // Animated wavy membrane approximation using radial perturbation
    const segments = 24;
    const baseR = this.radius;
    ctx.beginPath();
    for (let i=0;i<=segments;i++) {
      const t = i/segments * Math.PI*2;
      const wave = Math.sin(t*3 + this.membranePhase*2)*1.8 + Math.sin(t*5 + this.membranePhase)*1.2;
      const r = baseR + wave;
      const px = this.x + Math.cos(t)*r;
      const py = this.y + Math.sin(t)*r;
      if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    const grad = ctx.createRadialGradient(this.x,this.y,baseR*0.2,this.x,this.y,baseR+4);
    grad.addColorStop(0,'#c9ffe4');
    grad.addColorStop(0.5,'#6bff9c');
    grad.addColorStop(1,'#3fbf66');
    ctx.fillStyle = grad;
    ctx.fill();
    // nucleus
    ctx.beginPath();
    ctx.arc(this.x + Math.sin(this.membranePhase*1.5)*2, this.y + Math.cos(this.membranePhase*1.2)*2, baseR*0.45, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
    // Engulf animation overlay
    if (this.engulfStage) {
      const elapsed = performance.now() - this.engulfTimer;
      if (this.engulfStage === 'grab') {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x,this.y,baseR + 6 - elapsed*0.02,0,Math.PI*2); ctx.stroke();
      } else if (this.engulfStage === 'digest') {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.arc(this.x,this.y,baseR*0.9 + Math.sin(elapsed*0.01)*2,0,Math.PI*2); ctx.fill();
      } else if (this.engulfStage === 'expel') {
        ctx.strokeStyle = 'rgba(200,255,200,' + (1 - (elapsed-900)/300) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.x,this.y,baseR + (elapsed-900)*0.05,0,Math.PI*2); ctx.stroke();
      }
    }
  }
}

export const EnemyState = Object.freeze({ CHASE: 'CHASE', SCATTER: 'SCATTER', FRIGHTENED: 'FRIGHTENED', EATEN: 'EATEN' });

export class Enemy extends Entity {
  constructor(col, row, scatterTarget, kind='virus') {
    super(col, row);
    this.homeCol = col; this.homeRow = row;
    this.scatterTarget = scatterTarget; // {col,row}
    this.state = EnemyState.SCATTER;
    this.baseSpeed = ENEMY_SPEED;
    this.speed = this.baseSpeed * (TILE_SIZE / 60);
    this.frightenedTimer = 0;
    this.respawnTimer = 0;
    this.visible = true;
    this.pointsValue = SCORE_VALUES.enemyBase;
    this.kind = kind; // 'virus' | 'bacteria'
  }
  setState(state, now) {
    if (state === EnemyState.FRIGHTENED) {
      this.frightenedTimer = now;
    }
    this.state = state;
  }
  update(dt, context) {
    if (this.state === EnemyState.EATEN) {
      if (performance.now() - this.respawnTimer > context.enemyRespawnTime) {
        // respawn at home
        this.x = this.homeCol * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.homeRow * TILE_SIZE + TILE_SIZE / 2;
        this.state = EnemyState.SCATTER;
        this.pointsValue = SCORE_VALUES.enemyBase;
      }
      return;
    }
    if (this.state === EnemyState.FRIGHTENED) {
      const elapsed = performance.now() - this.frightenedTimer;
      if (elapsed > context.frightenedDuration) {
        this.state = EnemyState.CHASE; // revert
      }
    }
    this.chooseDir(context);
    this.move();
  }
  chooseDir({ player }) {
    const { col, row } = this.gridPos();
    let target;
    if (this.state === EnemyState.FRIGHTENED) {
      // run from player: target is mirrored tile
      const p = player.gridPos();
      target = { col: col + (col - p.col), row: row + (row - p.row) };
    } else if (this.state === EnemyState.SCATTER) {
      target = this.scatterTarget;
    } else if (this.state === EnemyState.CHASE) {
      target = player.gridPos();
    } else if (this.state === EnemyState.EATEN) {
      target = { col: this.homeCol, row: this.homeRow };
    }
    const dir = chooseNextDirection(col, row, target.col, target.row);
    if (dir) this.dir = dir;
    // speed adjustments
    if (this.state === EnemyState.FRIGHTENED) this.speed = FRIGHTENED_SPEED * (TILE_SIZE / 60);
    else this.speed = this.baseSpeed * (TILE_SIZE / 60);
  }
  move() {
    const nextX = this.x + this.dir.x * this.speed;
    const nextY = this.y + this.dir.y * this.speed;
    if (!this.collidesWithWall(nextX, nextY)) {
      this.x = nextX; this.y = nextY;
    }
  }
  collidesWithWall(nx, ny) {
    const col = Math.floor(nx / TILE_SIZE);
    const row = Math.floor(ny / TILE_SIZE);
    return isWallAt(col, row);
  }
  draw(ctx) {
    let baseColor = '#ff5c5c';
    if (this.kind === 'bacteria') baseColor = '#ff8a3d';
    if (this.state === EnemyState.FRIGHTENED) {
      const timeLeft = FRIGHTENED_DURATION - (performance.now() - this.frightenedTimer);
      if (timeLeft < FRIGHTENED_WARNING) {
        // Flash between frightened and warning color
        const phase = Math.floor(performance.now()/120)%2;
        baseColor = phase === 0 ? COLORS.frightened : '#ffffff';
      } else {
        baseColor = COLORS.frightened;
      }
    } else if (this.state === EnemyState.EATEN) baseColor = COLORS.eaten;
    else {
      // harmful state flashing subtle to indicate danger
      const phase = Math.floor(performance.now()/260)%2;
      if (phase===0) baseColor = baseColor; else baseColor = baseColor + 'cc';
    }
    const { x, y } = this; const r = this.radius;
    if (this.kind === 'virus') {
      // Spiky: draw polygon spikes
      const spikes = 8;
      ctx.beginPath();
      for (let i=0;i<spikes;i++) {
        const ang = (i/spikes)*Math.PI*2;
        const rad = r * ( (i%2===0)?1:0.6 );
        const sx = x + Math.cos(ang)*rad;
        const sy = y + Math.sin(ang)*rad;
        if (i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
      }
      ctx.closePath();
      ctx.fillStyle = baseColor;
      ctx.fill();
      // nucleus
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(x,y,r*0.4,0,Math.PI*2); ctx.fill();
    } else if (this.kind === 'bacteria') {
      // Capsule shape
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.ellipse(x,y,r*1.1,r*0.7,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.ellipse(x+r*0.2,y-r*0.1,r*0.3,r*0.18,0,0,Math.PI*2); ctx.fill();
    }
  }
}
