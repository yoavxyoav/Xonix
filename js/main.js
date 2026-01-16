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

    // Start game loop
    requestAnimationFrame(gameLoop);
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

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
