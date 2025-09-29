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

## Controls
- Move: Arrow keys or WASD
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

## License
MIT
