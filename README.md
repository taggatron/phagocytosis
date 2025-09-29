# Phagocytosis Arcade (Pac-style)

A lightweight browser game inspired by Pac-Man where you control a phagocyte consuming pathogens (viruses & bacteria) on a grid. Power antigen clusters put enemies into a frightened state so you can phagocytose them for bonus points.

## Features
- Grid-based maze rendered with HTML5 Canvas (no build tools, pure ES modules)
- Collect pathogens (small pellets) & antigen clusters (power pellets)
- Enemies (viruses/bacteria) with chase / scatter / frightened / eaten states
- Frightened chain bonus: each enemy eaten during one frightened period doubles value (200, 400, 800, 1600 ...)
- Level progression modestly increases enemy speed
- Lives system & Game Over screen (press `R` to restart)
- Pause toggle with `P`
- Local high score persistence via `localStorage`
- Responsive mobile scaling with touch controls (D-pad + swipe)
- Periodic enemy activation cycle with UI countdown bar (faster + stronger pulse during active phase)
- Auto-filled pellet distribution (even spread) with animated pulse & glow
- Distinct enemy visuals (spiky viruses vs capsule bacteria)
- Animated phagocyte membrane (organic wavy perimeter + subtle nucleus shimmer)
- Engulf / digest / expel animation sequence when consuming pellets or frightened enemies
- Enemy harm clarity: dangerous enemies softly pulse; frightened state ends with white flashing warning window
- Spawn / life-loss grace halo with temporary invulnerability

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
- Sprite sheet / richer multi-part animation system (organelles, ripple layers)
- More sophisticated enemy AI timing (longer structured scatter/chase cycles)
- Multiple level layouts / procedural variation
- Sound effects (engulf, frightened warning chime, life loss)
- Accessibility & colorblind-friendly palette options / high contrast mode
- Settings panel (toggle animations, flashing reduction, difficulty tuning)

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
- Movement smoothing & anti-sticking: axis-separated movement, expanded collision sampling, and relaxed perpendicular turn window to prevent getting caught on walls.

## Engulf & Visual Feedback
When the phagocyte consumes a pathogen or power antigen cluster, an engulfment sequence plays:

1. Grab: A semi-transparent pseudopod ring expands briefly around the cell edge.
2. Digest: An inner glow pulse travels toward the center (metabolic digestion).
3. Expel: A faint outward particle / ring shrinks & fades (optional visual; currently subtle flash) indicating processing complete.

Enemy Danger States:
- Normal (dangerous): Subtle rhythmic brightness pulse so it's clear they can still harm you.
- Frightened: Tinted + slowed.
- Frightened ending warning: Rapid alternating white flash during the final seconds (configurable via `FRIGHTENED_WARNING` constant) so you know when NOT to run directly into them anymore.

### Activation Cycle
Enemies now begin harmful immediately (outside spawn grace / frightened / eaten), but operate on a repeating activation cycle shown via the bar under the HUD:

- Cycle length: configurable (default 14s) with an active phase (default 5s) at the start.
- Active phase: enemies gain a speed boost & brighter/faster pulse.
- Inactive phase: enemies revert to slower base speed and softer pulse but still lethal.
- Picking up a power antigen still forces frightened state (overrides activation until it ends).

Performance Considerations:
- All animations are procedurally drawn (no images except optional reference SVG) keeping asset weight near-zero.
- Effects scale gracefully on mobile; can be toggled or simplified in a future settings panel if needed.

## License
MIT
