// Power-up system

const POWERUP_TYPES = {
    SPEED: 'speed',
    FREEZE: 'freeze',
    SHIELD: 'shield',
    SLOWMO: 'slowmo',
    LIFE: 'life'
};

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = CONSTANTS.POWERUP_SIZE;
        this.collected = false;
        this.pulsePhase = 0;
    }

    update() {
        // Pulsing animation
        this.pulsePhase += 0.1;
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + player.size) / 2;
    }

    getColor() {
        switch (this.type) {
            case POWERUP_TYPES.SPEED: return CONSTANTS.COLORS.POWERUP_SPEED;
            case POWERUP_TYPES.FREEZE: return CONSTANTS.COLORS.POWERUP_FREEZE;
            case POWERUP_TYPES.SHIELD: return CONSTANTS.COLORS.POWERUP_SHIELD;
            case POWERUP_TYPES.SLOWMO: return CONSTANTS.COLORS.POWERUP_SLOWMO;
            case POWERUP_TYPES.LIFE: return CONSTANTS.COLORS.POWERUP_LIFE;
            default: return '#ffffff';
        }
    }

    getSymbol() {
        switch (this.type) {
            case POWERUP_TYPES.SPEED: return 'S';
            case POWERUP_TYPES.FREEZE: return 'F';
            case POWERUP_TYPES.SHIELD: return 'H';
            case POWERUP_TYPES.SLOWMO: return 'M';
            case POWERUP_TYPES.LIFE: return '♥';
            default: return '?';
        }
    }

    render(ctx) {
        const pulseSize = this.size + Math.sin(this.pulsePhase) * 3;
        const color = this.getColor();

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;

        // Draw circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getSymbol(), this.x, this.y);
    }
}

class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.activeEffects = {
            speed: { active: false, endTime: 0 },
            freeze: { active: false, endTime: 0 },
            shield: { active: false, endTime: 0 },
            slowmo: { active: false, endTime: 0 }
        };
    }

    reset() {
        this.powerUps = [];
        this.activeEffects = {
            speed: { active: false, endTime: 0 },
            freeze: { active: false, endTime: 0 },
            shield: { active: false, endTime: 0 },
            slowmo: { active: false, endTime: 0 }
        };
    }

    update(grid, player, enemies, currentTime, gameState) {
        // Maybe spawn a new power-up
        if (Math.random() < CONSTANTS.POWERUP_SPAWN_CHANCE && this.powerUps.length < 3) {
            this.spawnPowerUp(grid);
        }

        // Update existing power-ups
        for (const powerUp of this.powerUps) {
            powerUp.update();

            // Check collision with player
            if (powerUp.checkCollision(player)) {
                this.collectPowerUp(powerUp, player, enemies, currentTime, gameState);
            }
        }

        // Remove collected power-ups
        this.powerUps = this.powerUps.filter(p => !p.collected);

        // Update active effects
        this.updateActiveEffects(player, enemies, currentTime);
    }

    spawnPowerUp(grid) {
        // Find a valid spawn position (in empty area)
        let attempts = 0;
        while (attempts < 50) {
            const x = CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 3) +
                      Math.random() * (CONSTANTS.CANVAS_WIDTH - CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 6));
            const y = CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 3) +
                      Math.random() * (CONSTANTS.CANVAS_HEIGHT - CONSTANTS.CELL_SIZE * (CONSTANTS.BORDER_SIZE + 6));

            const gridPos = grid.pixelToGrid(x, y);
            if (grid.getCell(gridPos.x, gridPos.y) === CONSTANTS.CELL_EMPTY) {
                // Random type
                const types = Object.values(POWERUP_TYPES);
                const type = types[Math.floor(Math.random() * types.length)];
                this.powerUps.push(new PowerUp(x, y, type));
                return;
            }
            attempts++;
        }
    }

    collectPowerUp(powerUp, player, enemies, currentTime, gameState) {
        powerUp.collected = true;

        // Life is instant, no duration
        if (powerUp.type === POWERUP_TYPES.LIFE) {
            if (gameState) {
                gameState.lives++;
                audioManager.playCapture(); // Reuse capture sound for life pickup
            }
            return;
        }

        const duration = CONSTANTS.POWERUP_DURATION[powerUp.type.toUpperCase()];
        this.activeEffects[powerUp.type] = {
            active: true,
            endTime: currentTime + duration
        };

        // Apply immediate effects
        switch (powerUp.type) {
            case POWERUP_TYPES.SPEED:
                player.speedBoost = true;
                break;
            case POWERUP_TYPES.FREEZE:
                for (const enemy of enemies) {
                    enemy.frozen = true;
                }
                break;
            case POWERUP_TYPES.SHIELD:
                player.hasShield = true;
                break;
            case POWERUP_TYPES.SLOWMO:
                for (const enemy of enemies) {
                    enemy.slowMo = true;
                }
                break;
        }
    }

    updateActiveEffects(player, enemies, currentTime) {
        // Check speed boost
        if (this.activeEffects.speed.active && currentTime >= this.activeEffects.speed.endTime) {
            this.activeEffects.speed.active = false;
            player.speedBoost = false;
        }

        // Check freeze
        if (this.activeEffects.freeze.active && currentTime >= this.activeEffects.freeze.endTime) {
            this.activeEffects.freeze.active = false;
            for (const enemy of enemies) {
                enemy.frozen = false;
            }
        }

        // Check shield
        if (this.activeEffects.shield.active && currentTime >= this.activeEffects.shield.endTime) {
            this.activeEffects.shield.active = false;
            player.hasShield = false;
        }

        // Check slow-mo
        if (this.activeEffects.slowmo.active && currentTime >= this.activeEffects.slowmo.endTime) {
            this.activeEffects.slowmo.active = false;
            for (const enemy of enemies) {
                enemy.slowMo = false;
            }
        }
    }

    render(ctx) {
        for (const powerUp of this.powerUps) {
            powerUp.render(ctx);
        }
    }

    // Render active effect indicators
    renderActiveEffects(ctx, currentTime) {
        let y = 100;
        const x = CONSTANTS.CANVAS_WIDTH - 120;

        for (const [type, effect] of Object.entries(this.activeEffects)) {
            if (effect.active) {
                const remaining = Math.ceil((effect.endTime - currentTime) / 1000);
                const color = this.getEffectColor(type);

                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = color;
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`${type.toUpperCase()}: ${remaining}s`, x + 100, y);
                ctx.shadowBlur = 0;

                y += 20;
            }
        }
    }

    getEffectColor(type) {
        switch (type) {
            case 'speed': return CONSTANTS.COLORS.POWERUP_SPEED;
            case 'freeze': return CONSTANTS.COLORS.POWERUP_FREEZE;
            case 'shield': return CONSTANTS.COLORS.POWERUP_SHIELD;
            case 'slowmo': return CONSTANTS.COLORS.POWERUP_SLOWMO;
            default: return '#ffffff';
        }
    }
}
