// Grid system for territory management
class Grid {
    constructor() {
        this.cols = CONSTANTS.GRID_COLS;
        this.rows = CONSTANTS.GRID_ROWS;
        this.cellSize = CONSTANTS.CELL_SIZE;
        this.cells = [];
        this.totalClaimable = 0;
        this.claimedCount = 0;

        this.init();
    }

    init() {
        // Initialize grid with borders
        this.cells = [];
        this.claimedCount = 0;

        for (let y = 0; y < this.rows; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.cols; x++) {
                // Set border cells
                if (this.isBorderCell(x, y)) {
                    this.cells[y][x] = CONSTANTS.CELL_BORDER;
                } else {
                    this.cells[y][x] = CONSTANTS.CELL_EMPTY;
                }
            }
        }

        // Calculate total claimable area (non-border cells)
        this.totalClaimable = (this.cols - CONSTANTS.BORDER_SIZE * 2) *
                              (this.rows - CONSTANTS.BORDER_SIZE * 2);
    }

    isBorderCell(x, y) {
        return x < CONSTANTS.BORDER_SIZE ||
               x >= this.cols - CONSTANTS.BORDER_SIZE ||
               y < CONSTANTS.BORDER_SIZE ||
               y >= this.rows - CONSTANTS.BORDER_SIZE;
    }

    getCell(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return -1; // Out of bounds
        }
        return this.cells[y][x];
    }

    setCell(x, y, value) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            const oldValue = this.cells[y][x];
            this.cells[y][x] = value;

            // Update claimed count
            if (oldValue !== CONSTANTS.CELL_CLAIMED && value === CONSTANTS.CELL_CLAIMED) {
                this.claimedCount++;
            } else if (oldValue === CONSTANTS.CELL_CLAIMED && value !== CONSTANTS.CELL_CLAIMED) {
                this.claimedCount--;
            }
        }
    }

    // Convert pixel coordinates to grid coordinates
    pixelToGrid(px, py) {
        return {
            x: Math.floor(px / this.cellSize),
            y: Math.floor(py / this.cellSize)
        };
    }

    // Convert grid coordinates to pixel coordinates (center of cell)
    gridToPixel(gx, gy) {
        return {
            x: gx * this.cellSize + this.cellSize / 2,
            y: gy * this.cellSize + this.cellSize / 2
        };
    }

    // Check if position is in safe zone (border or claimed)
    isSafeZone(gx, gy) {
        const cell = this.getCell(gx, gy);
        return cell === CONSTANTS.CELL_BORDER || cell === CONSTANTS.CELL_CLAIMED;
    }

    // Get fill percentage
    getFillPercentage() {
        return this.claimedCount / this.totalClaimable;
    }

    // Set trail at position
    setTrail(gx, gy) {
        if (this.getCell(gx, gy) === CONSTANTS.CELL_EMPTY) {
            this.setCell(gx, gy, CONSTANTS.CELL_TRAIL);
            return true;
        }
        return false;
    }

    // Check if position has trail
    isTrail(gx, gy) {
        return this.getCell(gx, gy) === CONSTANTS.CELL_TRAIL;
    }

    // Clear all trail cells (on death)
    clearTrail() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.cells[y][x] === CONSTANTS.CELL_TRAIL) {
                    this.cells[y][x] = CONSTANTS.CELL_EMPTY;
                }
            }
        }
    }

    // Convert trail to claimed (after successful capture)
    claimTrail() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.cells[y][x] === CONSTANTS.CELL_TRAIL) {
                    this.setCell(x, y, CONSTANTS.CELL_CLAIMED);
                }
            }
        }
    }

    // Render the grid
    render(ctx) {
        const theme = themeManager.get();

        // Draw background
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        // Draw subtle grid lines (only in neon theme)
        if (theme.pixelated) {
            ctx.strokeStyle = CONSTANTS.COLORS.GRID_LINE;
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= this.cols; x++) {
                ctx.beginPath();
                ctx.moveTo(x * this.cellSize, 0);
                ctx.lineTo(x * this.cellSize, CONSTANTS.CANVAS_HEIGHT);
                ctx.stroke();
            }
            for (let y = 0; y <= this.rows; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * this.cellSize);
                ctx.lineTo(CONSTANTS.CANVAS_WIDTH, y * this.cellSize);
                ctx.stroke();
            }
        }

        // Draw cells
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.cells[y][x];
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                if (cell === CONSTANTS.CELL_BORDER) {
                    // Border
                    if (theme.pixelated && theme.useGlow) {
                        ctx.shadowColor = theme.borderGlow;
                        ctx.shadowBlur = theme.glowIntensity / 3;
                    }
                    ctx.fillStyle = theme.border;
                    ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    ctx.shadowBlur = 0;
                } else if (cell === CONSTANTS.CELL_CLAIMED) {
                    // Claimed area
                    ctx.fillStyle = theme.claimed;
                    ctx.fillRect(px, py, this.cellSize, this.cellSize);
                } else if (cell === CONSTANTS.CELL_TRAIL) {
                    // Trail
                    if (theme.pixelated && theme.useGlow) {
                        ctx.shadowColor = theme.trailGlow;
                        ctx.shadowBlur = theme.glowIntensity;
                    }
                    ctx.fillStyle = theme.trail;
                    ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    ctx.shadowBlur = 0;
                }
            }
        }

        // Modern theme: Draw smooth border outline
        if (!theme.pixelated) {
            const borderWidth = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE;
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = 2;
            ctx.strokeRect(borderWidth, borderWidth,
                CONSTANTS.CANVAS_WIDTH - borderWidth * 2,
                CONSTANTS.CANVAS_HEIGHT - borderWidth * 2);
        }
    }
}
