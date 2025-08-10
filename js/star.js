import Utils from './utils/utils.js';

/**
 * Represents a single star in the galaxy visualization with various animation effects.
 * Each star can have different visual properties and movement patterns, including
 * floating, pulsing, blinking, shooting, and elliptical movements.
 * 
 * @class Star
 * @property {number} x - Current x-coordinate of the star
 * @property {number} y - Current y-coordinate of the star
 * @property {number} originX - Original x-coordinate of the star
 * @property {number} originY - Original y-coordinate of the star
 * @property {number} size - Base size of the star in pixels
 * @property {number} zIndex - Depth sorting value (0-1)
 * @property {number} speed - Animation speed multiplier
 * @property {boolean} moveStarsAwayFromMouse - Whether the star moves away from mouse cursor
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
     * @param {boolean} [options.moveStarsAwayFromMouse=false] - Whether the star moves away from mouse cursor
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
        this.moveStarsAwayFromMouse = options.moveStarsAwayFromMouse || false;

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

        /**
         * Class-level properties for tracking shooting stars across all instances
         * @static
         * @property {number} shootingStarsCount - Number of currently active shooting stars
         * @property {number} lastShootingStarTime - Timestamp when the last shooting star started
         * @property {number} nextShootingStarDelay - Delay before the next shooting star can start
         */
        if (typeof Star.shootingStarsCount === 'undefined') {
            Star.shootingStarsCount = 0;
            Star.lastShootingStarTime = 0;
            Star.nextShootingStarDelay = 0;

            Star.settings = {
                enabled: false,
                maxStarsAtOnce: 3,
                maxShootDurationSeconds: 3, // 3 seconds 
                maxEventSeconds: 6      // 6 seconds
            };

        }

        // Current state
        /** @type {number} Current visual size of the star (affected by pulsing) */
        this.currentSize = this.size;

        /** @type {number} Target size for smooth size transitions */
        this.targetSize = this.size;

        /** @type {number} Speed of the pulsing animation */
        this.pulseSpeed = Utils.randomInRange(0.003, 0.015);

        /** @type {number} Base amount of pulsing effect */
        this.pulseAmount = 0.15;

        // Parallax effect properties
        /** @type {number} Depth factor for parallax effect (0.5-1.0) */
        this.parallaxDepth = 0.5 + Math.random() * 0.5;

        /** @type {number} Current x-offset for parallax effect */
        this.parallaxX = 0;

        /** @type {number} Current y-offset for parallax effect */
        this.parallaxY = 0;

        // Blinking effect properties
        /** @type {boolean} Whether the star is currently blinking */
        this.isBlinking = false;

        /** @type {number} Timestamp when blinking started */
        this.blinkStartTime = 0;

        /** @type {number} Duration of the blink animation in milliseconds */
        this.blinkDuration = 0;

        /** @type {number} Original lightness value before blinking */
        this.originalLightness = this.lightness;

        /** @type {number} Original alpha value before blinking */
        this.originalAlpha = this.alpha;

        // Size variation properties
        /** @type {number} Target size multiplier for smooth transitions */
        this.targetSizeMultiplier = 1;

        /** @type {number} Current size multiplier (smoothed towards target) */
        this.currentSizeMultiplier = 1;

        /** @type {number} Timestamp of last size change */
        this.lastSizeChange = 0;

        /**
         * Time in milliseconds until next size change (3-13 seconds)
         * @type {number}
         */
        this.sizeChangeInterval = 3000 + Math.random() * 10000;

        // Initialize GSAP animations
        this.initAnimations();
    }


    /**
     * Updates the shooting star settings used by all Star instances
     * @static
     * @param {Object} settings - New shooting star settings
     * @param {boolean} settings.enabled - Whether shooting stars are enabled
     * @param {number} settings.maxStarsAtOnce - Maximum number of shooting stars that can be active at once
     * @param {number} settings.maxShootDuration - Maximum duration of a shooting star animation in ms
     * @param {number} settings.maxEventSeconds - Maximum delay between shooting star events in seconds
     */
    static updateShootingStarSettings(settings) {
        if (settings) {
            Star.settings = {
                enabled: settings.enabled !== undefined ? settings.enabled : Star.settings.enabled,
                maxStarsAtOnce: settings.maxStarsAtOnce || Star.settings.maxStarsAtOnce,
                maxShootDurationSeconds: settings.maxShootDurationSeconds || Star.settings.maxShootDurationSeconds,
                maxEventSeconds: settings.maxEventSeconds || Star.settings.maxEventSeconds
            };
            // console.log('Shooting star settings updated:', Star.settings);
        }
    }

    /**
     * Reset the shooting star state
     * @static
     */
    static resetShootingStarState() {
        Star.shootingStarsCount = 0;
        Star.lastShootingStarTime = 0;
        Star.nextShootingStarDelay = 0;
    }

    /**
     * Starts a shooting star animation from the star's current position.
     * A shooting star will move rapidly in a straight line with a glowing tail effect.
     * 
     * @param {number} time - Current timestamp in milliseconds for animation timing
     * @returns {boolean} True if shooting star was successfully started, false if conditions weren't met
     * 
     * @example
     * // Start a shooting star animation
     * const success = star.startShopping(Date.now());
     * if (success) {
     *     console.log('Shooting star started!');
     * }
     */
    startShooting(time) {

        // Don't start if shooting stars are disabled
        if (!Star.settings.enabled) {
            return false;
        }

        // Only start shooting if we're under the limit and it's been long enough since last star started
        if (Star.shootingStarsCount >= Star.settings.maxStarsAtOnce ||
            (Star.lastShootingStarTime && time - Star.lastShootingStarTime < Star.nextShootingStarDelay)) {
            return false;
        }

        // Initialize shooting star properties
        this.isShooting = true;
        Star.shootingStarsCount++;
        this.shootStartTime = time;
        this.shootDuration = 1000 + Math.random() * Star.settings.maxShootDurationSeconds * 1000;
        this.shootStartX = this.x;
        this.shootStartY = this.y;
        this.shootAngle = Math.random() * Math.PI * 2; // Random direction in radians
        this.shootDistance = 800 + Math.random() * 1000; // 800-1800px distance

        // Schedule next shooting star with some randomness
        // Star.lastShootingStarTime = time;
        // Star.nextShootingStarDelay = 2000 + Math.random() * Star.settings.maxEventSeconds;

        // Schedule next shooting star with some randomness
        Star.lastShootingStarTime = time;
        const minDelayMs = 100; // Minimum 0.1 seconds between stars
        const maxDelayMs = Star.settings.maxEventSeconds * 1000;
        Star.nextShootingStarDelay = minDelayMs + Math.random() * (maxDelayMs - minDelayMs);

        // console.log(Star.shootingStarsCount, Star.settings.maxStarsAtOnce, Star.nextShootingStarDelay);

        return true;
    }

    /**
     * Updates the blinking effect for the star.
     * Handles both the triggering of new blinks and the animation of active blinks.
     * 
     * @param {number} time - Current timestamp in milliseconds for animation timing
     * 
     * @example
     * // Update blinking in the animation loop
     * star.updateBlinkingEffect(performance.now());
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
                // Blinking complete - reset to original values
                this.isBlinking = false;
                this.lightness = this.originalLightness;
                this.alpha = this.originalAlpha;
            } else {
                // Apply smooth blink effect using sine wave
                // Creates a natural-looking pulse by varying both lightness and alpha
                const blinkIntensity = Math.sin(blinkProgress * Math.PI) * 0.8 + 1.2;
                this.lightness = this.originalLightness * blinkIntensity;
                this.alpha = this.originalAlpha * (blinkIntensity * 0.5 + 0.8);
            }
        }
    }

    /**
     * Initializes GSAP animations for the star's floating and pulsing effects.
     * Creates two main animations:
     * 1. A floating animation that makes the star move in a gentle wave pattern
     * 2. A pulsing animation that makes the star rhythmically change size
     * 
     * @private
     * @see https://greensock.com/docs/ GSAP documentation
     * 
     * @example
     * // Initialize animations when creating a new star
     * const star = new Star(x, y, options);
     * // Animations are automatically started in the constructor
     */
    initAnimations() {
        // Floating animation (only when not in elliptical mode)
        this.floatTween = gsap.to(this, {
            duration: Utils.randomInRange(3, 8) / this.speed,
            yoyo: true,
            repeat: -1, // Infinite repeat
            ease: 'sine.inOut',
            yoyoEase: true,
            /**
             * Modifier functions that run on each frame to calculate position
             * @private
             */
            modifiers: {
                x: x => this.ellipseEnabled ? this.x : (this.originX + Math.sin(performance.now() * this.frequency + this.phase) * this.amplitude),
                y: y => this.ellipseEnabled ? this.y : (this.originY + Math.cos(performance.now() * this.frequency * 0.8 + this.phase) * this.amplitude)
            }
        });

        // Pulsing effect with random variations
        this.pulseTween = gsap.to(this, {
            // Target size varies randomly around the base size
            currentSize: this.size * (1 + this.pulseAmount * (0.8 + Math.random() * 0.4)),
            duration: (1.5 + Math.random()) / this.speed,
            yoyo: true,
            repeat: -1, // Infinite repeat
            ease: 'sine.inOut',
            yoyoEase: true,
            /**
             * Callback triggered on each animation repeat
             * Randomizes the pulse amount for natural variation
             * @private
             */
            onRepeat: () => {
                // Randomly adjust the pulse amount for organic variation
                this.pulseAmount = 0.1 + Math.random() * 0.2;
            }
        });
    }

    /**
     * Updates the star's position and visual properties based on the current time and mouse position.
     * This is the main update method that should be called every frame.
     * 
     * @param {number} time - Current timestamp in milliseconds for animation timing
     * @param {Object} [mouse] - Current mouse position and normalized coordinates
     * @param {number} [mouse.x] - Current mouse x-coordinate
     * @param {number} [mouse.y] - Current mouse y-coordinate
     * @param {number} [mouse.normX] - Normalized x-coordinate (0-1)
     * @param {number} [mouse.normY] - Normalized y-coordinate (0-1)
     * @param {number} [maxDistance=150] - Maximum distance for mouse interaction in pixels
     * 
     * @example
     * // In the animation loop:
     * stars.forEach(star => star.update(performance.now(), mousePosition));
     */
    update(time, mouse, maxDistance = 150) {
        // Check if we should reset parallax (when mouse leaves or effect is disabled)
        if (!mouse || !mouse.normX || !mouse.normY) {
            // Smoothly return to original position when mouse leaves
            this.parallaxX *= 0.9;
            this.parallaxY *= 0.9;
            if (Math.abs(this.parallaxX) < 0.1) this.parallaxX = 0;
            if (Math.abs(this.parallaxY) < 0.1) this.parallaxY = 0;
        }
        // Note: Parallax positions are now handled by Starfield.updateParallaxPositions()
        // Update blinking effect
        this.updateBlinkingEffect(time);

        // Handle shooting star behavior

        // if (this.isShooting) {
        if (Star.settings.enabled && this.isShooting) {
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
        } else if (Star.settings.enabled && !this.isShooting &&
            Star.shootingStarsCount < Star.settings.maxStarsAtOnce &&
            (!Star.lastShootingStarTime || time - Star.lastShootingStarTime > Star.nextShootingStarDelay)) {
            // Only start shooting if:
            // 1. Not currently blinking
            // 2. Fewer than 3 stars are shooting
            // 3. Enough time has passed since the last shooting star
            this.startShooting(time);
            // console.log(Star.settings);
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
        if (mouse && this.moveStarsAwayFromMouse) {
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

    }

    /**
     * Renders the star on the canvas with a glowing effect.
     * The star is drawn with three layers:
     * 1. A main radial gradient for the star's body
     * 2. A small bright center for intensity
     * 3. A subtle outer glow for a magical effect
     * 
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas
     * @returns {void}
     * 
     * @example
     * // In the render loop:
     * stars.forEach(star => star.draw(canvasContext));
     * 
     * @throws {Error} Logs to console if there's an error during rendering
     */
    draw(ctx) {
        if (!ctx) return;

        // Calculate final position with parallax offset
        const drawX = this.x + (this.parallaxX || 0);
        const drawY = this.y + (this.parallaxY || 0);
        const gradientRadius = this.currentSize * 1.5;

        // Validate position values to prevent rendering errors
        if (!Number.isFinite(drawX) || !Number.isFinite(drawY) || !Number.isFinite(gradientRadius)) {
            console.warn('Skipping star draw due to invalid position values', {
                x: this.x,
                y: this.y,
                parallaxX: this.parallaxX,
                parallaxY: this.parallaxY,
                currentSize: this.currentSize
            });
            return;
        }

        try {
            // Create main star gradient (center is brighter, edges fade to transparent)
            const gradient = ctx.createRadialGradient(
                drawX, drawY, 0,                    // Inner circle (center)
                drawX, drawY, gradientRadius        // Outer circle (edge of glow)
            );
            gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, 95%, ${this.alpha})`);
            gradient.addColorStop(0.7, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);

            // Draw the main star body
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Add a small bright center for extra intensity
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.currentSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 95%, ${this.alpha * 1.5})`;
            ctx.fill();

            // Create a subtle glow around the star
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.currentSize * 1.5, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
                drawX, drawY, 0,                    // Inner circle (center)
                drawX, drawY, this.currentSize * 1.5 // Outer circle (edge of glow)
            );
            // Glow is more subtle and fades to transparent
            glowGradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, 95%, ${this.alpha * 0.2})`);
            glowGradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, 95%, 0)`);
            ctx.fillStyle = glowGradient;
            ctx.fill();
        } catch (error) {
            console.error('Error drawing star:', error);
        }
    }
}

export { Star };
