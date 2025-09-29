# Phagocytosis Arcade (Pac-style)

A lightweight browser game inspired by Pac-Man where you control a phagocyte consuming pathogens (viruses & bacteria) on a grid. Power antigen clusters put enemies into a frightened state so you can phagocytose them for bonus points.

## Features
- Grid-based maze rendered with HTML5 Canvas (no build tools, pure ES modules)
- Collect pathogens (small pellets) & antigen clusters (power pellets)
- Enemies (viruses/bacteria) with simple chase / scatter / frightened behaviors
- Frightened chain bonus: each enemy eaten during one frightened period doubles value (200, 400, 800, 1600 ...)
- Level progression increases enemy speed slightly
- Lives system & Game Over screen (press `R` to restart)
- Pause toggle with `P`
- Local high score persistence via `localStorage`
 - Responsive mobile scaling with touch controls (D-pad + swipe)
 - Gradual enemy release timing for fairer early gameplay
 - Auto-filled pellet distribution (even spread) with animated pulse & glow
 - Distinct enemy visuals (spiky viruses vs capsule bacteria)

## Controls
- Move: Hold Arrow keys or WASD (movement stops when released)
- Pause: `P`
- Restart after Game Over: `R`

## Scoring
| Action | Points |
|--------|--------|
| Pathogen pellet | 10 |
| Antigen power cluster | 50 |
| Enemy (base) | 200 (doubles each chain) |

## Run Locally
Just serve the folder with any static server (required for ES module loading in some browsers):

### Python quick server (optional):
```bash
python3 -m http.server 5173
```
Open: http://localhost:5173

Or drag `index.html` into a modern browser (may work directly depending on security policy).

## File Structure
```
index.html
styles.css
src/
  constants.js
  level.js
  entities.js
  pathfinding.js
  input.js
  game.js
  main.js
```

## Future Enhancements Ideas
- Distinct visual sprites or animated shapes
- More sophisticated enemy AI timing (scatter/chase cycles)
- Multiple level layouts / procedural variation
- Sound effects
- Touch / mobile controls
- Accessibility adjustments & colorblind-friendly palette choices

## Mobile Support
The canvas scales responsively to fit smaller screens while keeping the grid aspect ratio. On devices below ~820px width a translucent directional pad appears. You can also swipe on the playfield to move:

Touch Controls:
- Hold arrow buttons to move; release to stop. Drag (continuous swipe) over the playfield to move; lifting finger stops.
- Pause (P) & Restart (R) require an attached keyboard currently (could be mapped to long-press in a future update).

Considerations:
- Performance is generally fine on modern mobile browsers; older devices may see lower frame rates.
- No virtual button yet for pause/restart; add if needed.
- High score persists per browser via localStorage.

## Difficulty & Visual Updates
- Early waves: only one enemy active; others release after staggered timers that shorten each level
- Pellets auto-generated in traversable spaces outside the enemy lair for consistent density
- Small pathogens pulse; power clusters emit a soft radial glow
- Viruses render as spiky polygons; bacteria as capsules for quick visual parsing

## Control & Safety Improvements
- Instant reversal: you can flip direction (180°) immediately even if not centered in a tile.
- Spawn grace: ~2.5s invulnerability (halo + flicker) after a life loss or level start so enemies cannot instantly collide.

## License
MIT
