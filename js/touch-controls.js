// Touch Controls for Mobile Devices
// Provides virtual D-pad (right side) and Stop button (left side) for landscape play

class TouchControls {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.container = null;
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
        this.createControls();
        this.attachEventListeners();

        // Force landscape hint on mobile
        this.checkOrientation();
        window.addEventListener('resize', () => this.checkOrientation());
        window.addEventListener('orientationchange', () => this.checkOrientation());
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
            { dir: 'up', symbol: '&#9650;', key: 'ArrowUp' },
            { dir: 'left', symbol: '&#9664;', key: 'ArrowLeft' },
            { dir: 'right', symbol: '&#9654;', key: 'ArrowRight' },
            { dir: 'down', symbol: '&#9660;', key: 'ArrowDown' }
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

        // Show/hide orientation hint
        let hint = document.querySelector('.orientation-hint');

        if (isPortrait) {
            if (!hint) {
                hint = document.createElement('div');
                hint.className = 'orientation-hint';
                hint.innerHTML = '<div class="orientation-icon">&#128241;</div><div>Rotate device for best experience</div>';
                document.body.appendChild(hint);
            }
            hint.style.display = 'flex';
        } else if (hint) {
            hint.style.display = 'none';
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
