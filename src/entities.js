import { TILE_SIZE, DIRECTIONS, PLAYER_SPEED, ENEMY_SPEED, FRIGHTENED_SPEED, COLORS, SCORE_VALUES } from './constants.js';
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
  }
  setDirection(dir) { this.pendingDir = dir; }
  update(dt, level) {
    if (!this.alive) return;
    this.tryTurn(level);
    this.move(level);
  }
  tryTurn(level) {
    if (!this.pendingDir) return;
    const { col, row } = this.gridPos();
    const withinCenter = Math.abs(this.x - (col * TILE_SIZE + TILE_SIZE / 2)) < 2 && Math.abs(this.y - (row * TILE_SIZE + TILE_SIZE / 2)) < 2;
    if (!withinCenter) return;
    const nextC = col + this.pendingDir.x;
    const nextR = row + this.pendingDir.y;
    if (!isWallAt(nextC, nextR)) {
      this.dir = this.pendingDir;
      this.pendingDir = null;
    }
  }
  move(level) {
    const nextX = this.x + this.dir.x * this.speed;
    const nextY = this.y + this.dir.y * this.speed;
    if (!this.collidesWithWall(nextX, nextY)) {
      this.x = nextX; this.y = nextY;
    } else {
      // stop at tile center
    }
  }
  collidesWithWall(nx, ny) {
    const col = Math.floor(nx / TILE_SIZE);
    const row = Math.floor(ny / TILE_SIZE);
    return isWallAt(col, row);
  }
  draw(ctx, frightenedChain) {
    // Simple circle; could add wedge animation
    this.drawCircle(ctx, COLORS.player);
  }
}

export const EnemyState = Object.freeze({ CHASE: 'CHASE', SCATTER: 'SCATTER', FRIGHTENED: 'FRIGHTENED', EATEN: 'EATEN' });

export class Enemy extends Entity {
  constructor(col, row, scatterTarget) {
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
    let color = '#ff5c5c';
    if (this.state === EnemyState.FRIGHTENED) color = COLORS.frightened;
    else if (this.state === EnemyState.EATEN) color = COLORS.eaten;
    this.drawCircle(ctx, color);
  }
}
