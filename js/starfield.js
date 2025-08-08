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
            connectionOpacity: 0.2,
            starColor: null, // null for random colors
            backgroundColor: '#000428', // Default background color
            backgroundOpacity: 1, // Default opacity (0-1)
            ellipseEnabled: false, // Default to original movement
            ellipticalMovementRate: 0.1, // 10% of stars will have elliptical movement
            ...options
        };

        // Store the parsed color values for performance
        this._bgColor = this._parseColor(this.options.backgroundColor);

        // State
        this.stars = [];
        this.mouse = null;
        this.animationId = null;
        this.lastTime = 0;
        this.fps = 0;
        this.visibleConnections = 0;

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
                    connectToMouse: true,
                    amplitude: Utils.randomInRange(2, 10) * movementSpeed, // Configurable amplitude
                    frequency: Utils.randomInRange(0.0003, 0.001) * movementSpeed, // Configurable frequency
                    ellipseEnabled: this.options.ellipseEnabled, // Use global setting
                    ellipticalMovementRate: this.options.ellipticalMovementRate, // Pass the elliptical movement rate
                    ellipseRadiusX: Utils.randomInRange(10, 50) * (0.5 + Math.random() * 1.5), // Random variation
                    ellipseRadiusY: Utils.randomInRange(5, 30) * (0.5 + Math.random() * 1.5), // Random variation
                    ellipseSpeed: Utils.randomInRange(0.0005, 0.002) * movementSpeed, // Speed based on movement speed
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

        // Create 20% of stars in clusters
        const clusteredStars = Math.floor(starCount * 0.2);
        const starsPerCluster = Math.min(Math.floor(clusteredStars / clusterCount), maxStarsPerCluster);
        this.createClusters(clusterCount, width, height, starsPerCluster, starMovementSpeed);

        // Create 80% of stars distributed throughout the canvas
        const remainingStars = starCount - (clusterCount * starsPerCluster);
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
                connectToMouse: true,
                amplitude: Utils.randomInRange(1, 6) * starMovementSpeed, // Configurable amplitude
                frequency: Utils.randomInRange(0.0001, 0.0008) * starMovementSpeed, // Configurable frequency
                ellipticalMovementRate: this.options.ellipticalMovementRate, // Pass the elliptical movement rate
                ellipseEnabled: this.options.ellipseEnabled, // Use global setting
                ellipseRadiusX: Utils.randomInRange(10, 50) * (0.5 + Math.random() * 1.5), // Random variation
                ellipseRadiusY: Utils.randomInRange(5, 30) * (0.5 + Math.random() * 1.5), // Random variation
                ellipseSpeed: Utils.randomInRange(0.0005, 0.002) * starMovementSpeed, // Speed based on movement speed
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
     * Set up event listeners for mouse movement and window resizing.
     * @private
     * @returns {void}
     */
    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }, { passive: false });

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse = null;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
        });

        // UI Controls
        const starCountInput = document.getElementById('starCount');
        const distanceInput = document.getElementById('connectionDistance');
        const speedInput = document.getElementById('animationSpeed');
        const starMovementSpeedInput = document.getElementById('starMovementSpeed');
        const maxStarsPerClusterInput = document.getElementById('maxStarsPerCluster');
        const clusterCountInput = document.getElementById('clusterCount');
        const trailFadeSpeedInput = document.getElementById('trailFadeSpeed');

        if (starCountInput) {
            starCountInput.addEventListener('input', (e) => {
                this.options.starCount = parseInt(e.target.value);
                document.getElementById('starCountValue').textContent = this.options.starCount;
                this.createStars();
            });
        }

        if (distanceInput) {
            distanceInput.addEventListener('input', (e) => {
                this.options.connectionDistance = parseInt(e.target.value);
                document.getElementById('distanceValue').textContent = this.options.connectionDistance;
            });
        }

        if (speedInput) {
            speedInput.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                document.getElementById('speedValue').textContent = speed.toFixed(1);
                gsap.globalTimeline.timeScale(speed);
            });
        }

        if (starMovementSpeedInput) {
            starMovementSpeedInput.addEventListener('input', (e) => {
                this.options.starMovementSpeed = parseFloat(e.target.value);
                document.getElementById('starMovementSpeedValue').textContent = this.options.starMovementSpeed.toFixed(2);
                this.createStars(); // Recreate stars with new movement speed
            });
        }

        if (maxStarsPerClusterInput) {
            maxStarsPerClusterInput.addEventListener('input', (e) => {
                this.options.maxStarsPerCluster = parseInt(e.target.value);
                document.getElementById('maxStarsPerClusterValue').textContent = this.options.maxStarsPerCluster;
                this.createStars(); // Recreate stars with new cluster size
            });
        }

        if (clusterCountInput) {
            clusterCountInput.addEventListener('input', (e) => {
                this.options.clusterCount = parseInt(e.target.value);
                document.getElementById('clusterCountValue').textContent = this.options.clusterCount;
                this.createStars(); // Recreate stars with new cluster count
            });
        }

        if (trailFadeSpeedInput) {
            trailFadeSpeedInput.addEventListener('input', (e) => {
                this.options.trailFadeSpeed = parseFloat(e.target.value);
                document.getElementById('trailFadeSpeedValue').textContent = this.options.trailFadeSpeed.toFixed(2);
            });
        }
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
        this.options.backgroundColor = color;
        this._bgColor = this._parseColor(color);
    }

    /**
     * Set the background opacity
     * @param {number} opacity - Opacity value (0-1)
     */
    setBackgroundOpacity(opacity) {
        this.options.backgroundOpacity = Math.min(1, Math.max(0, opacity));
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
        const opacity = (this.options.backgroundOpacity || 1) * trailFadeSpeed;
        this.ctx.fillStyle = `rgba(${this._bgColor.r}, ${this._bgColor.g}, ${this._bgColor.b}, ${opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw stars
        this.updateStars(time, deltaTime);

        // Draw connections
        this.drawConnections();

        // Draw stars (on top of connections)
        this.drawStars();

        // Update stats display
        this.updateStats();
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
     * Draw connections between stars that are within the connection distance.
     * @private
     * @returns {void}
     */
    drawConnections() {
        const { connectionDistance, connectionOpacity } = this.options;
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        // Only draw connections if mouse is present
        if (!this.mouse) return;

        ctx.save();

        // Draw connections to mouse
        this.stars.forEach(star => {
            const dist = Utils.distance(star.x, star.y, this.mouse.x, this.mouse.y);

            if (dist < connectionDistance) {
                const opacity = (1 - dist / connectionDistance) * connectionOpacity;

                // Create gradient for connection line
                const gradient = ctx.createLinearGradient(
                    star.x, star.y,
                    this.mouse.x, this.mouse.y
                );

                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                gradient.addColorStop(1, `rgba(100, 149, 237, ${opacity * 0.5})`);

                // Draw connection line
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
     * Clean up resources and stop animations.
     * Should be called when the starfield is no longer needed.
     * @returns {void}
     */
    dispose() {
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clean up stars
        this.stars.forEach(star => star.dispose());
        this.stars = [];

        // Remove event listeners
        const events = ['mousemove', 'touchmove', 'mouseleave', 'resize'];
        events.forEach(event => {
            window.removeEventListener(event, this[`on${event}`]);
        });
    }
}
