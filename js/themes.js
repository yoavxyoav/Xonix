// Theme system for Xonix

const THEMES = {
    neon: {
        name: 'NEON',
        font: '"Press Start 2P", monospace',
        fontScale: 1,

        // Colors
        background: '#0a0a1a',
        border: '#00ffff',
        borderGlow: 'rgba(0, 255, 255, 0.5)',
        claimed: '#006666',
        claimedGlow: 'rgba(0, 255, 255, 0.3)',
        trail: '#ff00ff',
        trailGlow: 'rgba(255, 0, 255, 0.8)',
        player: '#00ff00',
        playerGlow: 'rgba(0, 255, 0, 0.8)',
        playerOuter: '#ffffff',
        enemyBasic: '#ff0066',
        enemyBasicGlow: 'rgba(255, 0, 102, 0.8)',
        enemyBorder: '#ffff00',
        enemyBorderGlow: 'rgba(255, 255, 0, 0.8)',
        text: '#ffffff',
        textGlow: 'rgba(255, 255, 255, 0.5)',

        // Power-up colors
        powerupSpeed: '#00ffff',
        powerupFreeze: '#0066ff',
        powerupShield: '#00ff00',
        powerupSlowmo: '#ff6600',
        powerupLife: '#ff0066',

        // Visual settings
        useGlow: true,
        glowIntensity: 15,
        pixelated: true,
        borderWidth: 3,
        playerSize: 8,
        enemySize: 8
    },

    modern: {
        name: 'MODERN',
        font: 'Arial, sans-serif',
        fontScale: 1.2,

        // Colors - softer, more sophisticated palette
        background: '#1a1a2e',
        border: '#4a9eff',
        borderGlow: 'rgba(74, 158, 255, 0.3)',
        claimed: '#2d4a6e',
        claimedGlow: 'rgba(74, 158, 255, 0.2)',
        trail: '#e94560',
        trailGlow: 'rgba(233, 69, 96, 0.5)',
        player: '#16c79a',
        playerGlow: 'rgba(22, 199, 154, 0.5)',
        playerOuter: '#ffffff',
        enemyBasic: '#ff6b6b',
        enemyBasicGlow: 'rgba(255, 107, 107, 0.5)',
        enemyBorder: '#feca57',
        enemyBorderGlow: 'rgba(254, 202, 87, 0.5)',
        text: '#ffffff',
        textGlow: 'rgba(255, 255, 255, 0.3)',

        // Power-up colors
        powerupSpeed: '#54a0ff',
        powerupFreeze: '#5f27cd',
        powerupShield: '#1dd1a1',
        powerupSlowmo: '#ff9f43',
        powerupLife: '#ee5a5a',

        // Visual settings
        useGlow: true,
        glowIntensity: 8,
        pixelated: false,
        borderWidth: 2,
        playerSize: 10,
        enemySize: 10
    }
};

// Theme manager
class ThemeManager {
    constructor() {
        this.currentTheme = 'neon';
        this.theme = THEMES.neon;
    }

    toggle() {
        if (this.currentTheme === 'neon') {
            this.currentTheme = 'modern';
            this.theme = THEMES.modern;
        } else {
            this.currentTheme = 'neon';
            this.theme = THEMES.neon;
        }
        return this.theme;
    }

    get() {
        return this.theme;
    }

    getName() {
        return this.theme.name;
    }
}

const themeManager = new ThemeManager();
