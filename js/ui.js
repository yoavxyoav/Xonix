// UI rendering module

class UI {
    constructor() {
        this.fontLoaded = false;
    }

    // Check if touch device - evaluated each time for reliability
    get isTouchDevice() {
        // Use same check as CSS media query for consistency
        return window.matchMedia('(pointer: coarse)').matches ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
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
        const theme = themeManager.get();
        const font = theme.font;

        // Title
        if (theme.useGlow) {
            ctx.shadowColor = theme.borderGlow;
            ctx.shadowBlur = 30;
        }
        ctx.fillStyle = theme.border;
        ctx.font = `48px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('XONIX', CONSTANTS.CANVAS_WIDTH / 2, 150);

        // Subtitle - shows current theme
        if (theme.useGlow) {
            ctx.shadowColor = theme.trailGlow;
            ctx.shadowBlur = 15;
        }
        ctx.fillStyle = theme.trail;
        ctx.font = `16px ${font}`;
        ctx.fillText(`${theme.name} EDITION`, CONSTANTS.CANVAS_WIDTH / 2, 200);

        ctx.shadowBlur = 0;

        // Instructions
        ctx.fillStyle = theme.text;
        ctx.font = `14px ${font}`;

        const instructions = this.isTouchDevice ? [
            'Use D-PAD to move',
            'Capture territory by drawing lines',
            'Avoid enemies!',
            'Fill the required % to advance',
            '',
            'TAP SCREEN TO START'
        ] : [
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
            if (theme.useGlow) {
                ctx.shadowColor = theme.enemyBorderGlow;
                ctx.shadowBlur = 10;
            }
            ctx.fillStyle = theme.enemyBorder;
            ctx.fillText(`HIGH SCORE: ${gameState.highScore}`, CONSTANTS.CANVAS_WIDTH / 2, 520);
            ctx.shadowBlur = 0;
        }

        // Controls hint - only show on non-touch devices
        if (!this.isTouchDevice) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = `10px ${font}`;
            ctx.fillText('P = Pause | N = Mute | M = Bar | T = Theme', CONSTANTS.CANVAS_WIDTH / 2, 550);
        }

        // Attribution
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `8px ${font}`;
        ctx.fillText('Original game by Ilan Rav & Dani Katz (1984)', CONSTANTS.CANVAS_WIDTH / 2, 575);
        ctx.fillText('Revamped by Yoav and Claude', CONSTANTS.CANVAS_WIDTH / 2, 590);
    }

    renderHUD(ctx, gameState, showProgressBar = true) {
        const theme = themeManager.get();
        const font = theme.font;

        // Offset to stay inside the border
        const margin = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE + 10;

        ctx.font = `12px ${font}`;
        ctx.textAlign = 'left';

        // Level
        if (theme.useGlow) {
            ctx.shadowColor = theme.borderGlow;
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = theme.border;
        ctx.fillText(`LEVEL ${gameState.level}`, margin, margin + 5);

        // Score
        if (theme.useGlow) ctx.shadowColor = theme.trailGlow;
        ctx.fillStyle = theme.trail;
        ctx.fillText(`SCORE ${gameState.score}`, margin, margin + 25);

        ctx.shadowBlur = 0;

        // Lives (hearts)
        ctx.textAlign = 'right';
        ctx.fillStyle = theme.enemyBasic;
        if (theme.useGlow) {
            ctx.shadowColor = theme.enemyBasicGlow;
            ctx.shadowBlur = 10;
        }

        let livesText = '';
        for (let i = 0; i < gameState.lives; i++) {
            livesText += '♥ ';
        }
        ctx.fillText(livesText.trim(), CONSTANTS.CANVAS_WIDTH - margin, margin + 5);

        // Fill percentage
        const fillPercent = Math.floor(gameState.fillPercentage * 100);
        const requiredPercent = Math.floor(gameState.fillRequired * 100);

        ctx.fillStyle = fillPercent >= requiredPercent ? theme.player : theme.text;
        if (theme.useGlow) {
            ctx.shadowColor = fillPercent >= requiredPercent ? theme.playerGlow : 'transparent';
        }
        ctx.fillText(`${fillPercent}% / ${requiredPercent}%`, CONSTANTS.CANVAS_WIDTH - margin, margin + 25);

        ctx.shadowBlur = 0;

        // Fill progress bar (toggleable with M key)
        if (showProgressBar) {
            this.renderProgressBar(ctx, gameState.fillPercentage, gameState.fillRequired);
        }
    }

    renderProgressBar(ctx, current, required) {
        const theme = themeManager.get();

        const barWidth = 200;
        const barHeight = 10;
        const margin = CONSTANTS.CELL_SIZE * CONSTANTS.BORDER_SIZE + 8;
        const x = CONSTANTS.CANVAS_WIDTH / 2 - barWidth / 2;
        const y = margin;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Required marker
        ctx.fillStyle = theme.enemyBorder;
        ctx.fillRect(x + barWidth * required - 1, y - 2, 2, barHeight + 4);

        // Current fill
        const fillColor = current >= required ? theme.player : theme.trail;
        if (theme.useGlow) {
            ctx.shadowColor = fillColor;
            ctx.shadowBlur = 5;
        }
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, barWidth * Math.min(current, 1), barHeight);

        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    renderPauseOverlay(ctx) {
        const theme = themeManager.get();
        const font = theme.font;

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        ctx.textAlign = 'center';

        // Pause title
        if (theme.useGlow) {
            ctx.shadowColor = theme.borderGlow;
            ctx.shadowBlur = 20;
        }
        ctx.fillStyle = theme.border;
        ctx.font = `32px ${font}`;
        ctx.fillText('PAUSED', CONSTANTS.CANVAS_WIDTH / 2, 80);
        ctx.shadowBlur = 0;

        // Game explanation
        ctx.fillStyle = theme.text;
        ctx.font = `10px ${font}`;
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
                ctx.fillStyle = theme.trail;
            } else {
                ctx.fillStyle = theme.text;
            }
            ctx.fillText(line, CONSTANTS.CANVAS_WIDTH / 2, 130 + i * 22);
        });

        // Power-ups section
        ctx.fillStyle = theme.trail;
        ctx.font = `10px ${font}`;
        ctx.fillText('POWER-UPS:', CONSTANTS.CANVAS_WIDTH / 2, 340);

        ctx.font = `9px ${font}`;
        const powerups = [
            { color: theme.powerupSpeed, text: 'CYAN - Speed Boost (2x speed for 5 sec)' },
            { color: theme.powerupFreeze, text: 'BLUE - Freeze (enemies stop for 3 sec)' },
            { color: theme.powerupShield, text: 'GREEN - Shield (invincible for 5 sec)' },
            { color: theme.powerupSlowmo, text: 'ORANGE - Slow-Mo (enemies 0.5x for 5 sec)' },
            { color: theme.powerupLife, text: 'PINK - Extra Life (+1 life)' }
        ];
        powerups.forEach((pu, i) => {
            ctx.fillStyle = pu.color;
            ctx.fillText(pu.text, CONSTANTS.CANVAS_WIDTH / 2, 370 + i * 24);
        });

        // Controls
        ctx.fillStyle = theme.text;
        ctx.font = `9px ${font}`;
        ctx.fillText('CONTROLS: Arrows=Move | Space=Stop | P=Pause', CONSTANTS.CANVAS_WIDTH / 2, 480);
        ctx.fillText('M=Toggle Bar | N=Mute | D=Debug', CONSTANTS.CANVAS_WIDTH / 2, 502);

        // Resume hint
        if (theme.useGlow) {
            ctx.shadowColor = theme.playerGlow;
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = theme.player;
        ctx.font = `12px ${font}`;
        ctx.fillText('Press any key to resume', CONSTANTS.CANVAS_WIDTH / 2, 550);
        ctx.shadowBlur = 0;
    }

    renderGameOver(ctx, gameState) {
        const theme = themeManager.get();
        const font = theme.font;

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        // Game Over text
        if (theme.useGlow) {
            ctx.shadowColor = theme.enemyBasicGlow;
            ctx.shadowBlur = 30;
        }
        ctx.fillStyle = theme.enemyBasic;
        ctx.font = `36px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 - 50);

        ctx.shadowBlur = 0;

        // Final score
        ctx.fillStyle = theme.text;
        ctx.font = `18px ${font}`;
        ctx.fillText(`FINAL SCORE: ${gameState.score}`, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 10);

        // High score
        if (gameState.score >= gameState.highScore && gameState.score > 0) {
            if (theme.useGlow) {
                ctx.shadowColor = theme.enemyBorderGlow;
                ctx.shadowBlur = 15;
            }
            ctx.fillStyle = theme.enemyBorder;
            ctx.fillText('NEW HIGH SCORE!', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 50);
            ctx.shadowBlur = 0;
        }

        // Restart hint
        ctx.fillStyle = theme.text;
        ctx.font = `14px ${font}`;
        ctx.fillText(this.isTouchDevice ? 'TAP TO RETRY' : 'Press SPACE to restart', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 100);
    }

    renderLevelComplete(ctx, gameState) {
        const theme = themeManager.get();
        const font = theme.font;

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        // Level Complete text
        if (theme.useGlow) {
            ctx.shadowColor = theme.playerGlow;
            ctx.shadowBlur = 30;
        }
        ctx.fillStyle = theme.player;
        ctx.font = `30px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 - 50);

        ctx.shadowBlur = 0;

        // Bonus
        ctx.fillStyle = theme.enemyBorder;
        ctx.font = `18px ${font}`;
        ctx.fillText(`+${CONSTANTS.SCORE_LEVEL_BONUS} BONUS`, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 10);

        // Next level hint
        ctx.fillStyle = theme.text;
        ctx.font = `14px ${font}`;
        ctx.fillText(this.isTouchDevice ? 'TAP TO CONTINUE' : 'Press SPACE for next level', CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 2 + 70);
    }
}
