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
        const theme = themeManager.get();
        switch (this.type) {
            case POWERUP_TYPES.SPEED: return theme.powerupSpeed;
            case POWERUP_TYPES.FREEZE: return theme.powerupFreeze;
            case POWERUP_TYPES.SHIELD: return theme.powerupShield;
            case POWERUP_TYPES.SLOWMO: return theme.powerupSlowmo;
            case POWERUP_TYPES.LIFE: return theme.powerupLife;
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
        const theme = themeManager.get();
        const pulseSize = this.size + Math.sin(this.pulsePhase) * 3;
        const color = this.getColor();

        if (theme.pixelated) {
            // Neon theme: Simple circle with glow
            if (theme.useGlow) {
                ctx.shadowColor = color;
                ctx.shadowBlur = theme.glowIntensity + 5;
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Modern theme: Glossy orb with gradient
            const gradient = ctx.createRadialGradient(
                this.x - 3, this.y - 3, 0,
                this.x, this.y, pulseSize / 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.4, color);
            gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y - 2, pulseSize / 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = theme.pixelated ? '#000000' : 'rgba(0,0,0,0.8)';
        ctx.font = `bold ${theme.pixelated ? 10 : 11}px ${theme.font}`;
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
        const theme = themeManager.get();
        let y = 100;
        const x = CONSTANTS.CANVAS_WIDTH - 120;

        for (const [type, effect] of Object.entries(this.activeEffects)) {
            if (effect.active) {
                const remaining = Math.ceil((effect.endTime - currentTime) / 1000);
                const color = this.getEffectColor(type);

                if (theme.useGlow) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10;
                }
                ctx.fillStyle = color;
                ctx.font = `12px ${theme.font}`;
                ctx.textAlign = 'right';
                ctx.fillText(`${type.toUpperCase()}: ${remaining}s`, x + 100, y);
                ctx.shadowBlur = 0;

                y += 20;
            }
        }
    }

    getEffectColor(type) {
        const theme = themeManager.get();
        switch (type) {
            case 'speed': return theme.powerupSpeed;
            case 'freeze': return theme.powerupFreeze;
            case 'shield': return theme.powerupShield;
            case 'slowmo': return theme.powerupSlowmo;
            default: return '#ffffff';
        }
    }
}
