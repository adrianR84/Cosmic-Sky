/**
 * Main application entry point for the Cosmic Galaxy visualization
 */

// Global variables
let starfield;
let resizeTimeout;
let isInitialized = false;

// Configuration
const CONFIG = {
    starCount: 1000,
    connectionDistance: 250,
    animationSpeed: 1.0,
    starMovementSpeed: 0.2,      // New control for star movement speed
    maxStarsPerCluster: 25,      // New control for max stars per cluster
    clusterCount: 5,             // New control for number of clusters
    trailFadeSpeed: 0.2,        // New control for trail fade speed
    colors: {
        starHueMin: 200,
        starHueMax: 300,
        starSaturation: 80,
        starLightness: 80,
        connectionStart: 'rgba(255, 255, 255, 0.8)',
        connectionEnd: 'rgba(100, 149, 237, 0.4)'
    }
};

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if the browser supports required features
    if (!isCanvasSupported()) {
        showUnsupportedMessage();
        return;
    }

    // Handle window resize with debounce
    window.addEventListener('resize', handleResize);

    // Initialize the starfield
    init();

    // Initialize UI controls
    initUIControls();

    // Add event listener for ellipse movement toggle
    const ellipseToggle = document.getElementById('ellipseMovement');
    if (ellipseToggle) {
        ellipseToggle.addEventListener('change', (e) => {
            if (starfield) {
                starfield.setEllipseMovement(e.target.checked);
            }
        });
    }
});

/**
 * Check if the browser supports required features
 * @returns {boolean} True if all required features are supported
 */
function isCanvasSupported() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Show a message if the browser doesn't support required features
 */
function showUnsupportedMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        text-align: center;
        max-width: 80%;
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    message.innerHTML = `
        <h2>Browser Not Supported</h2>
        <p>Your browser doesn't support the required features for this visualization.</p>
        <p>Please try using a modern browser like Chrome, Firefox, or Edge.</p>
    `;
    document.body.appendChild(message);
}

/**
 * Initialize the starfield visualization
 */
function init() {
    if (isInitialized) return;

    // Get the canvas element
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    try {
        // Default options for the starfield
        const starfieldOptions = {
            starCount: CONFIG.starCount,
            connectionDistance: CONFIG.connectionDistance,
            starColor: {
                hue: Utils.randomInRange(CONFIG.colors.starHueMin, CONFIG.colors.starHueMax),
                saturation: CONFIG.colors.starSaturation,
                lightness: CONFIG.colors.starLightness
            },
            connectionColor: {
                start: CONFIG.colors.connectionStart,
                end: CONFIG.colors.connectionEnd
            },
            backgroundColor: 'transparent',
            trailFadeSpeed: CONFIG.trailFadeSpeed,
            ellipseMovement: false // Default to original movement
        };

        // Create the starfield with configuration
        starfield = new Starfield(canvas, starfieldOptions);

        // Set initial UI values
        updateUI();

        isInitialized = true;
    } catch (error) {
        console.error('Error initializing starfield:', error);
        showError('Failed to initialize the visualization. Please try refreshing the page.');
    }
}

/**
 * Handle window resize with debounce
 */
function handleResize() {
    // Clear any pending resize
    if (resizeTimeout) {
        cancelAnimationFrame(resizeTimeout);
    }

    // Debounce the resize handler
    resizeTimeout = requestAnimationFrame(() => {
        if (starfield) {
            starfield.resize();
        }
    });
}

/**
 * Update UI elements with current configuration
 */
function updateUI() {
    // Update star count display
    const starCountEl = document.getElementById('starCount');
    if (starCountEl) {
        starCountEl.value = CONFIG.starCount;
        document.getElementById('starCountValue').textContent = CONFIG.starCount;
    }

    // Update connection distance display
    const distanceEl = document.getElementById('connectionDistance');
    if (distanceEl) {
        distanceEl.value = CONFIG.connectionDistance;
        document.getElementById('distanceValue').textContent = CONFIG.connectionDistance;
    }

    // Update animation speed display
    const speedEl = document.getElementById('animationSpeed');
    if (speedEl) {
        speedEl.value = CONFIG.animationSpeed;
        document.getElementById('speedValue').textContent = CONFIG.animationSpeed.toFixed(1);

        // Set initial GSAP speed
        gsap.globalTimeline.timeScale(CONFIG.animationSpeed);
    }

    // Update star movement speed display
    const starMovementSpeedEl = document.getElementById('starMovementSpeed');
    if (starMovementSpeedEl) {
        starMovementSpeedEl.value = CONFIG.starMovementSpeed;
        document.getElementById('starMovementSpeedValue').textContent = CONFIG.starMovementSpeed.toFixed(2);
    }

    // Update max stars per cluster display
    const maxStarsPerClusterEl = document.getElementById('maxStarsPerCluster');
    if (maxStarsPerClusterEl) {
        maxStarsPerClusterEl.value = CONFIG.maxStarsPerCluster;
        document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.maxStarsPerCluster;
    }

    // Update cluster count display
    const clusterCountEl = document.getElementById('clusterCount');
    if (clusterCountEl) {
        clusterCountEl.value = CONFIG.clusterCount;
        document.getElementById('clusterCountValue').textContent = CONFIG.clusterCount;
    }

    // Update trail fade speed display
    const trailFadeSpeedEl = document.getElementById('trailFadeSpeed');
    if (trailFadeSpeedEl) {
        trailFadeSpeedEl.value = CONFIG.trailFadeSpeed;
        document.getElementById('trailFadeSpeedValue').textContent = CONFIG.trailFadeSpeed.toFixed(2);
    }
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 50, 50, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        max-width: 80%;
        text-align: center;
    `;
    errorEl.textContent = message;

    document.body.appendChild(errorEl);

    // Remove the error message after 5 seconds
    setTimeout(() => {
        errorEl.style.opacity = '0';
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.parentNode.removeChild(errorEl);
            }
        }, 300);
    }, 5000);
}

/**
 * Initialize UI controls for elliptical movement and star speed
 */
function initUIControls() {
    // Get UI elements
    const starCountInput = document.getElementById('starCount');
    const distanceInput = document.getElementById('connectionDistance');
    const speedInput = document.getElementById('animationSpeed');
    const starMovementSpeedInput = document.getElementById('starMovementSpeed');
    const maxStarsPerClusterInput = document.getElementById('maxStarsPerCluster');
    const clusterCountInput = document.getElementById('clusterCount');
    const trailFadeSpeedInput = document.getElementById('trailFadeSpeed');
    const ellipseToggle = document.getElementById('ellipseMovement');
    const bgColorPicker = document.getElementById('bgColor');
    const bgOpacitySlider = document.getElementById('bgOpacity');
    const bgColorValue = document.getElementById('bgColorValue');
    const opacityValue = document.getElementById('opacityValue');

    // Set initial values from CONFIG
    if (starCountInput) starCountInput.value = CONFIG.starCount;
    if (distanceInput) distanceInput.value = CONFIG.connectionDistance;
    if (speedInput) speedInput.value = CONFIG.animationSpeed;
    if (starMovementSpeedInput) starMovementSpeedInput.value = CONFIG.starMovementSpeed;
    if (maxStarsPerClusterInput) maxStarsPerClusterInput.value = CONFIG.maxStarsPerCluster;
    if (clusterCountInput) clusterCountInput.value = CONFIG.clusterCount;
    if (trailFadeSpeedInput) trailFadeSpeedInput.value = CONFIG.trailFadeSpeed;
    if (ellipseToggle) ellipseToggle.checked = false;
    if (bgColorPicker) bgColorPicker.value = '#000428';
    if (bgOpacitySlider) {
        bgOpacitySlider.value = 100;
        if (opacityValue) opacityValue.textContent = '100%';
    }

    // Add event listeners
    if (bgColorPicker && starfield) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            if (bgColorValue) bgColorValue.textContent = color;
            starfield.setBackgroundColor(color);
        });
    }

    if (bgOpacitySlider && starfield) {
        bgOpacitySlider.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            if (opacityValue) opacityValue.textContent = `${e.target.value}%`;
            starfield.setBackgroundOpacity(opacity);
        });
    }

    if (starCountInput) {
        starCountInput.addEventListener('input', (e) => {
            CONFIG.starCount = parseInt(e.target.value);
            document.getElementById('starCountValue').textContent = CONFIG.starCount;
            init(); // Reinitialize with new star count
        });
    }

    if (ellipseToggle) {
        ellipseToggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const starMovementSpeedContainer = document.getElementById('starMovementSpeedContainer');
            if (starMovementSpeedContainer) {
                starMovementSpeedContainer.style.display = isChecked ? 'block' : 'none';
            }
            if (starfield) {
                starfield.setEllipseMovement(isChecked);
            }
        });
    }

    if (starMovementSpeedInput) {
        // Set initial value display
        const starMovementSpeedValue = document.getElementById('starMovementSpeedValue');
        if (starMovementSpeedValue) {
            starMovementSpeedValue.textContent = starMovementSpeedInput.value;
        }

        starMovementSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            if (starMovementSpeedValue) {
                starMovementSpeedValue.textContent = speed.toFixed(2);
            }
            if (starfield) {
                starfield.setStarMovementSpeed(speed);
            }
        });
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause animations to save resources
        if (starfield && starfield.pause) {
            starfield.pause();
        }
    } else {
        // Page is visible again, resume animations
        if (starfield && starfield.resume) {
            starfield.resume();
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up resources
    if (starfield) {
        starfield.dispose();
    }
});
