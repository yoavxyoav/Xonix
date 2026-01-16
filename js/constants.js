// Game Constants
const CONSTANTS = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Grid settings
    CELL_SIZE: 10,
    GRID_COLS: 80,  // 800 / 10
    GRID_ROWS: 60,  // 600 / 10
    BORDER_SIZE: 2, // cells

    // Cell states
    CELL_EMPTY: 0,
    CELL_CLAIMED: 1,
    CELL_BORDER: 2,
    CELL_TRAIL: 3,

    // Player settings
    PLAYER_SPEED: 6,
    PLAYER_SIZE: 8,
    INITIAL_LIVES: 3,

    // Enemy settings
    ENEMY_BASE_SPEED: 4,
    ENEMY_SIZE: 8,
    BORDER_ENEMY_SPEED: 3,

    // Game settings
    TARGET_FPS: 60,

    // Level progression
    LEVELS: [
        { fillRequired: 0.50, basicEnemies: 1, borderEnemies: 1 },
        { fillRequired: 0.55, basicEnemies: 2, borderEnemies: 1 },
        { fillRequired: 0.60, basicEnemies: 2, borderEnemies: 2 },
        { fillRequired: 0.65, basicEnemies: 3, borderEnemies: 2 },
        { fillRequired: 0.70, basicEnemies: 3, borderEnemies: 3 },
        { fillRequired: 0.75, basicEnemies: 4, borderEnemies: 3 },
        { fillRequired: 0.80, basicEnemies: 4, borderEnemies: 4 },
        { fillRequired: 0.80, basicEnemies: 5, borderEnemies: 5 },
    ],

    // Power-up settings
    POWERUP_DURATION: {
        SPEED: 5000,
        FREEZE: 3000,
        SHIELD: 5000,
        SLOWMO: 5000
    },
    POWERUP_SPAWN_CHANCE: 0.002, // per frame
    POWERUP_SIZE: 12,

    // Scoring
    SCORE_PER_PERCENT: 100,
    SCORE_LEVEL_BONUS: 1000,

    // Colors (Neon/Synthwave palette)
    COLORS: {
        BACKGROUND: '#0a0a1a',
        GRID_LINE: 'rgba(50, 50, 100, 0.3)',
        BORDER: '#00ffff',
        BORDER_GLOW: 'rgba(0, 255, 255, 0.5)',
        CLAIMED: '#006666',  // Darker cyan to match border
        CLAIMED_GLOW: 'rgba(0, 255, 255, 0.3)',
        TRAIL: '#ff00ff',
        TRAIL_GLOW: 'rgba(255, 0, 255, 0.8)',
        PLAYER: '#00ff00',
        PLAYER_GLOW: 'rgba(0, 255, 0, 0.8)',
        ENEMY_BASIC: '#ff0066',
        ENEMY_BASIC_GLOW: 'rgba(255, 0, 102, 0.8)',
        ENEMY_BORDER: '#ffff00',
        ENEMY_BORDER_GLOW: 'rgba(255, 255, 0, 0.8)',
        TEXT: '#ffffff',
        TEXT_GLOW: 'rgba(255, 255, 255, 0.5)',
        POWERUP_SPEED: '#00ffff',
        POWERUP_FREEZE: '#0066ff',
        POWERUP_SHIELD: '#00ff00',
        POWERUP_SLOWMO: '#ff6600',
        POWERUP_LIFE: '#ff0066'
    }
};

// Freeze the constants to prevent accidental modification
Object.freeze(CONSTANTS);
Object.freeze(CONSTANTS.LEVELS);
Object.freeze(CONSTANTS.POWERUP_DURATION);
Object.freeze(CONSTANTS.COLORS);
