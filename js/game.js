// Game state management

class Game {
    constructor() {
        this.grid = new Grid();
        this.player = new Player(this.grid);
        this.floodFill = new FloodFill(this.grid);
        this.powerUpManager = new PowerUpManager();
        this.ui = new UI();
        this.enemies = [];

        this.state = {
            screen: 'menu', // menu, playing, paused, gameover, levelcomplete
            level: 1,
            score: 0,
            lives: CONSTANTS.INITIAL_LIVES,
            fillPercentage: 0,
            fillRequired: 0.5,
            highScore: this.loadHighScore()
        };

        this.lastTime = 0;
        this.deathCooldown = 0;
        this.showDebug = false; // Toggle with 'D' key
        this.showProgressBar = true; // Toggle with 'M' key
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('xonix_highscore')) || 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            if (this.state.score > this.state.highScore) {
                this.state.highScore = this.state.score;
                localStorage.setItem('xonix_highscore', this.state.highScore.toString());
            }
        } catch (e) {
            // localStorage not available
        }
    }

    start() {
        this.state.screen = 'playing';
        this.state.level = 1;
        this.state.score = 0;
        this.state.lives = CONSTANTS.INITIAL_LIVES;
        this.initLevel();
    }

    initLevel() {
        this.grid.init();
        this.player.reset();
        this.powerUpManager.reset();

        // Get level configuration
        const levelConfig = CONSTANTS.LEVELS[Math.min(this.state.level - 1, CONSTANTS.LEVELS.length - 1)];
        this.state.fillRequired = levelConfig.fillRequired;
        this.state.fillPercentage = 0;

        // Create enemies for this level
        this.enemies = createEnemiesForLevel(this.state.level, this.grid);
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.state.screen !== 'playing') return;

        // Death cooldown
        if (this.deathCooldown > 0) {
            this.deathCooldown -= deltaTime;
            return;
        }

        // Update power-ups FIRST (so shield protects immediately when collected)
        this.powerUpManager.update(this.grid, this.player, this.enemies, currentTime, this.state);

        // Update player
        const playerResult = this.player.update();

        if (playerResult.status === 'death') {
            this.handleDeath();
            return;
        }

        if (playerResult.status === 'capture') {
            this.handleCapture();
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(this.grid);

            // Check if enemy touches trail (shield protects)
            if (enemy.type === 'basic' && !this.player.hasShield) {
                const hitTrail = enemy.checkTrailCollision(this.grid);
                if (hitTrail) {
                    this.handleDeath();
                    return;
                }
            }
        }

        // Check player collision with enemies
        const playerHit = this.player.checkEnemyCollision(this.enemies);
        if (playerHit) {
            this.handleDeath();
            return;
        }

        // Update fill percentage
        this.state.fillPercentage = this.grid.getFillPercentage();

        // Check level complete
        if (this.state.fillPercentage >= this.state.fillRequired) {
            this.handleLevelComplete();
        }
    }

    handleCapture() {
        // Perform flood fill to capture territory
        const cellsClaimed = this.floodFill.capture(this.enemies);

        // Calculate score
        const percentClaimed = cellsClaimed / this.grid.totalClaimable;
        const scoreGained = Math.floor(percentClaimed * 100 * CONSTANTS.SCORE_PER_PERCENT);
        this.state.score += scoreGained;

        // Play sound
        audioManager.playCapture();
    }

    handleDeath() {
        this.state.lives--;
        audioManager.playDeath();

        // Clear trail
        this.grid.clearTrail();

        if (this.state.lives <= 0) {
            this.handleGameOver();
        } else {
            // Reset player position
            this.player.reset();

            // Move border enemies FAR from player spawn (top-center)
            this.repositionBorderEnemies();

            this.deathCooldown = 1000; // 1 second cooldown
        }
    }

    repositionBorderEnemies() {
        const borderSize = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE;
        // Safe positions far from player (who spawns at top-center)
        const safePositions = [
            { x: borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT - borderSize / 2 },  // Bottom-left
            { x: CONSTANTS.CANVAS_WIDTH - borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT - borderSize / 2 },  // Bottom-right
            { x: borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT * 0.7 },  // Left-lower
            { x: CONSTANTS.CANVAS_WIDTH - borderSize / 2, y: CONSTANTS.CANVAS_HEIGHT * 0.7 }  // Right-lower
        ];

        let posIndex = 0;
        for (const enemy of this.enemies) {
            if (enemy.type === 'border') {
                const pos = safePositions[posIndex % safePositions.length];
                enemy.x = pos.x;
                enemy.y = pos.y;
                posIndex++;
            }
        }
    }

    handleLevelComplete() {
        this.state.screen = 'levelcomplete';
        this.state.score += CONSTANTS.SCORE_LEVEL_BONUS;
        audioManager.playLevelUp();
    }

    nextLevel() {
        this.state.level++;
        this.state.screen = 'playing';
        this.initLevel();
    }

    handleGameOver() {
        this.state.screen = 'gameover';
        this.saveHighScore();
        audioManager.playGameOver();
    }

    togglePause() {
        if (this.state.screen === 'playing') {
            this.state.screen = 'paused';
        } else if (this.state.screen === 'paused') {
            this.state.screen = 'playing';
        }
    }

    handleKeyDown(key) {
        audioManager.resume(); // Resume audio context on user interaction

        switch (this.state.screen) {
            case 'menu':
                if (key === ' ') {
                    this.start();
                }
                break;

            case 'playing':
                switch (key) {
                    case 'ArrowUp':
                        this.player.setDirection(0, -1);
                        break;
                    case 'ArrowDown':
                        this.player.setDirection(0, 1);
                        break;
                    case 'ArrowLeft':
                        this.player.setDirection(-1, 0);
                        break;
                    case 'ArrowRight':
                        this.player.setDirection(1, 0);
                        break;
                    case ' ':
                        // Spacebar stops movement anywhere
                        this.player.stop();
                        break;
                    case 'p':
                    case 'P':
                        this.togglePause();
                        break;
                    case 'm':
                    case 'M':
                        this.showProgressBar = !this.showProgressBar;
                        break;
                    case 'n':
                    case 'N':
                        audioManager.toggle();
                        break;
                    case 'd':
                    case 'D':
                        this.showDebug = !this.showDebug;
                        break;
                }
                break;

            case 'paused':
                // Any key unpauses
                this.togglePause();
                break;

            case 'gameover':
                if (key === ' ') {
                    this.start();
                }
                break;

            case 'levelcomplete':
                if (key === ' ') {
                    this.nextLevel();
                }
                break;
        }
    }

    handleKeyUp(key) {
        // Classic Xonix: player keeps moving once direction is set
        // No stopping on key release
    }

    render(ctx, currentTime) {
        // Clear canvas
        ctx.clearRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        if (this.state.screen === 'menu') {
            // Draw background for menu
            ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
            ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);
        } else {
            // Render grid
            this.grid.render(ctx);

            // Render power-ups
            this.powerUpManager.render(ctx);

            // Render enemies
            for (const enemy of this.enemies) {
                enemy.render(ctx);
            }

            // Render player
            this.player.render(ctx);

            // Render active power-up effects
            this.powerUpManager.renderActiveEffects(ctx, currentTime);
        }

        // Render UI
        this.ui.render(ctx, this.state, this.showProgressBar);

        // Debug info (toggle with 'D' key)
        if (this.showDebug) {
            ctx.fillStyle = '#ff0';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            const debugY = CONSTANTS.CANVAS_HEIGHT / 2 + 100;
            ctx.fillText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) dx:${this.player.dx} dy:${this.player.dy}`, CONSTANTS.CANVAS_WIDTH / 2, debugY);
            ctx.fillText(`isDrawing: ${this.player.isDrawing} | Screen: ${this.state.screen} | Shield: ${this.player.hasShield}`, CONSTANTS.CANVAS_WIDTH / 2, debugY + 15);
        }
    }
}
