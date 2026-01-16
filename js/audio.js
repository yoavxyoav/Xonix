// Audio manager for sound effects
// Uses Web Audio API for synthesized retro sounds

class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Play a beep sound
    playTone(frequency, duration, type = 'square') {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    // Sound when capturing territory
    playCapture() {
        if (!this.enabled || !this.context) return;

        // Rising sweep
        const startFreq = 200;
        const endFreq = 800;
        const duration = 0.3;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(startFreq, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.context.currentTime + duration);

        gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    // Sound when player dies
    playDeath() {
        if (!this.enabled || !this.context) return;

        // Falling sweep
        const startFreq = 500;
        const endFreq = 50;
        const duration = 0.5;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(startFreq, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.context.currentTime + duration);

        gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    // Sound when level is complete
    playLevelUp() {
        if (!this.enabled || !this.context) return;

        // Arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const noteLength = 0.1;

        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, noteLength * 2, 'square');
            }, i * noteLength * 1000);
        });
    }

    // Sound when collecting power-up
    playPowerUp() {
        if (!this.enabled || !this.context) return;

        // Quick ascending tones
        this.playTone(440, 0.1, 'sine');
        setTimeout(() => this.playTone(660, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(880, 0.15, 'sine'), 200);
    }

    // Sound when game over
    playGameOver() {
        if (!this.enabled || !this.context) return;

        // Sad descending tones
        const notes = [440, 392, 349, 330];
        const noteLength = 0.3;

        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, noteLength, 'triangle');
            }, i * noteLength * 1000);
        });
    }

    // Movement tick sound (subtle)
    playMove() {
        if (!this.enabled || !this.context) return;
        // Very short, quiet tick
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'square';
        oscillator.frequency.value = 100;

        gainNode.gain.setValueAtTime(this.volume * 0.1, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.02);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.02);
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();
