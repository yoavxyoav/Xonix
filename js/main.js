// Main entry point and game loop

let canvas, ctx, game, touchControls;

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

    // Initialize touch controls for mobile devices
    touchControls = new TouchControls(game);

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

function gameLoop(timestamp) {
    // Update game state
    game.update(timestamp);

    // Render
    game.render(ctx, timestamp);

    // Update touch controls visibility based on game state
    if (touchControls && touchControls.enabled) {
        touchControls.updateGameState(game.screen);
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Start game loop with requestAnimationFrame (better for games)
    requestAnimationFrame(gameLoop);
});
