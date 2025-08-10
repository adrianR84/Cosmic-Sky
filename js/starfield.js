import { Star } from './star.js';
import Utils from './utils/utils.js';

/**
 * Manages a collection of stars and their connections using Canvas 2D.
 * Handles star creation, animation, rendering, and user interaction.
 * @class
 */
class Starfield {
    /**
     * Create a new Starfield instance.
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     * @param {Object} [options={}] - Configuration options
     * @param {number} [options.starCount=500] - Total number of stars to create
     * @param {number} [options.connectionDistance=150] - Maximum distance to draw connections between stars (in pixels)
     * @param {number} [options.connectionOpacity=0.2] - Opacity of connection lines (0-1)
     * @param {Object} [options.starColor=null] - Optional fixed color for all stars
     * @param {string} [options.backgroundColor='#000428'] - Background color of the canvas
     * @param {number} [options.backgroundOpacity=1] - Background opacity (0-1)
     * @param {boolean} [options.ellipseEnabled=false] - Whether elliptical movement is enabled
     * @param {number} [options.ellipticalMovementRate=0.2] - Probability (0-1) of a star having elliptical movement
     * @param {number} [options.starMovementSpeed=0.5] - Global multiplier for star movement speed
     * @param {number} [options.maxStarsPerCluster=25] - Maximum stars per cluster
     * @param {number} [options.clusterCount=5] - Number of star clusters to create
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Initialize with default options
        this.options = {
            starCount: 500,
            connectionDistance: 150,
            // connectionOpacity: 0.2,
            starColor: null, // null for random colors
            background: {
                color: '#000428',
                opacity: 1
            },
            ellipseEnabled: false, // Default to original movement
            ellipticalMovementRate: options.ellipticalMovementRate !== undefined ? options.ellipticalMovementRate : 0.1,
            ...options
        };

        // Store the parsed color values for performance
        this._bgColor = this._parseColor(this.options.background.color);

        // State
        this.stars = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.lastTime = 0;
        this.fps = 0;
        this.visibleConnections = 0;
        // Set mouse connection settings from options or use defaults
        this.mouseConnectionsEnabled = this.options.mouseConnectionsEnabled !== undefined
            ? this.options.mouseConnectionsEnabled
            : true; // Default to true if not specified

        // Parallax configuration with defaults
        this.parallaxConfig = {
            enabled: true,
            intensity: 0.2,
            maxOffset: 100, // Max movement in pixels
            ...options.parallax
        };

        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Initialize
        this.init();
    }

    /**
     * Initialize the starfield by setting up the canvas, creating stars,
     * and starting the animation loop.
     * @returns {void}
     */
    init() {
        // Set canvas size
        this.resize();

        // Create stars
        this.createStars();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize FPS counter
        this.fpsCounter = Utils.fpsCounter();

        // Start animation loop
        this.animate();
    }

    /**
     * Set the maximum distance for connecting stars
     * @param {number} distance - The maximum connection distance in pixels
     */
    setConnectionDistance(distance) {
        this.options.connectionDistance = Math.max(0, distance);
    }

    /**
     * Enable or disable elliptical movement for stars
     * @param {boolean} enabled - Whether elliptical movement is enabled globally
     */
    setEllipseMovement(enabled) {
        this.options.ellipseEnabled = enabled;

        // Update all stars with the new ellipseEnabled state
        this.stars.forEach(star => {
            // Only enable elliptical movement for stars that were selected at creation
            const shouldBeEnabled = enabled && star._selectedForEllipse;

            // If enabling, initialize parameters if needed
            if (enabled && shouldBeEnabled && !star.ellipseRadiusX) {
                star.ellipseRadiusX = 50 + Math.random() * 100; // 50-150px horizontal radius
                star.ellipseRadiusY = 30 + Math.random() * 60;  // 30-90px vertical radius
                star.ellipseSpeed = 0.0005 + Math.random() * 0.001; // Random speed
                star.ellipseAngle = Math.random() * Math.PI * 2; // Random starting angle
                star.ellipsePhase = Math.random() * Math.PI * 2; // Random phase offset
            }

            // Update the star's ellipseEnabled state
            star.ellipseEnabled = shouldBeEnabled;
        });
    }

    /**
     * Set the global animation speed multiplier
     * @param {number} speed - Speed multiplier (0.0 to 5.0)
     */
    setAnimationSpeed(speed) {
        // Clamp speed between 0 and 5
        const clampedSpeed = Math.max(0, Math.min(speed, 5));
        this.animationSpeed = clampedSpeed;

        // Update any time-based animations
        this.stars.forEach(star => {
            if (star.animation && star.animation.timeScale) {
                star.animation.timeScale(clampedSpeed);
            }
        });
    }

    /**
     * Set the trail fade speed (how quickly trails disappear)
     * @param {number} speed - Fade speed (0.0 to 1.0, where 1.0 is instant)
     */
    setTrailFadeSpeed(speed) {
        // Clamp speed between 0.01 and 1.0
        this.options.trailFadeSpeed = Math.max(0.01, Math.min(speed, 1.0));
    }

    /**
     * Set the star movement speed multiplier
     * @param {number} speed - Speed multiplier (0.0 to 2.0)
     */
    setStarMovementSpeed(speed) {
        this.stars.forEach(star => {
            if (star.ellipseSpeed) {
                // Store base speed if not already set
                if (!star.baseEllipseSpeed) {
                    star.baseEllipseSpeed = star.ellipseSpeed;
                }
                // Apply speed multiplier to base speed
                star.ellipseSpeed = star.baseEllipseSpeed * speed;
            }
        });
    }

    /**
     * Create clusters of stars at random positions on the canvas.
     * @param {number} count - Number of clusters to create
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} starsPerCluster - Number of stars per cluster
     * @param {number} movementSpeed - Base movement speed multiplier
     * @private
     * @returns {void}
     */
    createClusters(count, width, height, starsPerCluster, movementSpeed) {
        const clusters = [];
        const padding = Math.min(width, height) * 0.1; // Keep clusters away from edges

        // Create cluster centers
        for (let i = 0; i < count; i++) {
            clusters.push({
                x: Utils.randomInRange(padding, width - padding),
                y: Utils.randomInRange(padding, height - padding),
                radius: Utils.randomInRange(30, 100)
            });
        }

        // Create stars in clusters
        clusters.forEach(cluster => {
            for (let i = 0; i < starsPerCluster; i++) {
                // Random position within cluster radius
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.pow(Math.random(), 1.5) * cluster.radius;
                const x = cluster.x + Math.cos(angle) * distance;
                const y = cluster.y + Math.sin(angle) * distance;

                // Create star with configurable movement
                const star = new Star(x, y, {
                    size: Utils.randomInRange(0.5, 2.5),
                    zIndex: Math.random(),
                    speed: Utils.randomInRange(0.05, 0.2) * movementSpeed, // Configurable movement speed
                    moveStarsAwayFromMouse: this.options.moveStarsAwayFromMouse !== undefined ? this.options.moveStarsAwayFromMouse : false,
                    amplitude: Utils.randomInRange(2, 10) * movementSpeed, // Configurable amplitude
                    frequency: Utils.randomInRange(0.0003, 0.001) * movementSpeed, // Configurable frequency
                    ellipseEnabled: this.options.ellipseEnabled, // Use global setting
                    ellipticalMovementRate: this.options.ellipticalMovementRate, // Pass the elliptical movement rate
                    ellipseRadiusX: Utils.randomInRange(10, 50) * (0.5 + Math.random() * 1.5), // Random variation
                    ellipseRadiusY: Utils.randomInRange(5, 30) * (0.5 + Math.random() * 1.5), // Random variation
                    ellipseSpeed: Utils.randomInRange(0.0005, 0.002) * movementSpeed * 4, // Speed based on movement speed
                    ellipseRotation: Math.random() * Math.PI * 2 // Random rotation
                });

                if (this.options.starColor) {
                    star.hue = this.options.starColor.hue || star.hue;
                    star.saturation = this.options.starColor.saturation || star.saturation;
                    star.lightness = this.options.starColor.lightness || star.lightness;
                }

                this.stars.push(star);
            }
        });
    }

    /**
     * Create and distribute stars across the canvas.
     * Creates both clustered and randomly distributed stars based on configuration.
     * @private
     * @returns {void}
     */
    createStars() {
        const { starCount } = this.options;
        const { width, height } = this.canvas;

        // Clear existing stars
        this.stars.forEach(star => star.dispose());
        this.stars = [];

        // Get configuration values from main.js or use defaults
        const starMovementSpeed = this.options.starMovementSpeed !== undefined ? this.options.starMovementSpeed : 0.5;
        const maxStarsPerCluster = this.options.maxStarsPerCluster !== undefined ? this.options.maxStarsPerCluster : 25;
        const clusterCount = this.options.clusterCount !== undefined ? this.options.clusterCount : 5;

        // Create clustered or distributed stars based on clusterEnabled flag
        let remainingStars = starCount;

        if (this.options.clustersEnabled !== false) {
            // Only create clusters if clustering is enabled
            const clusteredStars = Math.floor(starCount * 0.2);
            const starsPerCluster = Math.min(Math.floor(clusteredStars / clusterCount), maxStarsPerCluster);
            this.createClusters(clusterCount, width, height, starsPerCluster, starMovementSpeed);
            remainingStars = starCount - (clusterCount * starsPerCluster);
        }
        for (let i = 0; i < remainingStars; i++) {
            // Distribute some stars more towards the edges
            let x, y;
            if (Math.random() > 0.7) {
                // Place near edges
                const edge = Math.floor(Math.random() * 4);
                const pos = Math.random();
                if (edge === 0) { // Top
                    x = width * pos;
                    y = Math.random() * height * 0.2;
                } else if (edge === 1) { // Right
                    x = width - Math.random() * width * 0.2;
                    y = height * pos;
                } else if (edge === 2) { // Bottom
                    x = width * pos;
                    y = height - Math.random() * height * 0.2;
                } else { // Left
                    x = Math.random() * width * 0.2;
                    y = height * pos;
                }
            } else {
                // Random position in the canvas
                x = Utils.randomInRange(0, width);
                y = Utils.randomInRange(0, height);
            }

            // Create star with configurable movement speed
            const star = new Star(x, y, {
                size: Utils.randomInRange(0.3, 2.0), // Smaller range for distributed stars
                zIndex: Math.random(),
                speed: Utils.randomInRange(0.02, 0.15) * starMovementSpeed, // Configurable movement speed
                moveStarsAwayFromMouse: this.options.moveStarsAwayFromMouse !== undefined ? this.options.moveStarsAwayFromMouse : false,
                amplitude: Utils.randomInRange(1, 6) * starMovementSpeed, // Configurable amplitude
                frequency: Utils.randomInRange(0.0001, 0.0008) * starMovementSpeed, // Configurable frequency
                ellipticalMovementRate: this.options.ellipticalMovementRate, // Pass the elliptical movement rate
                ellipseEnabled: this.options.ellipseEnabled, // Use global setting
                ellipseRadiusX: Utils.randomInRange(10, 50) * (0.5 + Math.random() * 1.5), // Random variation
                ellipseRadiusY: Utils.randomInRange(5, 30) * (0.5 + Math.random() * 1.5), // Random variation
                ellipseSpeed: Utils.randomInRange(0.0005, 0.002) * starMovementSpeed * 4, // Speed based on movement speed
                ellipseRotation: Math.random() * Math.PI * 2 // Random rotation
            });

            if (this.options.starColor) {
                star.hue = this.options.starColor.hue || star.hue;
                star.saturation = this.options.starColor.saturation || star.saturation;
                star.lightness = this.options.starColor.lightness || star.lightness;
            }

            this.stars.push(star);
        }

        // Sort by z-index for proper layering
        this.stars.sort((a, b) => a.zIndex - b.zIndex);
    }


    /**
     * Update parallax positions based on mouse movement
     * @private
     * @returns {void}
     */
    updateParallaxPositions() {
        if (!this.mouse || !this.parallaxConfig.enabled) {
            // Reset parallax positions when disabled
            this.stars.forEach(star => {
                star.parallaxX = 0;
                star.parallaxY = 0;
            });
            return;
        }

        // Calculate base movement based on mouse position and intensity
        const baseX = this.mouse.normX * this.parallaxConfig.intensity * this.parallaxConfig.maxOffset;
        const baseY = this.mouse.normY * this.parallaxConfig.intensity * this.parallaxConfig.maxOffset;

        // Update each star's parallax position based on its depth
        this.stars.forEach(star => {
            // Deeper stars move less (multiply by depth)
            star.parallaxX = baseX * star.parallaxDepth;
            star.parallaxY = baseY * star.parallaxDepth;
        });
    }

    /**
     * Set parallax effect configuration
     * @param {Object} config - Parallax configuration
     * @param {boolean} [config.enabled] - Whether parallax effect is enabled
     * @param {number} [config.intensity] - Intensity of the parallax effect (0-1)
     * @param {number} [config.maxOffset] - Maximum movement in pixels
     */
    setParallaxConfig(config) {
        if (config.enabled !== undefined) {
            this.parallaxConfig.enabled = config.enabled;
        }
        if (config.intensity !== undefined) {
            this.parallaxConfig.intensity = Math.max(0, Math.min(1, config.intensity));
        }
        if (config.maxOffset !== undefined) {
            this.parallaxConfig.maxOffset = Math.max(0, config.maxOffset);
        }
    }

    /**
     * Enable or disable the parallax effect
     * @param {boolean} enabled - Whether to enable the parallax effect
     */
    setParallaxEnabled(enabled) {
        this.parallaxConfig.enabled = enabled;
        if (!enabled) {
            // Reset parallax positions when disabling
            this.stars.forEach(star => {
                star.parallaxX = 0;
                star.parallaxY = 0;
            });
        }
    }

    /**
     * Update all stars' positions and states based on the current time.
     * @param {number} time - Current timestamp in milliseconds
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @private
     * @returns {void}
     */
    updateStars(time, deltaTime) {
        const { connectionDistance } = this.options;
        this.visibleConnections = 0;

        this.stars.forEach(star => {
            // Update star position and appearance
            star.update(time, this.mouse, connectionDistance);

            // Count connections to mouse
            if (this.mouse) {
                const distToMouse = Utils.distance(star.x, star.y, this.mouse.x, this.mouse.y);
                if (distToMouse < connectionDistance) {
                    this.visibleConnections++;
                }
            }
        });
    }

    /**
     * Parse a CSS color string to an RGB object.
     * @param {string} color - Color string (hex, rgb, or rgba)
     * @returns {Object} Object with r, g, b values (0-255)
     * @private
     * @throws {Error} If the color string is invalid
     */
    _parseColor(color) {
        // If it's already an object with r,g,b, return it
        if (color && typeof color === 'object' && 'r' in color) return color;

        // Default to black if invalid
        if (!color) return { r: 0, g: 0, b: 0 };

        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
            const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
            const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
            return { r, g, b };
        }

        // Handle rgb/rgba colors
        if (color.startsWith('rgb')) {
            const [r, g, b] = color.match(/\d+/g).map(Number);
            return { r, g, b };
        }

        // Default to black if invalid
        return { r: 0, g: 0, b: 0 };
    }

    /**
     * Set the background color
     * @param {string} color - CSS color string (hex, rgb, or rgba)
     */
    setBackgroundColor(color) {
        if (!this.options.background) {
            this.options.background = { color, opacity: 1 };
        } else {
            this.options.background.color = color;
        }
        this._bgColor = this._parseColor(color);
    }

    /**
     * Set the background opacity
     * @param {number} opacity - Opacity value (0-1)
     */
    setBackgroundOpacity(opacity) {
        if (!this.options.background) {
            this.options.background = { color: '#000428', opacity: 1 };
        } else {
            this.options.background.opacity = opacity;
        }
        // This will trigger a redraw with the new colors
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animate();
        }
    }

    /**
     * Set the connection line opacity
     * @param {number} opacity - Opacity value (0-1)
     */
    setConnectionOpacity(opacity) {
        this.options.connectionColor.opacity = Math.max(0, Math.min(1, opacity));

        // Force a redraw to show the updated opacity immediately
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animate();
        }
    }

    /**
     * Main animation loop that updates and renders the starfield.
     * @param {number} [time=0] - Current timestamp in milliseconds
     * @private
     * @returns {void}
     */
    animate(time = 0) {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        // Calculate delta time
        if (!this.lastTime) this.lastTime = time;
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // Update FPS counter
        this.fps = this.fpsCounter ? this.fpsCounter.tick(time) : 0;

        // Clear canvas with configurable background color and trail fade effect
        const trailFadeSpeed = this.options.trailFadeSpeed !== undefined ? this.options.trailFadeSpeed : 0.05;
        const opacity = (this.options.background.opacity || 1) * trailFadeSpeed;
        this.ctx.fillStyle = `rgba(${this._bgColor.r}, ${this._bgColor.g}, ${this._bgColor.b}, ${opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update parallax positions based on mouse movement
        this.updateParallaxPositions();

        // Update and draw stars
        this.updateStars(time, deltaTime);

        // Draw connections if enabled
        if (this.mouseConnectionsEnabled) {
            this.drawConnections();
        }

        // Draw stars (on top of connections)
        this.drawStars();

        // Update stats display
        // this.updateStats();
    }

    /**
     * Draw all stars on the canvas.
     * @private
     * @returns {void}
     */
    drawStars() {
        this.ctx.save();

        // Draw each star
        this.stars.forEach(star => {
            star.draw(this.ctx);
        });

        this.ctx.restore();
    }

    /**
     * Draw connections between nearby stars and mouse
     * @private
     * @returns {void}
     */
    drawConnections() {
        if (this.options.connectionDistance > 0 && this.mouseConnectionsEnabled) {
            const connectionDistance = this.options.connectionDistance || 150;

            const { width, height } = this.canvas;
            const ctx = this.ctx;

            // Only draw connections if mouse is present
            if (!this.mouse) {
                return;
            }

            ctx.save();

            // Reset visible connections counter
            this.visibleConnections = 0;

            // Get connection colors from options with fallbacks
            const startColor = this.options.connectionColor?.start || '#e0ebee';
            const endColor = this.options.connectionColor?.end || '#044b16';
            const connectionOpacity = this.options.connectionColor?.opacity || 0.2;

            // Draw connections to mouse
            this.stars.forEach(star => {
                const dist = Utils.distance(star.x, star.y, this.mouse.x, this.mouse.y);

                if (dist < connectionDistance) {
                    const distanceRatio = 1 - (dist / connectionDistance);
                    const opacity = distanceRatio * connectionOpacity;

                    // Create gradient for this connection
                    const gradient = ctx.createLinearGradient(star.x, star.y, this.mouse.x, this.mouse.y);
                    
                    // Apply opacity to the colors in the gradient
                    const startColorWithOpacity = this._applyOpacityToColor(startColor, opacity);
                    const endColorWithOpacity = this._applyOpacityToColor(endColor, opacity * 0.8);
                    
                    gradient.addColorStop(0, startColorWithOpacity);
                    gradient.addColorStop(1, endColorWithOpacity);

                    // Draw connection line with gradient
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(this.mouse.x, this.mouse.y);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    this.visibleConnections++;
                }
            });

            ctx.restore();
        }
    }

    /**
     * Apply opacity to a CSS color string
     * @param {string} color - CSS color string (hex, rgb, or rgba)
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} Color string with applied opacity
     * @private
     */
    _applyOpacityToColor(color, opacity) {
        // If the color is already rgba, update the alpha channel
        if (color.startsWith('rgba')) {
            return color.replace(/[\d.]+(?=\s*\)$)/, opacity);
        }
        // If the color is rgb, convert to rgba with the new opacity
        else if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        }
        // If it's a hex color, convert to rgba
        else if (color.startsWith('#')) {
            // Convert hex to RGB
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        // Return as is if format is not recognized
        return color;
    }

    /**
     * Update performance statistics (FPS, connection count).
     * @private
     * @returns {void}
     */
    updateStats() {
        const fpsEl = document.getElementById('fps');
        const starsEl = document.getElementById('stars');
        const connectionsEl = document.getElementById('connections');

        if (fpsEl) fpsEl.textContent = this.fps;
        if (starsEl) starsEl.textContent = this.stars.length;
        if (connectionsEl) connectionsEl.textContent = this.visibleConnections;
    }


    /**
     * Set up event listeners for mouse movement and window resizing.
     * @private
     * @returns {void}
     */
    setupEventListeners() {
        // Update center points
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Mouse movement with throttling for better performance
        let lastMove = 0;
        const throttleDelay = 16; // ~60fps

        const handleMouseMove = (e) => {
            const now = performance.now();
            if (now - lastMove < throttleDelay) return;
            lastMove = now;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate normalized mouse position (-1 to 1)
            this.mouse = {
                x: x,
                y: y,
                normX: (x / this.canvas.width - 0.5) * 2,
                normY: (y / this.canvas.height - 0.5) * 2
            };

            // Parallax positions will be updated in the next animation frame
        };

        // Mouse move
        this.canvas.addEventListener('mousemove', handleMouseMove);

        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                handleMouseMove(mouseEvent);
            }
        }, { passive: false });

        // Mouse/touch leave
        const handleLeave = () => {
            // Smoothly return stars to original position
            this.stars.forEach(star => {
                star.parallaxX = 0;
                star.parallaxY = 0;
            });
            this.mouse = null;
        };

        this.canvas.addEventListener('mouseleave', handleLeave);
        this.canvas.addEventListener('touchend', handleLeave);
        this.canvas.addEventListener('touchcancel', handleLeave);

        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
        });

    }


    /**
     * Handle window resize events and update canvas dimensions.
     * @returns {void}
     */
    resize() {
        const { canvas } = this;
        const { innerWidth: width, innerHeight: height } = window;

        // Set display size (css pixels)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Set actual size in memory (scaled to account for extra pixel density)
        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);

        // Normalize coordinate system to use css pixels
        this.ctx.scale(scale, scale);

        // Update star positions if needed
        if (this.stars.length > 0) {
            const scaleX = width / this.canvas.width;
            const scaleY = height / this.canvas.height;

            this.stars.forEach(star => {
                star.originX *= scaleX;
                star.originY *= scaleY;
                star.x = star.originX + (Math.random() * 2 - 1) * 20; // Slight random offset
                star.y = star.originY + (Math.random() * 2 - 1) * 20;
            });
        }
    }

    /**
     * Pause the animation loop while maintaining the current state.
     * @returns {void}
     */
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this._isPaused = true;
        }
    }

    /**
     * Resume the animation loop if it was paused.
     * @returns {void}
     */
    resume() {
        if (this._isPaused) {
            this._isPaused = false;
            this.lastTime = performance.now(); // Reset last time to prevent large delta on resume
            this.animate();
        }
    }

    /**
     * Clean up resources and stop animations.
     * Should be called when the starfield is no longer needed.
     * @returns {void}
     */
    dispose() {
        // Pause the animation first
        this.pause();

        // Clean up event listeners
        if (this._handleResize) {
            window.removeEventListener('resize', this._handleResize);
        }
        if (this._handleMouseMove) {
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
        }
        if (this._handleLeave) {
            this.canvas.removeEventListener('mouseleave', this._handleLeave);
        }

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear references
        this.stars = [];
        this.mouse = null;
        this.animationId = null;
    }
}

export { Starfield };
