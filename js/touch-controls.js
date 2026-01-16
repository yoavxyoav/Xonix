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
        // Create tap-to-start overlay
        this.tapArea = document.createElement('div');
        this.tapArea.className = 'touch-tap-area';
        this.tapArea.innerHTML = '<span>TAP TO START</span>';
        document.body.appendChild(this.tapArea);

        // Handle tap to start
        this.tapArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.handleKeyDown(' ');
        }, { passive: false });

        this.tapArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.game.handleKeyUp(' ');
        }, { passive: false });
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

    checkOrientation() {
        if (!this.enabled) return;

        const isPortrait = window.innerHeight > window.innerWidth;

        if (isPortrait) {
            this.orientationHint.classList.add('visible');
        } else {
            this.orientationHint.classList.remove('visible');
        }
    }

    // Called by game to update tap area visibility based on game state
    updateGameState(screen) {
        if (!this.enabled) return;

        // Show tap area on menu, gameover, levelcomplete screens
        const showTapArea = ['menu', 'gameover', 'levelcomplete'].includes(screen);

        if (showTapArea) {
            this.tapArea.classList.add('visible');
            // Update text based on screen
            if (screen === 'menu') {
                this.tapArea.innerHTML = '<span>TAP TO START</span>';
            } else if (screen === 'gameover') {
                this.tapArea.innerHTML = '<span>TAP TO RETRY</span>';
            } else if (screen === 'levelcomplete') {
                this.tapArea.innerHTML = '<span>TAP TO CONTINUE</span>';
            }
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
