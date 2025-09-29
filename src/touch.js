import { DIRECTIONS } from './constants.js';

export function setupTouch(player) {
  const container = document.getElementById('touchControls');
  if (!container) return;
  const map = new Map([
    ['btn-up', DIRECTIONS.UP],
    ['btn-down', DIRECTIONS.DOWN],
    ['btn-left', DIRECTIONS.LEFT],
    ['btn-right', DIRECTIONS.RIGHT]
  ]);
  map.forEach((dir, cls) => {
    const btn = container.querySelector('.' + cls.replace('btn-','btn-'));
    // Actually classes are btn-up etc; we reused key so it's fine
  });
  function press(dir){ player.setDirection(dir); player.moving = true; }
  function release(){ player.moving = false; }
  const up = container.querySelector('.btn-up');
  const down = container.querySelector('.btn-down');
  const left = container.querySelector('.btn-left');
  const right = container.querySelector('.btn-right');
  ;[up,down,left,right].forEach(btn=>{
    btn.addEventListener('pointerdown', e=>{ e.preventDefault(); press(
      btn===up?DIRECTIONS.UP:btn===down?DIRECTIONS.DOWN:btn===left?DIRECTIONS.LEFT:DIRECTIONS.RIGHT); });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', ()=>{ if(player.moving) release(); });
  });

  // Basic swipe on canvas
  const canvas = document.getElementById('game');
  let startX=0,startY=0,swiping=false;
  canvas.addEventListener('touchstart', e=>{
    const t = e.changedTouches[0];
    startX = t.clientX; startY = t.clientY; swiping=true; player.moving = true;
  }, {passive:true});
  canvas.addEventListener('touchmove', e=>{
    if(!swiping) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const absX = Math.abs(dx), absY=Math.abs(dy);
    if (Math.max(absX,absY) < 18) return; // threshold before setting direction
    if (absX > absY) player.setDirection(dx>0?DIRECTIONS.RIGHT:DIRECTIONS.LEFT);
    else player.setDirection(dy>0?DIRECTIONS.DOWN:DIRECTIONS.UP);
  }, {passive:true});
  function endSwipe(){ if(swiping){ swiping=false; player.moving=false; } }
  canvas.addEventListener('touchend', endSwipe, {passive:true});
  canvas.addEventListener('touchcancel', endSwipe, {passive:true});
}
