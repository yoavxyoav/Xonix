// Touch Controls for Mobile Devices
// Provides virtual D-pad (right side) and Stop button (left side) for landscape play

class TouchControls {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.container = null;
        this.tapArea = null;
        this.orientationHint = null;
        this.activeButton = null;

        // Only initialize on touch-capable devices
        if (this.isTouchDevice()) {
            this.init();
        }
    }

    isTouchDevice() {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    }

    init() {
        this.enabled = true;
        this.createOrientationHint();
        this.createTapArea();
        this.createControls();
        this.attachEventListeners();

        // Check orientation on load and changes
        this.checkOrientation();
        window.addEventListener('resize', () => this.checkOrientation());
        window.addEventListener('orientationchange', () => {
            // Delay to let orientation settle
            setTimeout(() => this.checkOrientation(), 100);
        });
    }

    createOrientationHint() {
        this.orientationHint = document.createElement('div');
        this.orientationHint.className = 'orientation-hint';
        this.orientationHint.innerHTML = `
            <div class="orientation-icon">📱</div>
            <div class="orientation-text">Rotate your device</div>
            <div class="orientation-subtext">for the best experience</div>
        `;
        document.body.appendChild(this.orientationHint);
    }

    createTapArea() {
        // Use existing tap area from HTML (for reliability on iOS)
        this.tapArea = document.getElementById('tapArea');
        if (!this.tapArea) {
            // Fallback: create if not in HTML
            this.tapArea = document.createElement('div');
            this.tapArea.id = 'tapArea';
            this.tapArea.className = 'touch-tap-area visible';
            this.tapArea.innerHTML = '<span>TOUCH ANYWHERE TO START</span>';
            document.body.appendChild(this.tapArea);
        }
        this.tapAreaShouldShow = true;

        // Handle tap anywhere to start - both touch and click for iOS compatibility
        const handleStart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.game.handleKeyDown(' ');
        };
        const handleEnd = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.game.handleKeyUp(' ');
        };

        this.tapArea.addEventListener('touchstart', handleStart, { passive: false });
        this.tapArea.addEventListener('touchend', handleEnd, { passive: false });
        // Click fallback for iOS
        this.tapArea.addEventListener('click', (e) => {
            e.preventDefault();
            this.game.handleKeyDown(' ');
            setTimeout(() => this.game.handleKeyUp(' '), 100);
        });
    }

    createControls() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'touch-controls';

        // Create Stop button (left side)
        const stopButton = document.createElement('div');
        stopButton.className = 'touch-btn touch-stop';
        stopButton.dataset.action = 'stop';
        stopButton.innerHTML = '<span>STOP</span>';

        // Create D-pad container (right side)
        const dpad = document.createElement('div');
        dpad.className = 'touch-dpad';

        // Create arrow buttons
        const arrows = [
            { dir: 'up', symbol: '▲', key: 'ArrowUp' },
            { dir: 'left', symbol: '◀', key: 'ArrowLeft' },
            { dir: 'right', symbol: '▶', key: 'ArrowRight' },
            { dir: 'down', symbol: '▼', key: 'ArrowDown' }
        ];

        arrows.forEach(arrow => {
            const btn = document.createElement('div');
            btn.className = `touch-btn touch-arrow touch-${arrow.dir}`;
            btn.dataset.key = arrow.key;
            btn.innerHTML = arrow.symbol;
            dpad.appendChild(btn);
        });

        // Add center piece to D-pad
        const center = document.createElement('div');
        center.className = 'touch-dpad-center';
        dpad.appendChild(center);

        // Assemble
        this.container.appendChild(stopButton);
        this.container.appendChild(dpad);
        document.body.appendChild(this.container);
    }

    attachEventListeners() {
        // Prevent default touch behaviors on the control area
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Handle touch start on buttons
        this.container.querySelectorAll('.touch-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress(btn);
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonRelease(btn);
            }, { passive: false });

            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.handleButtonRelease(btn);
            }, { passive: false });
        });

        // Handle touch leaving a button (drag off)
        this.container.addEventListener('touchend', () => {
            this.clearAllActive();
        });
    }

    handleButtonPress(btn) {
        // Visual feedback
        btn.classList.add('active');
        this.activeButton = btn;

        // Trigger the appropriate action
        if (btn.dataset.action === 'stop') {
            // Space bar equivalent
            this.game.handleKeyDown(' ');
        } else if (btn.dataset.key) {
            // Arrow key
            this.game.handleKeyDown(btn.dataset.key);
        }
    }

    handleButtonRelease(btn) {
        btn.classList.remove('active');

        // Trigger key up for the button
        if (btn.dataset.action === 'stop') {
            this.game.handleKeyUp(' ');
        } else if (btn.dataset.key) {
            this.game.handleKeyUp(btn.dataset.key);
        }

        if (this.activeButton === btn) {
            this.activeButton = null;
        }
    }

    clearAllActive() {
        this.container.querySelectorAll('.touch-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        this.activeButton = null;
    }

    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    checkOrientation() {
        if (!this.enabled) return;

        if (!this.isLandscape()) {
            this.orientationHint.classList.add('visible');
            // Reset viewport to normal when in portrait
            this.setViewportScale(1.0);
        } else {
            this.orientationHint.classList.remove('visible');
            // Zoom out viewport to fit canvas + controls in landscape
            this.adjustViewportForLandscape();
        }
        // Note: tap area visibility is controlled by CSS media query + .visible class
        // JS only manages the .visible class based on game state (tapAreaShouldShow)
    }

    setViewportScale(scale) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content',
                `width=device-width, initial-scale=${scale}, minimum-scale=0.1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`);
        }
    }

    adjustViewportForLandscape() {
        // Calculate the optimal viewport scale to fit canvas + controls
        // Canvas at base: 800px wide, scaled by CSS to ~0.45 = 360px
        // Left control (STOP): ~100px + margin
        // Right control (D-PAD): ~160px + margin
        // Total minimum width needed: ~120 + 360 + 180 = 660px

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Base dimensions of the game container (800x600 canvas)
        const canvasBaseWidth = 800;
        const canvasBaseHeight = 600;

        // Space needed for controls on each side
        const controlsWidth = 300; // ~120px left + ~180px right with margins
        const controlsHeight = 180; // Controls height requirement

        // Calculate available space for canvas after controls
        const availableWidth = screenWidth - controlsWidth;
        const availableHeight = screenHeight - 20; // Some padding

        // Calculate scale that would fit the canvas
        const scaleX = availableWidth / canvasBaseWidth;
        const scaleY = availableHeight / canvasBaseHeight;
        const canvasScale = Math.min(scaleX, scaleY, 0.5); // Cap at 0.5 for reasonable size

        // Calculate total width we need
        const totalNeededWidth = (canvasBaseWidth * canvasScale) + controlsWidth;

        // If screen is too narrow, zoom out the viewport
        if (totalNeededWidth > screenWidth) {
            const viewportScale = Math.max(0.4, screenWidth / totalNeededWidth);
            this.setViewportScale(viewportScale);
        } else {
            this.setViewportScale(1.0);
        }

        // Update game container scale dynamically
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            const finalScale = Math.max(0.3, Math.min(canvasScale, 0.45));
            gameContainer.style.transform = `scale(${finalScale})`;
        }
    }

    // Called by game to update tap area visibility based on game state
    updateGameState(screen) {
        if (!this.enabled) return;

        // Show tap area on menu, gameover, levelcomplete screens
        this.tapAreaShouldShow = ['menu', 'gameover', 'levelcomplete'].includes(screen);

        // Update text based on screen
        if (screen === 'menu') {
            this.tapArea.innerHTML = '<span>TOUCH ANYWHERE TO START</span>';
        } else if (screen === 'gameover') {
            this.tapArea.innerHTML = '<span>TOUCH ANYWHERE TO RETRY</span>';
        } else if (screen === 'levelcomplete') {
            this.tapArea.innerHTML = '<span>TOUCH ANYWHERE TO CONTINUE</span>';
        }

        // JS manages the .visible class, CSS media query controls actual display
        if (this.tapAreaShouldShow) {
            this.tapArea.classList.add('visible');
        } else {
            this.tapArea.classList.remove('visible');
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

// Export for use in main.js
window.TouchControls = TouchControls;
