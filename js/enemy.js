// Enemy classes

// Base enemy class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = CONSTANTS.ENEMY_SIZE;
        this.frozen = false;
        this.slowMo = false;
    }

    getSpeed() {
        if (this.frozen) return 0;
        if (this.slowMo) return this.baseSpeed * 0.5;
        return this.baseSpeed;
    }

    render(ctx) {
        // Override in subclasses
    }
}

// Basic enemy - bounces around in unclaimed territory
class BasicEnemy extends Enemy {
    constructor(x, y, level = 1) {
        super(x, y, 'basic');
        // Speed increases 10% per level
        this.baseSpeed = CONSTANTS.ENEMY_BASE_SPEED * (1 + (level - 1) * 0.1);

        // Random initial direction
        const angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    }

    update(grid, timeScale = 1) {
        const speed = this.getSpeed() * timeScale;
        if (speed === 0) return;

        const newX = this.x + this.dx * speed;
        const newY = this.y + this.dy * speed;

        // Check collision with walls (border, claimed, or trail)
        const gridPos = grid.pixelToGrid(newX, newY);
        const cell = grid.getCell(gridPos.x, gridPos.y);

        // Check each direction for bouncing
        const gridPosX = grid.pixelToGrid(newX, this.y);
        const gridPosY = grid.pixelToGrid(this.x, newY);

        const cellX = grid.getCell(gridPosX.x, gridPosX.y);
        const cellY = grid.getCell(gridPosY.x, gridPosY.y);

        let bounced = false;

        // Bounce off non-empty cells
        if (cellX !== CONSTANTS.CELL_EMPTY) {
            this.dx = -this.dx;
            bounced = true;
        }

        if (cellY !== CONSTANTS.CELL_EMPTY) {
            this.dy = -this.dy;
            bounced = true;
        }

        // Move if no collision
        if (!bounced || cell === CONSTANTS.CELL_EMPTY) {
            // Check boundaries
            if (newX > this.size / 2 && newX < CONSTANTS.CANVAS_WIDTH - this.size / 2) {
                this.x = newX;
            } else {
                this.dx = -this.dx;
            }

            if (newY > this.size / 2 && newY < CONSTANTS.CANVAS_HEIGHT - this.size / 2) {
                this.y = newY;
            } else {
                this.dy = -this.dy;
            }
        }

        // If stuck in claimed area, try to escape
        const currentCell = grid.getCell(gridPos.x, gridPos.y);
        if (currentCell !== CONSTANTS.CELL_EMPTY) {
            this.escapeToEmpty(grid);
        }
    }

    escapeToEmpty(grid) {
        // Try to find nearest empty cell
        const gridPos = grid.pixelToGrid(this.x, this.y);
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        for (const [dx, dy] of directions) {
            const checkX = gridPos.x + dx;
            const checkY = gridPos.y + dy;
            if (grid.getCell(checkX, checkY) === CONSTANTS.CELL_EMPTY) {
                const pixel = grid.gridToPixel(checkX, checkY);
                this.x = pixel.x;
                this.y = pixel.y;
                return;
            }
        }
    }

    // Check if enemy touches player trail (check all corners of enemy)
    checkTrailCollision(grid) {
        const halfSize = this.size / 2;
        // Check center and all corners
        const positions = [
            grid.pixelToGrid(this.x, this.y),
            grid.pixelToGrid(this.x - halfSize, this.y),
            grid.pixelToGrid(this.x + halfSize, this.y),
            grid.pixelToGrid(this.x, this.y - halfSize),
            grid.pixelToGrid(this.x, this.y + halfSize)
        ];

        for (const pos of positions) {
            if (grid.isTrail(pos.x, pos.y)) {
                return true;
            }
        }
        return false;
    }

    render(ctx) {
        const theme = themeManager.get();

        if (theme.useGlow) {
            ctx.shadowColor = theme.enemyBasicGlow;
            ctx.shadowBlur = theme.glowIntensity;
        }
        ctx.fillStyle = theme.enemyBasic;

        if (theme.pixelated) {
            // Neon theme: Draw as diamond shape
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y);
            ctx.lineTo(this.x, this.y + this.size / 2);
            ctx.lineTo(this.x - this.size / 2, this.y);
            ctx.closePath();
            ctx.fill();
        } else {
            // Modern theme: Draw as smooth circle with gradient
            const gradient = ctx.createRadialGradient(
                this.x - 2, this.y - 2, 0,
                this.x, this.y, this.size / 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, theme.enemyBasic);
            gradient.addColorStop(1, theme.enemyBasicGlow);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }
}

// Border enemy - bounces within the safe zone (border + claimed areas)
// Kills player on contact (even on the border!)
class BorderEnemy extends Enemy {
    constructor(x, y, level = 1) {
        super(x, y, 'border');
        // Speed increases 10% per level
        this.baseSpeed = CONSTANTS.BORDER_ENEMY_SPEED * 1.2 * (1 + (level - 1) * 0.1);
        // Gentler angle - mostly horizontal or vertical with slight diagonal
        const primaryDir = Math.random() > 0.5 ? 1 : -1;
        const secondaryDir = (Math.random() > 0.5 ? 1 : -1) * 0.3; // Less diagonal
        if (Math.random() > 0.5) {
            this.dx = primaryDir;
            this.dy = secondaryDir;
        } else {
            this.dx = secondaryDir;
            this.dy = primaryDir;
        }
        // Normalize
        const mag = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx /= mag;
        this.dy /= mag;
    }

    update(grid, timeScale = 1) {
        const speed = this.getSpeed() * timeScale;
        if (speed === 0) return;

        const halfSize = this.size / 2;
        const borderPixels = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE; // 20 pixels

        const newX = this.x + this.dx * speed;
        const newY = this.y + this.dy * speed;

        // Check if position is safe (all corners must be in border or claimed)
        const isSafeAt = (x, y) => {
            // Check all corners of the enemy
            const positions = [
                grid.pixelToGrid(x - halfSize, y - halfSize),
                grid.pixelToGrid(x + halfSize, y - halfSize),
                grid.pixelToGrid(x - halfSize, y + halfSize),
                grid.pixelToGrid(x + halfSize, y + halfSize)
            ];
            for (const pos of positions) {
                const cell = grid.getCell(pos.x, pos.y);
                if (cell !== CONSTANTS.CELL_BORDER && cell !== CONSTANTS.CELL_CLAIMED) {
                    return false;
                }
            }
            return true;
        };

        // Check canvas boundaries (keep enemy fully visible)
        const inBounds = (x, y) => {
            return x >= halfSize && x <= CONSTANTS.CANVAS_WIDTH - halfSize &&
                   y >= halfSize && y <= CONSTANTS.CANVAS_HEIGHT - halfSize;
        };

        let bounceX = false;
        let bounceY = false;

        // Check X movement
        if (!inBounds(newX, this.y) || !isSafeAt(newX, this.y)) {
            bounceX = true;
        }

        // Check Y movement
        if (!inBounds(this.x, newY) || !isSafeAt(this.x, newY)) {
            bounceY = true;
        }

        // Apply bounces
        if (bounceX) this.dx = -this.dx;
        if (bounceY) this.dy = -this.dy;

        // Move if no bounce, otherwise stay in place
        if (!bounceX && !bounceY) {
            if (inBounds(newX, newY) && isSafeAt(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
        }

        // Clamp to stay within canvas
        this.x = Math.max(halfSize, Math.min(CONSTANTS.CANVAS_WIDTH - halfSize, this.x));
        this.y = Math.max(halfSize, Math.min(CONSTANTS.CANVAS_HEIGHT - halfSize, this.y));
    }

    render(ctx) {
        const theme = themeManager.get();

        if (theme.useGlow) {
            ctx.shadowColor = theme.enemyBorderGlow;
            ctx.shadowBlur = theme.glowIntensity;
        }
        ctx.fillStyle = theme.enemyBorder;

        if (theme.pixelated) {
            // Neon theme: Draw as square
            ctx.fillRect(
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Modern theme: Draw as rounded rectangle with gradient
            const gradient = ctx.createRadialGradient(
                this.x - 2, this.y - 2, 0,
                this.x, this.y, this.size / 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, theme.enemyBorder);
            gradient.addColorStop(1, theme.enemyBorderGlow);
            ctx.fillStyle = gradient;

            // Rounded rectangle
            const r = 3;
            const x = this.x - this.size / 2;
            const y = this.y - this.size / 2;
            const w = this.size;
            const h = this.size;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }
}

// Factory function to create enemies for a level
function createEnemiesForLevel(level, grid) {
    const enemies = [];
    const levelData = CONSTANTS.LEVELS[Math.min(level - 1, CONSTANTS.LEVELS.length - 1)];

    // Create basic enemies in random positions within the play area
    for (let i = 0; i < levelData.basicEnemies; i++) {
        const x = CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 5) +
                  Math.random() * (CONSTANTS.CANVAS_WIDTH - CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 10));
        const y = CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 5) +
                  Math.random() * (CONSTANTS.CANVAS_HEIGHT - CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 10));
        enemies.push(new BasicEnemy(x, y, level));
    }

    // Create border enemies (bounce within safe zones)
    // Spawn FAR from player (who starts at top-center)
    for (let i = 0; i < levelData.borderEnemies; i++) {
        const borderSize = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE;
        // Spawn at bottom and sides - far from player at top-center
        const startPositions = [
            { x: borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT - borderSize / 2 },  // Bottom-left
            { x: CONSTANTS.CANVAS_WIDTH - borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT - borderSize / 2 },  // Bottom-right
            { x: borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT / 2 },  // Left-middle
            { x: CONSTANTS.CANVAS_WIDTH - borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT / 2 }  // Right-middle
        ];
        const pos = startPositions[i % startPositions.length];
        enemies.push(new BorderEnemy(pos.x, pos.y, level));
    }

    return enemies;
}
