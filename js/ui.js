// UI rendering module

class UI {
    constructor() {
        this.fontLoaded = false;
    }

    render(ctx, gameState, showProgressBar = true) {
        switch (gameState.screen) {
            case 'menu':
                this.renderMenu(ctx, gameState);
                break;
            case 'playing':
                this.renderHUD(ctx, gameState, showProgressBar);
                break;
            case 'paused':
                this.renderHUD(ctx, gameState, showProgressBar);
                this.renderPauseOverlay(ctx);
                break;
            case 'gameover':
                this.renderHUD(ctx, gameState, showProgressBar);
                this.renderGameOver(ctx, gameState);
                break;
            case 'levelcomplete':
                this.renderHUD(ctx, gameState, showProgressBar);
                this.renderLevelComplete(ctx, gameState);
                break;
        }
    }

    renderMenu(ctx, gameState) {
        // Title
        ctx.shadowColor = CONSTANTS.COLORS.BORDER_GLOW;
        ctx.shadowBlur = 30;
        ctx.fillStyle = CONSTANTS.COLORS.BORDER;
        ctx.font = '48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('XONIX', CONSTANTS.CANVAS_WIDTH / 2, 150);

        // Subtitle
        ctx.shadowColor = CONSTANTS.COLORS.TRAIL_GLOW;
        ctx.shadowBlur = 15;
        ctx.fillStyle = CONSTANTS.COLORS.TRAIL;
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('NEON EDITION', CONSTANTS.CANVAS_WIDTH / 2, 200);

        ctx.shadowBlur = 0;

        // Instructions
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '14px "Press Start 2P", monospace';

        const instructions = [
            'Use ARROW KEYS to move',
            'Capture territory by drawing lines',
            'Avoid enemies!',
            'Fill the required % to advance',
            '',
            'Press SPACE to start'
        ];

        instructions.forEach((text, i) => {
            ctx.fillText(text, CONSTANTS.CANVAS_WIDTH / 2, 300 + i * 30);
        });

        // High score
        if (gameState.highScore > 0) {
            ctx.shadowColor = CONSTANTS.COLORS.ENEMY_BORDER_GLOW;
            ctx.shadowBlur = 10;
            ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BORDER;
            ctx.fillText(`HIGH SCORE: ${gameState.highScore}`, CONSTANTS.CANVAS_WIDTH / 2, 520);
            ctx.shadowBlur = 0;
        }

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('P = Pause  |  N = Mute  |  M = Toggle Bar', CONSTANTS.CANVAS_WIDTH / 2, 570);
    }

    renderHUD(ctx, gameState, showProgressBar = true) {
        // Offset to stay inside the border
        const margin = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE + 10;

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'left';

        // Level
        ctx.shadowColor = CONSTANTS.COLORS.BORDER_GLOW;
        ctx.shadowBlur = 10;
        ctx.fillStyle = CONSTANTS.COLORS.BORDER;
        ctx.fillText(`LEVEL ${gameState.level}`, margin, margin + 5);

        // Score
        ctx.shadowColor = CONSTANTS.COLORS.TRAIL_GLOW;
        ctx.fillStyle = CONSTANTS.COLORS.TRAIL;
        ctx.fillText(`SCORE ${gameState.score}`, margin, margin + 25);

        ctx.shadowBlur = 0;

        // Lives (hearts)
        ctx.textAlign = 'right';
        ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BASIC;
        ctx.shadowColor = CONSTANTS.COLORS.ENEMY_BASIC_GLOW;
        ctx.shadowBlur = 10;

        let livesText = '';
        for (let i = 0; i < gameState.lives; i++) {
            livesText += '♥ ';
        }
        ctx.fillText(livesText.trim(), CONSTANTS.CANVAS_WIDTH - margin, margin + 5);

        // Fill percentage
        const fillPercent = Math.floor(gameState.fillPercentage * 100);
        const requiredPercent = Math.floor(gameState.fillRequired * 100);

        ctx.fillStyle = fillPercent >= requiredPercent ? CONSTANTS.COLORS.PLAYER : CONSTANTS.COLORS.TEXT;
        ctx.shadowColor = fillPercent >= requiredPercent ? CONSTANTS.COLORS.PLAYER_GLOW : 'transparent';
        ctx.fillText(`${fillPercent}% / ${requiredPercent}%`, CONSTANTS.CANVAS_WIDTH - margin, margin + 25);

        ctx.shadowBlur = 0;

        // Fill progress bar (toggleable with M key)
        if (showProgressBar) {
            this.renderProgressBar(ctx, gameState.fillPercentage, gameState.fillRequired);
        }
    }

    renderProgressBar(ctx, current, required) {
        const barWidth = 200;
        const barHeight = 10;
        const margin = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE + 8;
        const x = CONSTANTS.CANVAS_WIDTH / 2 - barWidth / 2;
        const y = margin;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Required marker
        ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BORDER;
        ctx.fillRect(x + barWidth * required - 1, y - 2, 2, barHeight + 4);

        // Current fill
        const fillColor = current >= required ? CONSTANTS.COLORS.PLAYER : CONSTANTS.COLORS.TRAIL;
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 5;
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, barWidth * Math.min(current, 1), barHeight);

        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = CONSTANTS.COLORS.BORDER;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    renderPauseOverlay(ctx) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        ctx.textAlign = 'center';

        // Pause title
        ctx.shadowColor = CONSTANTS.COLORS.BORDER_GLOW;
        ctx.shadowBlur = 20;
        ctx.fillStyle = CONSTANTS.COLORS.BORDER;
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.fillText('PAUSED', CONSTANTS.CANVAS_WIDTH / 2, 80);
        ctx.shadowBlur = 0;

        // Game explanation
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '10px "Press Start 2P", monospace';
        const gameInfo = [
            'HOW TO PLAY:',
            '',
            'Use ARROW KEYS to move your player.',
            'Draw lines through the field to capture territory.',
            'Return to the safe zone (border) to claim the area.',
            'Avoid enemies! Pink diamonds roam the field,',
            'yellow squares patrol the border and claimed areas.',
            'Fill the required % to advance to the next level.'
        ];
        gameInfo.forEach((line, i) => {
            if (line === 'HOW TO PLAY:') {
                ctx.fillStyle = CONSTANTS.COLORS.TRAIL;
            } else {
                ctx.fillStyle = CONSTANTS.COLORS.TEXT;
            }
            ctx.fillText(line, CONSTANTS.CANVAS_WIDTH / 2, 130 + i * 22);
        });

        // Power-ups section
        ctx.fillStyle = CONSTANTS.COLORS.TRAIL;
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('POWER-UPS:', CONSTANTS.CANVAS_WIDTH / 2, 340);

        ctx.font = '9px "Press Start 2P", monospace';
        const powerups = [
            { color: CONSTANTS.COLORS.POWERUP_SPEED, text: 'CYAN - Speed Boost (2x speed for 5 sec)' },
            { color: CONSTANTS.COLORS.POWERUP_FREEZE, text: 'BLUE - Freeze (enemies stop for 3 sec)' },
            { color: CONSTANTS.COLORS.POWERUP_SHIELD, text: 'GREEN - Shield (invincible for 5 sec)' },
            { color: CONSTANTS.COLORS.POWERUP_SLOWMO, text: 'ORANGE - Slow-Mo (enemies 0.5x for 5 sec)' },
            { color: CONSTANTS.COLORS.POWERUP_LIFE, text: 'PINK - Extra Life (+1 life)' }
        ];
        powerups.forEach((pu, i) => {
            ctx.fillStyle = pu.color;
            ctx.fillText(pu.text, CONSTANTS.CANVAS_WIDTH / 2, 370 + i * 24);
        });

        // Controls
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('CONTROLS: Arrows=Move | Space=Stop | P=Pause', CONSTANTS.CANVAS_WIDTH / 2, 480);
        ctx.fillText('M=Toggle Bar | N=Mute | D=Debug', CONSTANTS.CANVAS_WIDTH / 2, 502);

        // Resume hint
        ctx.shadowColor = CONSTANTS.COLORS.PLAYER_GLOW;
        ctx.shadowBlur = 10;
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('Press any key to resume', CONSTANTS.CANVAS_WIDTH / 2, 550);
        ctx.shadowBlur = 0;
    }

    renderGameOver(ctx, gameState) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        // Game Over text
        ctx.shadowColor = CONSTANTS.COLORS.ENEMY_BASIC_GLOW;
        ctx.shadowBlur = 30;
        ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BASIC;
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 - 50);

        ctx.shadowBlur = 0;

        // Final score
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillText(`FINAL SCORE: ${gameState.score}`, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 10);

        // High score
        if (gameState.score >= gameState.highScore && gameState.score > 0) {
            ctx.shadowColor = CONSTANTS.COLORS.ENEMY_BORDER_GLOW;
            ctx.shadowBlur = 15;
            ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BORDER;
            ctx.fillText('NEW HIGH SCORE!', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 50);
            ctx.shadowBlur = 0;
        }

        // Restart hint
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('Press SPACE to restart', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 100);
    }

    renderLevelComplete(ctx, gameState) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        // Level Complete text
        ctx.shadowColor = CONSTANTS.COLORS.PLAYER_GLOW;
        ctx.shadowBlur = 30;
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
        ctx.font = '30px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 - 50);

        ctx.shadowBlur = 0;

        // Bonus
        ctx.fillStyle = CONSTANTS.COLORS.ENEMY_BORDER;
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillText(`+${CONSTANTS.SCORE_LEVEL_BONUS} BONUS`, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 10);

        // Next level hint
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('Press SPACE for next level', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 70);
    }
}
