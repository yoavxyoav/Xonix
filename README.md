# Xonix - Neon Edition

A modern remake of the classic Xonix arcade game with a neon/synthwave aesthetic.

## How to Play

1. Open `index.html` in a web browser
2. Press **SPACE** to start the game
3. Use **Arrow Keys** to move your player
4. Capture territory by drawing lines and returning to the safe zone
5. Avoid enemies and don't cross your own trail!

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move player |
| SPACE | Start game / Stop movement |
| P | Pause (any key resumes) |
| M | Toggle progress bar |
| N | Mute/Unmute sound |
| D | Toggle debug info |

## Game Rules

- **Objective**: Fill the required percentage of the playing field to advance
- **Safe Zone**: The cyan border and claimed (purple) areas are safe
- **Drawing**: When you leave the safe zone, you draw a trail
- **Capturing**: Return to any safe zone to capture the area without enemies
- **Death**: Touching your own trail, or getting hit by enemies kills you
- **Lives**: You start with 3 lives

## Enemies

- **Pink Diamonds**: Bounce around in the unclaimed area. They kill you if they touch your trail.
- **Yellow Squares**: Travel along the borders. They kill you on contact.

## Power-ups

| Symbol | Effect | Duration |
|--------|--------|----------|
| S | Speed Boost (2x speed) | 5 seconds |
| F | Freeze (enemies stop) | 3 seconds |
| H | Shield (invincible to enemies) | 5 seconds |
| M | Slow-Mo (enemies at half speed) | 5 seconds |
| ♥ | Extra Life (+1 life) | Instant |

## Level Progression

| Level | Fill Required | Enemies |
|-------|---------------|---------|
| 1 | 50% | 1 basic + 1 border |
| 2 | 55% | 2 basic + 1 border |
| 3 | 60% | 2 basic + 2 border |
| ... | ... | ... |
| 7+ | 80% | 4+ of each |

## Tech Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- Web Audio API for synthesized retro sounds
- CSS for neon glow effects

## Project Structure

```
Xonix/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Neon styling + CRT effects
├── js/
│   ├── constants.js    # Game constants
│   ├── grid.js         # Territory management
│   ├── fill.js         # Flood fill algorithm
│   ├── player.js       # Player class
│   ├── enemy.js        # Enemy classes
│   ├── powerup.js      # Power-up system
│   ├── audio.js        # Sound effects
│   ├── ui.js           # UI rendering
│   ├── game.js         # Game state
│   └── main.js         # Entry point
└── README.md
```

## Running Locally

Simply open `index.html` in any modern web browser. No server required.

For development with live reload, you can use any simple HTTP server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

Then open http://localhost:8000 in your browser.

## Attribution

This game is inspired by **Xonix**, a DOS game designed by **Ilan Rav** and **Dani Katz** and released in 1984. The original Xonix was itself inspired by Taito's **Qix** (1981).

This implementation is a modern remake with original code, featuring a neon/synthwave visual style, power-up system, and synthesized audio.
