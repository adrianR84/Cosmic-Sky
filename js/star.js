/**
 * Represents a single star in the galaxy visualization with various animation effects.
 * Each star can have different visual properties and movement patterns.
 */
class Star {
    /**
     * Create a new Star instance.
     * @param {number} x - The initial x-coordinate of the star
     * @param {number} y - The initial y-coordinate of the star
     * @param {Object} [options={}] - Configuration options for the star
     * @param {number} [options.size=random(0.5,3)] - Base size of the star in pixels
     * @param {number} [options.zIndex=Math.random()] - Z-index for depth sorting (0-1)
     * @param {number} [options.speed=1] - Animation speed multiplier
     * @param {boolean} [options.connectToMouse=true] - Whether the star reacts to mouse proximity
     * @param {boolean} [options.ellipseEnabled=false] - Whether elliptical movement is enabled
     * @param {number} [options.ellipticalMovementRate=0.1] - Probability (0-1) of elliptical movement
     * @param {number} [options.ellipseRadiusX=random(50,150)] - Horizontal radius of elliptical path
     * @param {number} [options.ellipseRadiusY=random(25,100)] - Vertical radius of elliptical path
     * @param {number} [options.ellipseSpeed=random(0.0005,0.002)] - Speed of elliptical movement
     * @param {number} [options.ellipseRotation=random(0,2π)] - Rotation of elliptical path in radians
     * @param {number} [options.amplitude=random(2,15)] - Amplitude of floating motion
     * @param {number} [options.frequency=random(0.0003,0.001)] - Frequency of floating motion
     */
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;

        // Configuration with defaults
        this.size = options.size || Utils.randomInRange(0.5, 3);
        this.zIndex = options.zIndex || Math.random();
        this.speed = options.speed || 1;
        this.connectToMouse = options.connectToMouse !== false;

        // Visual properties
        this.hue = Utils.randomInRange(0, 60) + 180; // Blues and purples
        this.saturation = Utils.randomInRange(70, 100);
        this.lightness = Utils.randomInRange(50, 90);
        this.alpha = Utils.randomInRange(0.6, 1);

        // Animation properties - set from options or use very subtle defaults
        this.amplitude = options.amplitude !== undefined ? options.amplitude : Utils.randomInRange(2, 15);
        this.frequency = options.frequency !== undefined ? options.frequency : (Utils.randomInRange(0.0003, 0.001) * this.speed);
        this.phase = Math.PI * 2 * Math.random();

        // Enhanced elliptical movement properties
        // Store whether this star was selected for elliptical movement at creation
        const ellipticalRate = options.ellipticalMovementRate !== undefined ? options.ellipticalMovementRate : 0.1;
        this._selectedForEllipse = Math.random() < ellipticalRate;
        this.ellipseEnabled = (options.ellipseEnabled !== undefined ? options.ellipseEnabled : false) && this._selectedForEllipse;
        this.ellipseRadiusX = options.ellipseRadiusX !== undefined ? options.ellipseRadiusX : Utils.randomInRange(50, 150);
        this.ellipseRadiusY = options.ellipseRadiusY !== undefined ? options.ellipseRadiusY : Utils.randomInRange(25, 100);
        this.ellipseSpeed = options.ellipseSpeed !== undefined ? options.ellipseSpeed : Utils.randomInRange(0.0005, 0.002) * this.speed;
        this.ellipseAngle = Math.random() * Math.PI * 2;
        this.ellipseRotation = options.ellipseRotation !== undefined ? options.ellipseRotation : Math.random() * Math.PI * 2;

        // Shooting star properties
        this.isShooting = false;
        this.shootStartTime = 0;
        this.shootDuration = 0;
        this.shootStartX = 0;
        this.shootStartY = 0;
        this.shootAngle = 0;
        this.shootDistance = 0;

        // Class-level shooting star tracking
        if (typeof Star.shootingStarsCount === 'undefined') {
            Star.shootingStarsCount = 0;
            Star.lastShootingStarTime = 0;
            Star.nextShootingStarDelay = 0;
        }

        // Current state
        this.currentSize = this.size;
        this.targetSize = this.size;
        this.pulseSpeed = Utils.randomInRange(0.003, 0.015); // More varied pulsing
        this.pulseAmount = 0.15; // Base pulse amount

        // Blinking effect properties
        this.isBlinking = false;
        this.blinkStartTime = 0;
        this.blinkDuration = 0;
        this.originalLightness = this.lightness;
        this.originalAlpha = this.alpha;

        // Size variation properties
        this.targetSizeMultiplier = 1;
        this.currentSizeMultiplier = 1;
        this.lastSizeChange = 0;
        this.sizeChangeInterval = 3000 + Math.random() * 10000; // 3-13 seconds between changes

        // Initialize GSAP animations
        this.initAnimations();
    }

    /**
     * Start a shooting star animation from the star's current position.
     * @param {number} time - Current timestamp for animation timing
     * @returns {boolean} True if shooting star was started, false if conditions weren't met
     */
    startShooting(time) {
        // Only start shooting if we're under the limit and it's been long enough since last star started
        if (Star.shootingStarsCount >= 3 ||
            (Star.lastShootingStarTime && time - Star.lastShootingStarTime < Star.nextShootingStarDelay)) {
            return false;
        }

        this.isShooting = true;
        Star.shootingStarsCount++;
        this.shootStartTime = time;
        this.shootDuration = 1000 + Math.random() * 2000; // 1-3 seconds
        this.shootStartX = this.x;
        this.shootStartY = this.y;
        this.shootAngle = Math.random() * Math.PI * 2;
        this.shootDistance = 500 + Math.random() * 1000; // 500-1500px distance

        // Schedule next shooting star
        Star.lastShootingStarTime = time;
        Star.nextShootingStarDelay = 2000 + Math.random() * 4000; // 2-6 seconds

        return true;
    }

    /**
     * Update the blinking effect for the star.
     * @param {number} time - Current timestamp for animation timing
     */
    updateBlinkingEffect(time) {
        // Random chance to start blinking (about once every 10-30 seconds per star on average)
        if (!this.isBlinking && Math.random() < 0.00015) {
            this.isBlinking = true;
            this.blinkStartTime = time;
            this.blinkDuration = 500 + Math.random() * 1000; // 0.5-1.5 seconds
        }

        // Handle blinking state
        if (this.isBlinking) {
            const blinkProgress = (time - this.blinkStartTime) / this.blinkDuration;

            if (blinkProgress >= 1) {
                // Blinking complete
                this.isBlinking = false;
                this.lightness = this.originalLightness;
                this.alpha = this.originalAlpha;
            } else {
                // Smooth blink effect using sine wave
                const blinkIntensity = Math.sin(blinkProgress * Math.PI) * 0.8 + 1.2;
                this.lightness = this.originalLightness * blinkIntensity;
                this.alpha = this.originalAlpha * (blinkIntensity * 0.5 + 0.8);
            }
        }
    }

    /**
     * Initialize GSAP animations for the star's floating and pulsing effects.
     * @private
     */
    initAnimations() {
        // Floating animation (only when not in elliptical mode)
        this.floatTween = gsap.to(this, {
            duration: Utils.randomInRange(3, 8) / this.speed,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            yoyoEase: true,
            modifiers: {
                x: x => this.ellipseEnabled ? this.x : (this.originX + Math.sin(performance.now() * this.frequency + this.phase) * this.amplitude),
                y: y => this.ellipseEnabled ? this.y : (this.originY + Math.cos(performance.now() * this.frequency * 0.8 + this.phase) * this.amplitude)
            }
        });

        // Pulsing effect with random variations
        this.pulseTween = gsap.to(this, {
            currentSize: this.size * (1 + this.pulseAmount * (0.8 + Math.random() * 0.4)),
            duration: (1.5 + Math.random()) / this.speed,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            yoyoEase: true,
            /**
             * Callback for animation repeat events.
             * @private
             */
            onRepeat: () => {
                // Randomly adjust the pulse amount for variation
                this.pulseAmount = 0.1 + Math.random() * 0.2;
            }
        });
    }

    /**
     * Update the star's position and visual properties.
     * @param {number} time - Current timestamp for animation timing
     * @param {Object} [mouse] - Current mouse position {x, y}
     * @param {number} [maxDistance=150] - Maximum distance for mouse interaction
     */
    update(time, mouse, maxDistance = 150) {
        // Update blinking effect
        this.updateBlinkingEffect(time);

        // Handle shooting star behavior
        if (this.isShooting) {
            const shootProgress = (time - this.shootStartTime) / this.shootDuration;
            if (shootProgress >= 1) {
                // Reset after shooting
                this.isShooting = false;
                Star.shootingStarsCount--;
                this.currentLightness = this.originalLightness;
                this.currentAlpha = this.originalAlpha;
            } else {
                // Animate shooting star
                const easedProgress = Math.pow(shootProgress, 0.5);
                const currentDistance = this.shootDistance * easedProgress;
                this.x = this.shootStartX + Math.cos(this.shootAngle) * currentDistance;
                this.y = this.shootStartY + Math.sin(this.shootAngle) * currentDistance;

                // Shooting star effects
                const tailFade = 1 - Math.pow(shootProgress, 2); // Fade out towards the end
                this.currentLightness = 70 + 30 * tailFade; // Bright with fade
                this.currentAlpha = (this.originalAlpha * 1.5) * tailFade;
                this.currentSize = this.size * (1.8 + 0.5 * Math.sin(time * 0.02)); // Pulsing effect

                return; // Skip other updates while shooting
            }
        } else if (!this.isBlinking && !this.isShooting &&
            Star.shootingStarsCount < 3 &&
            (!Star.lastShootingStarTime || time - Star.lastShootingStarTime > Star.nextShootingStarDelay)) {
            // Only start shooting if:
            // 1. Not currently blinking
            // 2. Fewer than 3 stars are shooting
            // 3. Enough time has passed since the last shooting star
            this.startShooting(time);
            return;
        }

        // Random size variations (smoother transitions)
        if (time - this.lastSizeChange > this.sizeChangeInterval) {
            this.targetSizeMultiplier = 0.8 + Math.random() * 0.6; // Between 0.8x and 1.4x
            this.lastSizeChange = time;
            this.sizeChangeInterval = 3000 + Math.random() * 10000; // Next change in 3-13 seconds
        }

        // Smooth size transition with easing
        this.currentSizeMultiplier += (this.targetSizeMultiplier - this.currentSizeMultiplier) * 0.02;

        // Calculate base position
        let xOffset = 0;
        let yOffset = 0;

        // Only apply elliptical movement if the star is enabled for it AND the global flag is true
        if (this.ellipseEnabled) {
            // Dynamic ellipse movement with slight variations
            const speedVariation = 1 + Math.sin(time * 0.001) * 0.2;
            this.ellipseAngle += this.ellipseSpeed * speedVariation;

            const radiusVariation = 1 + Math.sin(time * 0.0007) * 0.15;
            const effectiveRadiusX = this.ellipseRadiusX * radiusVariation;
            const effectiveRadiusY = this.ellipseRadiusY * (1 + Math.sin(time * 0.0005) * 0.1);

            const cosA = Math.cos(this.ellipseAngle);
            const sinA = Math.sin(this.ellipseAngle);
            const cosR = Math.cos(this.ellipseRotation);
            const sinR = Math.sin(this.ellipseRotation);

            xOffset = effectiveRadiusX * cosA * cosR - effectiveRadiusY * sinA * sinR;
            yOffset = effectiveRadiusX * cosA * sinR + effectiveRadiusY * sinA * cosR;
        } else {
            // Original floating motion
            const timeFactor = time * 0.0005;
            xOffset = Math.sin(timeFactor * this.frequency + this.phase) * this.amplitude;
            yOffset = Math.cos(timeFactor * this.frequency * 0.5 + this.phase * 1.5) * this.amplitude * 0.6;
        }

        // Update position
        this.x = this.originX + xOffset;
        this.y = this.originY + yOffset;

        // React to mouse proximity (more subtle)
        if (mouse && this.connectToMouse) {
            const distance = Utils.distance(this.x, this.y, mouse.x, mouse.y);
            const proximity = 1 - Math.min(distance / maxDistance, 1);

            if (proximity > 0) {
                // Move away from mouse very slightly
                const angle = Math.atan2(this.y - mouse.y, this.x - mouse.x);
                const force = proximity * 2; // Reduced force for more subtle movement

                this.x += Math.cos(angle) * force;
                this.y += Math.sin(angle) * force;

                // Very subtle pulsing when near mouse
                this.targetSize = this.size * (1 + (this.pulseAmount * 0.5 * proximity));
            } else {
                this.targetSize = this.size;
            }
        }

        // Smooth size transition
        this.currentSize += (this.targetSize - this.currentSize) * this.pulseSpeed;
    }

    /**
     * Draw the star on the canvas with glow and gradient effects.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas
     */
    draw(ctx) {
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize * 2
        );

        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);

        // Draw the star
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add a small bright center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 95%, 0.8)`;
        ctx.fill();
    }

    /**
     * Reset the star to its original position and visual state.
     */
    reset() {
        this.x = this.originX;
        this.y = this.originY;
        this.currentSize = this.size;
        this.targetSize = this.size;
    }

    /**
     * Clean up animations and resources to prevent memory leaks.
     * Should be called when the star is no longer needed.
     */
    dispose() {
        if (this.floatTween) this.floatTween.kill();
        if (this.pulseTween) this.pulseTween.kill();
    }
}
