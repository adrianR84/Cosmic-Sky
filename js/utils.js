/**
 * Utility functions for the galaxy visualization using GSAP and Canvas
 */

class Utils {
    /**
     * Maps a value from one range to another
     * @param {number} value - The value to map
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} The mapped value
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Calculates the distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} The Euclidean distance between the points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Clamps a value between a minimum and maximum
     * @param {number} value - The value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} The clamped value
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Generates a random number between min and max
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} A random number in the specified range
     */
    static randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generates a random integer between min and max (inclusive)
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @returns {number} A random integer in the specified range
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Converts degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Generates a random color in HSL format with optional alpha
     * @param {number} [hue=null] - Fixed hue value (0-360), or null for random
     * @param {number} [saturation=100] - Saturation percentage (0-100)
     * @param {number} [lightness=50] - Lightness percentage (0-100)
     * @param {number} [alpha=1] - Alpha value (0-1)
     * @returns {string} HSL or HSLA color string
     */
    static randomColor(hue = null, saturation = 100, lightness = 50, alpha = 1) {
        const h = hue !== null ? hue : Math.floor(Math.random() * 360);
        const s = Math.min(100, Math.max(0, saturation));
        const l = Math.min(100, Math.max(0, lightness));
        
        if (alpha < 1) {
            return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /**
     * Creates a gradient that fades from color1 to color2
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {string} color1 - Starting color
     * @param {string} color2 - Ending color
     * @param {number} x0 - X coordinate of start point
     * @param {number} y0 - Y coordinate of start point
     * @param {number} x1 - X coordinate of end point
     * @param {number} y1 - Y coordinate of end point
     * @returns {CanvasGradient} The created gradient
     */
    static createGradient(ctx, color1, color2, x0, y0, x1, y1) {
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }

    /**
     * Calculates the frame rate (FPS)
     * @returns {Object} An object with FPS calculation methods
     */
    static fpsCounter() {
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 0;
        
        return {
            /**
             * Call this each frame to update FPS calculation
             * @param {number} [now=performance.now()] - Current timestamp
             * @returns {number} Current FPS
             */
            tick: function(now = performance.now()) {
                frameCount++;
                
                if (now - lastTime >= 1000) {
                    fps = Math.round((frameCount * 1000) / (now - lastTime));
                    frameCount = 0;
                    lastTime = now;
                }
                
                return fps;
            },
            
            /**
             * Get the current FPS
             * @returns {number} Current FPS
             */
            getFPS: function() {
                return fps;
            }
        };
    }
}

// Export the Utils class as default
export default Utils;
