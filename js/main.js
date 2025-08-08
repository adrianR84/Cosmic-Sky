/**
 * Main application entry point for the Cosmic Galaxy visualization.
 * Handles initialization, configuration, and user interface interactions.
 * @module main
 */

/** @type {Starfield} - The main starfield instance */
let starfield;

/** @type {number} - Timeout ID for debouncing resize events */
let resizeTimeout;

/** @type {boolean} - Flag to track if the application has been initialized */
let isInitialized = false;

/**
 * Application configuration object with default values.
 * @type {Object}
 * @property {number} starCount=1000 - Total number of stars in the visualization
 * @property {number} connectionDistance=250 - Maximum distance (in pixels) to draw connections between stars
 * @property {number} animationSpeed=1.0 - Global animation speed multiplier
 * @property {number} starMovementSpeed=0.2 - Speed multiplier for star movement (0.0 to 1.0)
 * @property {number} maxStarsPerCluster=25 - Maximum number of stars per cluster
 * @property {number} clusterCount=5 - Number of star clusters to create
 * @property {number} trailFadeSpeed=0.2 - Speed at which star trails fade (0.0 to 1.0)
 * @property {Object} colors - Color configuration
 * @property {number} colors.starHueMin=200 - Minimum hue value for stars (0-360)
 * @property {number} colors.starHueMax=300 - Maximum hue value for stars (0-360)
 * @property {number} colors.starSaturation=80 - Saturation for stars (0-100)
 * @property {number} colors.starLightness=80 - Lightness for stars (0-100)
 * @property {string} colors.connectionStart='rgba(255, 255, 255, 0.8)' - Start color for connections
 * @property {string} colors.connectionEnd='rgba(100, 149, 237, 0.4)' - End color for connections
 */
/**
 * Default configuration values for the application.
 * These are used when no saved configuration exists.
 * @type {Object}
 */
const DEFAULT_CONFIG = {
    starCount: 1000,
    connectionDistance: 250,
    animationSpeed: 1.0,
    starMovementSpeed: 0.2,
    maxStarsPerCluster: 25,
    clusterCount: 5,
    trailFadeSpeed: 0.2,
    ellipseMovement: false,
    bgColor: '#000428',
    bgOpacity: 1.0,
    colors: {
        starHueMin: 200,
        starHueMax: 300,
        starSaturation: 80,
        starLightness: 80,
        connectionStart: 'rgba(255, 255, 255, 0.8)',
        connectionEnd: 'rgba(100, 149, 237, 0.4)'
    }
};

// Load configuration from localStorage or use defaults
let CONFIG = { ...DEFAULT_CONFIG };

/**
 * Save the current configuration to localStorage.
 * @returns {void}
 */
function saveConfig() {
    try {
        localStorage.setItem('cosmicGalaxyConfig', JSON.stringify(CONFIG));
    } catch (error) {
        console.error('Failed to save configuration:', error);
    }
}

/**
 * Load configuration from localStorage.
 * @returns {Object} The loaded configuration or null if none exists
 */
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('cosmicGalaxyConfig');
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
    return null;
}

/**
 * Apply configuration to the UI and starfield.
 * This is called when the user changes settings in the UI.
 * @param {Object} config - The configuration to apply
 * @returns {void}
 */
function applyConfig(config) {
    if (!config) return;

    // Update CONFIG with new values
    CONFIG = { ...CONFIG, ...config };

    // Save the updated configuration
    saveConfig();

    // Update UI elements
    updateUI();

    // Apply to starfield if it exists
    if (starfield) {
        if (config.ellipseMovement !== undefined) {
            starfield.setEllipseMovement(config.ellipseMovement);
        }
        if (config.bgColor !== undefined) {
            starfield.setBackgroundColor(config.bgColor);
        }
        if (config.bgOpacity !== undefined) {
            starfield.setBackgroundOpacity(config.bgOpacity);
        }
        if (config.connectionDistance !== undefined) {
            starfield.setConnectionDistance(config.connectionDistance);
        }
        if (config.animationSpeed !== undefined) {
            starfield.setAnimationSpeed(config.animationSpeed);
        }
        if (config.starMovementSpeed !== undefined) {
            starfield.setStarMovementSpeed(config.starMovementSpeed);
        }
        if (config.trailFadeSpeed !== undefined) {
            starfield.setTrailFadeSpeed(config.trailFadeSpeed);
        }
    }
}

/**
 * Initialize the application when the DOM is fully loaded.
 * Sets up event listeners and initializes the starfield visualization.
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if the browser supports required features
    if (!isCanvasSupported()) {
        showUnsupportedMessage();
        return;
    }

    // Initialize with default config first
    CONFIG = { ...DEFAULT_CONFIG };

    // Load saved configuration and apply it
    const savedConfig = loadConfig();
    if (savedConfig) {
        // Merge saved config with defaults
        CONFIG = { ...DEFAULT_CONFIG, ...savedConfig };
    }

    // Initialize the starfield with the current config
    init();

    // Initialize UI controls after the starfield is ready
    initUIControls();

    // Apply any starfield-specific settings
    if (starfield) {
        starfield.setEllipseMovement(CONFIG.ellipseMovement);
        starfield.setBackgroundColor(CONFIG.bgColor);
        starfield.setBackgroundOpacity(CONFIG.bgOpacity);
        starfield.setConnectionDistance(CONFIG.connectionDistance);
        starfield.setAnimationSpeed(CONFIG.animationSpeed);
        starfield.setStarMovementSpeed(CONFIG.starMovementSpeed);
        starfield.setTrailFadeSpeed(CONFIG.trailFadeSpeed);
    }

    // Handle window resize events with debouncing
    window.addEventListener('resize', handleResize);

    // Make controls panel draggable
    initDraggableControls();
});

/**
 * Check if the browser supports all required features.
 * @returns {boolean} True if all required features are supported
 */
function isCanvasSupported() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Display an error message when the browser doesn't support required features.
 * Shows a user-friendly message with instructions for modern browsers.
 * @returns {void}
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
 * Initialize the starfield visualization.
 * Creates a new Starfield instance and sets up the canvas.
 * @returns {void}
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
 * Update UI elements to reflect the current configuration.
 * Synchronizes form controls with the current state of the visualization.
 * @returns {void}
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

    // Update ellipse movement toggle
    const ellipseToggle = document.getElementById('ellipseMovement');
    if (ellipseToggle) {
        ellipseToggle.checked = CONFIG.ellipseMovement;
        const starMovementSpeedContainer = document.getElementById('starMovementSpeedContainer');
        if (starMovementSpeedContainer) {
            starMovementSpeedContainer.style.display = CONFIG.ellipseMovement ? 'block' : 'none';
        }
    }

    // Update background color and opacity
    const bgColorPicker = document.getElementById('bgColor');
    const bgOpacitySlider = document.getElementById('bgOpacity');
    const bgColorValue = document.getElementById('bgColorValue');
    const opacityValue = document.getElementById('opacityValue');

    if (bgColorPicker && bgColorValue) {
        bgColorPicker.value = CONFIG.bgColor;
        bgColorValue.textContent = CONFIG.bgColor;
    }

    if (bgOpacitySlider && opacityValue) {
        const opacityPercent = Math.round(CONFIG.bgOpacity * 100);
        bgOpacitySlider.value = opacityPercent;
        opacityValue.textContent = `${opacityPercent}%`;
    }
}

/**
 * Display an error message to the user.
 * @param {string} message - The error message to display
 * @returns {void}
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
 * Initialize all UI controls and set up event listeners.
 * Handles user interactions with the control panel.
 * @returns {void}
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

    // Set initial values from CONFIG and update displays
    if (starCountInput) {
        starCountInput.value = CONFIG.starCount;
        document.getElementById('starCountValue').textContent = CONFIG.starCount;
    }

    if (distanceInput) {
        distanceInput.value = CONFIG.connectionDistance;
        document.getElementById('distanceValue').textContent = CONFIG.connectionDistance;
    }

    if (speedInput) {
        speedInput.value = CONFIG.animationSpeed;
        document.getElementById('speedValue').textContent = CONFIG.animationSpeed.toFixed(1) + 'x';
    }

    if (starMovementSpeedInput) {
        starMovementSpeedInput.value = CONFIG.starMovementSpeed;
        const starMovementSpeedValue = document.getElementById('starMovementSpeedValue');
        if (starMovementSpeedValue) {
            starMovementSpeedValue.textContent = CONFIG.starMovementSpeed.toFixed(2);
        }
    }

    if (maxStarsPerClusterInput) {
        maxStarsPerClusterInput.value = CONFIG.maxStarsPerCluster;
        document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.maxStarsPerCluster;
    }

    if (clusterCountInput) {
        clusterCountInput.value = CONFIG.clusterCount;
        document.getElementById('clusterCountValue').textContent = CONFIG.clusterCount;
    }

    if (trailFadeSpeedInput) {
        trailFadeSpeedInput.value = CONFIG.trailFadeSpeed;
        document.getElementById('trailFadeSpeedValue').textContent = CONFIG.trailFadeSpeed.toFixed(2);
    }

    if (ellipseToggle) {
        ellipseToggle.checked = CONFIG.ellipseMovement;
        const starMovementSpeedContainer = document.getElementById('starMovementSpeedContainer');
        if (starMovementSpeedContainer) {
            starMovementSpeedContainer.style.display = CONFIG.ellipseMovement ? 'block' : 'none';
        }
    }

    if (bgColorPicker) {
        bgColorPicker.value = CONFIG.bgColor || '#000428';
        if (bgColorValue) bgColorValue.textContent = CONFIG.bgColor || '#000428';
    }

    if (bgOpacitySlider) {
        const opacityPercent = Math.round((CONFIG.bgOpacity || 1) * 100);
        bgOpacitySlider.value = opacityPercent;
        if (opacityValue) opacityValue.textContent = `${opacityPercent}%`;
    }

    // Add event listeners
    if (bgColorPicker && starfield) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            CONFIG.bgColor = color;
            if (bgColorValue) bgColorValue.textContent = color;
            starfield.setBackgroundColor(color);
            saveConfig();
        });
    }

    if (bgOpacitySlider && starfield) {
        bgOpacitySlider.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            CONFIG.bgOpacity = opacity;
            if (opacityValue) opacityValue.textContent = `${e.target.value}%`;
            starfield.setBackgroundOpacity(opacity);
            saveConfig();
        });
    }

    // Add event listener for trail fade speed
    if (trailFadeSpeedInput && starfield) {
        trailFadeSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            CONFIG.trailFadeSpeed = speed;
            document.getElementById('trailFadeSpeedValue').textContent = speed.toFixed(2);
            starfield.setTrailFadeSpeed(speed);
            saveConfig();
        });
    }

    if (starCountInput) {
        starCountInput.addEventListener('input', (e) => {
            CONFIG.starCount = parseInt(e.target.value);
            document.getElementById('starCountValue').textContent = CONFIG.starCount;
            saveConfig();
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
            CONFIG.ellipseMovement = isChecked;
            if (starfield) {
                starfield.setEllipseMovement(isChecked);
            }
            saveConfig();
        });
    }

    // Add event listeners for other controls
    if (distanceInput) {
        distanceInput.addEventListener('input', (e) => {
            CONFIG.connectionDistance = parseInt(e.target.value);
            document.getElementById('distanceValue').textContent = CONFIG.connectionDistance;
            if (starfield) {
                starfield.setConnectionDistance(CONFIG.connectionDistance);
            }
            saveConfig();
        });
    }

    if (speedInput) {
        speedInput.addEventListener('input', (e) => {
            CONFIG.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = CONFIG.animationSpeed.toFixed(1) + 'x';
            if (starfield) {
                starfield.setAnimationSpeed(CONFIG.animationSpeed);
            }
            saveConfig();
        });
    }

    if (maxStarsPerClusterInput) {
        maxStarsPerClusterInput.addEventListener('input', (e) => {
            CONFIG.maxStarsPerCluster = parseInt(e.target.value);
            document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.maxStarsPerCluster;
            saveConfig();
            // Reinitialize to apply the new max stars per cluster
            init();
        });
    }

    if (clusterCountInput) {
        clusterCountInput.addEventListener('input', (e) => {
            CONFIG.clusterCount = parseInt(e.target.value);
            document.getElementById('clusterCountValue').textContent = CONFIG.clusterCount;
            saveConfig();
            // Reinitialize to apply the new cluster count
            init();
        });
    }

    if (trailFadeSpeedInput) {
        trailFadeSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            CONFIG.trailFadeSpeed = speed;
            document.getElementById('trailFadeSpeedValue').textContent = speed.toFixed(2);
            if (starfield) {
                starfield.setTrailFadeSpeed(speed);
            }
            saveConfig();
        });
    }

    if (starMovementSpeedInput) {
        // Set initial value display
        const starMovementSpeedValue = document.getElementById('starMovementSpeedValue');
        if (starMovementSpeedValue) {
            starMovementSpeedValue.textContent = CONFIG.starMovementSpeed.toFixed(2);
        }

        starMovementSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            if (starMovementSpeedValue) {
                starMovementSpeedValue.textContent = speed.toFixed(2);
            }
            if (starfield) {
                CONFIG.starMovementSpeed = speed;
                starfield.setStarMovementSpeed(speed);
                saveConfig();
            }
        });
    }
}

/**
 * Makes the controls panel draggable
 * @returns {void}
 */
function initDraggableControls() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    let isDragging = false;
    let offsetX, offsetY;

    // Make controls draggable
    controls.addEventListener('mousedown', (e) => {
        // Only start drag on the controls panel itself, not on form elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.target.tagName === 'SPAN') {
            return;
        }

        isDragging = true;
        controls.classList.add('dragging');

        // Calculate the offset from the mouse to the top-left corner of the controls
        const rect = controls.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Prevent text selection while dragging
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // Calculate new position
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        // Update position
        controls.style.left = `${x}px`;
        controls.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        controls.classList.remove('dragging');
    });

    // Make sure we stop dragging if mouse leaves the window
    document.addEventListener('mouseleave', () => {
        isDragging = false;
        controls.classList.remove('dragging');
    });
}

/**
 * Handle page visibility changes.
 * Pauses animations when the page is hidden to save resources.
 * @listens visibilitychange
 */
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
