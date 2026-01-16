// Player class
class Player {
    constructor(grid) {
        this.grid = grid;
        this.reset();
    }

    reset() {
        // Start at top-center of the border (center of border cells)
        this.x = CONSTANTS.CANVAS_WIDTH / 2;
        this.y = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE / 2 + CONSTANTS.CELL_SIZE / 2;
        this.dx = 0;
        this.dy = 0;
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.size = CONSTANTS.PLAYER_SIZE;
        this.isDrawing = false;
        this.trail = [];
        this.hasShield = false;
        this.speedBoost = false;
    }

    setDirection(dx, dy) {
        // Prevent reversing direction while drawing (would cause instant death)
        if (this.isDrawing) {
            // Can't go directly backward
            if ((dx !== 0 && dx === -this.dx) || (dy !== 0 && dy === -this.dy)) {
                return; // Ignore backward input
            }
        }

        // Only allow one direction at a time (no diagonals)
        if (dx !== 0) {
            this.dx = dx;
            this.dy = 0;
        } else if (dy !== 0) {
            this.dx = 0;
            this.dy = dy;
        }
    }

    stop() {
        this.dx = 0;
        this.dy = 0;
    }

    update(timeScale = 1) {
        if (this.dx === 0 && this.dy === 0) return { status: 'idle' };

        const currentSpeed = this.speedBoost ? this.speed * 2 : this.speed;
        const scaledSpeed = currentSpeed * timeScale;
        let newX = this.x + this.dx * scaledSpeed;
        let newY = this.y + this.dy * scaledSpeed;

        // Check boundaries (stay within the playable area)
        const minBound = CONSTANTS.CELL_SIZE / 2;
        const maxXBound = CONSTANTS.CANVAS_WIDTH - CONSTANTS.CELL_SIZE / 2;
        const maxYBound = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.CELL_SIZE / 2;

        // Clamp to boundaries
        newX = Math.max(minBound, Math.min(maxXBound, newX));
        newY = Math.max(minBound, Math.min(maxYBound, newY));

        // Get grid positions
        const currentGrid = this.grid.pixelToGrid(this.x, this.y);
        const newGrid = this.grid.pixelToGrid(newX, newY);

        const currentInSafe = this.grid.isSafeZone(currentGrid.x, currentGrid.y);
        const newInSafe = this.grid.isSafeZone(newGrid.x, newGrid.y);

        // Check for self-intersection (death)
        // Only die if entering a trail cell that's NOT our current cell
        if (this.isDrawing && this.grid.isTrail(newGrid.x, newGrid.y)) {
            // Check if this is a different cell than our most recent trail position
            const lastTrail = this.trail.length > 0 ? this.trail[this.trail.length - 1] : null;
            const isCurrentCell = lastTrail && lastTrail.x === newGrid.x && lastTrail.y === newGrid.y;

            if (!isCurrentCell && !this.hasShield) {
                return { status: 'death', reason: 'self-intersection' };
            }
        }

        // Update position
        this.x = newX;
        this.y = newY;

        // Handle state transitions
        if (currentInSafe && !newInSafe) {
            // Leaving safe zone - start drawing
            this.isDrawing = true;
            this.trail = [];
        }

        if (this.isDrawing && !newInSafe) {
            // Fill in all cells between current and new position (for high speed)
            const lastTrailPos = this.trail.length > 0 ? this.trail[this.trail.length - 1] : currentGrid;

            // Calculate all cells to fill - only in the direction of movement
            const cellsToFill = [];

            if (this.dx !== 0) {
                // Moving horizontally
                const step = this.dx > 0 ? 1 : -1;
                let cx = lastTrailPos.x + step;
                const targetX = newGrid.x;
                while ((step > 0 && cx <= targetX) || (step < 0 && cx >= targetX)) {
                    if (!this.grid.isSafeZone(cx, newGrid.y)) {
                        cellsToFill.push({ x: cx, y: newGrid.y });
                    }
                    cx += step;
                }
            } else if (this.dy !== 0) {
                // Moving vertically
                const step = this.dy > 0 ? 1 : -1;
                let cy = lastTrailPos.y + step;
                const targetY = newGrid.y;
                while ((step > 0 && cy <= targetY) || (step < 0 && cy >= targetY)) {
                    if (!this.grid.isSafeZone(newGrid.x, cy)) {
                        cellsToFill.push({ x: newGrid.x, y: cy });
                    }
                    cy += step;
                }
            }

            // Add all cells to trail
            for (const cell of cellsToFill) {
                // Check for self-intersection on each cell
                if (this.grid.isTrail(cell.x, cell.y) && !this.hasShield) {
                    const isRecentCell = this.trail.length > 0 &&
                        this.trail[this.trail.length - 1].x === cell.x &&
                        this.trail[this.trail.length - 1].y === cell.y;
                    if (!isRecentCell) {
                        return { status: 'death', reason: 'self-intersection' };
                    }
                }

                if (this.trail.length === 0 ||
                    this.trail[this.trail.length - 1].x !== cell.x ||
                    this.trail[this.trail.length - 1].y !== cell.y) {
                    this.trail.push(cell);
                    this.grid.setTrail(cell.x, cell.y);
                }
            }

            // Snap player to cell center for cleaner trail alignment
            const cellCenter = this.grid.gridToPixel(newGrid.x, newGrid.y);
            if (this.dx !== 0) {
                this.y = cellCenter.y; // Snap Y when moving horizontally
            }
            if (this.dy !== 0) {
                this.x = cellCenter.x; // Snap X when moving vertically
            }
        }

        if (this.isDrawing && newInSafe) {
            // Returned to safe zone - capture territory and stop
            this.isDrawing = false;
            this.stop(); // Auto-stop when reaching safe zone
            const trailCopy = [...this.trail];
            this.trail = [];
            return { status: 'capture', trail: trailCopy };
        }

        return { status: 'moving' };
    }

    // Check collision with enemies
    checkEnemyCollision(enemies) {
        if (this.hasShield) return false;

        for (const enemy of enemies) {
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision threshold - generous for better gameplay
            const collisionDist = (this.size + enemy.size) / 2 + 4;

            if (distance < collisionDist) {
                // Basic enemies kill when player is drawing (in the field)
                if (enemy.type === 'basic' && this.isDrawing) {
                    return true;
                }
                // Border enemies ALWAYS kill on contact (even on border!)
                if (enemy.type === 'border') {
                    return true;
                }
            }
        }
        return false;
    }

    render(ctx) {
        const theme = themeManager.get();

        if (theme.pixelated) {
            // Neon theme: Simple circles with glow
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2 + 3, 0, Math.PI * 2);
            ctx.fill();

            if (theme.useGlow) {
                ctx.shadowColor = theme.playerGlow;
                ctx.shadowBlur = theme.glowIntensity;
            }

            ctx.fillStyle = theme.playerOuter;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.player;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Modern theme: Polished sphere with gradient
            const gradient = ctx.createRadialGradient(
                this.x - 3, this.y - 3, 0,
                this.x, this.y, this.size / 2 + 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.4, theme.player);
            gradient.addColorStop(1, theme.playerGlow);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Subtle highlight
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y - 2, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw shield effect if active
        if (this.hasShield) {
            ctx.shadowColor = theme.powerupShield;
            ctx.shadowBlur = theme.useGlow ? 20 : 5;
            ctx.strokeStyle = theme.powerupShield;
            ctx.lineWidth = theme.pixelated ? 3 : 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 4, 0, Math.PI * 2);
            ctx.stroke();
            if (theme.pixelated) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
    }
}
