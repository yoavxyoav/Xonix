// Main entry point and game loop

let canvas, ctx, game;

function init() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = CONSTANTS.CANVAS_WIDTH;
    canvas.height = CONSTANTS.CANVAS_HEIGHT;

    // Initialize audio
    audioManager.init();

    // Create game instance
    game = new Game();

    // Set up input handlers
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Prevent arrow key scrolling
    window.addEventListener('keydown', function(e) {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });

    // Game loop is started by startGameLoop() after init
}

function handleKeyDown(e) {
    game.handleKeyDown(e.key);
}

function handleKeyUp(e) {
    game.handleKeyUp(e.key);
}

function gameLoop() {
    const now = performance.now();

    // Update game state
    game.update(now);

    // Render
    game.render(ctx, now);
}

// Use setInterval for consistent timing (browsers don't throttle this as much)
let gameInterval;
let wakeLock = null;

// Request wake lock to prevent browser throttling
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake lock acquired');
        }
    } catch (err) {
        console.log('Wake lock failed:', err);
    }
}

function startGameLoop() {
    // Run at ~60fps (16.67ms per frame)
    gameInterval = setInterval(gameLoop, 16);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    requestWakeLock();
    startGameLoop();
});

// Re-acquire wake lock if page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        requestWakeLock();
    }
});
