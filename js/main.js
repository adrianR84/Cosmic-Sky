/**
 * Main application entry point for the Cosmic Galaxy visualization.
 * Handles initialization, configuration, and user interface interactions.
 * @module main
 */

// Import configuration and utilities
import { loadConfig, saveConfig, getConfig } from './config/index.js';
import { Starfield } from './starfield.js';
import ControlPanelManager from './utils/controlPanel.js';
import Utils from './utils/utils.js';

/** @type {Starfield} - The main starfield instance */
let starfield;

/** @type {number} - Timeout ID for debouncing resize events */
let resizeTimeout;

/** @type {boolean} - Flag to track if the application has been initialized */
let isInitialized = false;

// Load configuration with defaults
let CONFIG = getConfig();



/**
 * Initialize the application when the DOM is fully loaded.
 * Sets up event listeners and initializes the starfield visualization.
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if browser supports required features
    if (!isCanvasSupported()) {
        showUnsupportedMessage();
        return;
    }

    // Configuration is already loaded via getConfig()
    // No need to manually merge with defaults as it's handled by the config module
    const savedConfig = loadConfig();
    if (savedConfig) {
        CONFIG = savedConfig;
    }

    // Initialize the control panel
    const controlPanel = new ControlPanelManager();

    // Initialize the starfield with the current config
    init();

    // Set up UI controls after the starfield is ready
    initUIControls();

    // Initialize parallax controls state
    updateParallaxUI();

    // The control panel is now managed by ControlPanelManager in controlPanel.js
    // which is automatically initialized when the DOM is loaded

    // Set up window resize handler
    window.addEventListener('resize', handleResize);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animation when page is hidden
            if (starfield) starfield.pause();
        } else {
            // Resume animation when page is visible
            if (starfield) starfield.resume();
        }
    });

    // Apply any starfield-specific settings
    if (starfield) {
        starfield.setEllipseMovement(CONFIG.ellipseMovement);
        starfield.setBackgroundColor(CONFIG.bgColor);
        starfield.setBackgroundOpacity(CONFIG.bgOpacity);
        starfield.setConnectionDistance(CONFIG.connectionDistance);
        starfield.setAnimationSpeed(CONFIG.animationSpeed);
        starfield.setStarMovementSpeed(CONFIG.starMovementSpeed);
        starfield.setTrailFadeSpeed(CONFIG.trailFadeSpeed);

        // Apply parallax settings
        if (CONFIG.parallax) {
            starfield.setParallaxConfig({
                enabled: CONFIG.parallax.enabled,
                intensity: CONFIG.parallax.intensity,
                maxOffset: CONFIG.parallax.maxOffset
            });
        }
    }
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
    message.className = 'error-message';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 80%;
        text-align: center;
        z-index: 1000;
    `;
    message.innerHTML = `
        <h2>Browser Not Supported</h2>
        <p>Your browser does not support all the features required for this visualization.</p>
        <p>Please try using the latest version of Chrome, Firefox, Safari, or Edge.</p>
    `;
    document.body.appendChild(message);
}

/**
 * Display an error message to the user.
 * @param {string} message - The error message to display
 * @returns {void}
 */
function showError(message) {
    console.error(message);

    // Check if we already have an error message displayed
    let errorDiv = document.querySelector('.error-message');

    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 50, 50, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            max-width: 300px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(errorDiv);
    }

    errorDiv.textContent = message;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.transition = 'opacity 0.5s';
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                if (errorDiv && document.body.contains(errorDiv)) {
                    document.body.removeChild(errorDiv);
                }
            }, 500);
        }
    }, 5000);
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
            mouseConnectionsEnabled: CONFIG.mouseConnectionsEnabled !== undefined ? CONFIG.mouseConnectionsEnabled : true,
            moveStarsAwayFromMouse: CONFIG.moveStarsAwayFromMouse !== undefined ? CONFIG.moveStarsAwayFromMouse : false,
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
            ellipseMovement: false, // Default to original movement
            ellipticalMovementRate: CONFIG.ellipticalMovementRate, // Use configured elliptical movement rate
            clusterEnabled: CONFIG.clusterEnabled !== undefined ? CONFIG.clusterEnabled : true, // Respect cluster toggle, default to true
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
function updateParallaxUI() {
    if (!CONFIG.parallax) return;

    const enabledCheckbox = document.getElementById('parallaxEnabled');
    const intensitySlider = document.getElementById('parallaxIntensity');
    const maxOffsetSlider = document.getElementById('parallaxMaxOffset');

    if (enabledCheckbox) enabledCheckbox.checked = CONFIG.parallax.enabled;
    if (intensitySlider) intensitySlider.value = CONFIG.parallax.intensity;
    if (maxOffsetSlider) maxOffsetSlider.value = CONFIG.parallax.maxOffset;

    // Update displayed values
    const intensityValue = document.getElementById('parallaxIntensityValue');
    const maxOffsetValue = document.getElementById('parallaxMaxOffsetValue');

    if (intensityValue) intensityValue.textContent = CONFIG.parallax.intensity.toFixed(2);
    if (maxOffsetValue) maxOffsetValue.textContent = CONFIG.parallax.maxOffset;

    // Toggle controls based on enabled state
    const parallaxControls = document.getElementById('parallaxControls');
    if (parallaxControls) {
        parallaxControls.style.display = CONFIG.parallax.enabled ? 'block' : 'none';
        // Add smooth transition
        parallaxControls.style.transition = 'opacity 0.3s ease, display 0.3s ease';
    }
}

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
    // const starMovementSpeedEl = document.getElementById('starMovementSpeed');
    // if (starMovementSpeedEl) {
    //     starMovementSpeedEl.value = CONFIG.starMovementSpeed;
    //     document.getElementById('starMovementSpeedValue').textContent = CONFIG.starMovementSpeed.toFixed(2);
    // }

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
    // const ellipseToggle = document.getElementById('ellipseMovement');
    // if (ellipseToggle) {
    //     ellipseToggle.checked = CONFIG.ellipseMovement;
    //     const starMovementSpeedContainer = document.getElementById('starMovementSpeedContainer');
    //     if (starMovementSpeedContainer) {
    //         starMovementSpeedContainer.style.display = CONFIG.ellipseMovement ? 'block' : 'none';
    //     }
    // }

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
 * Initialize all UI controls and set up event listeners.
 * Handles user interactions with the control panel.
 * @returns {void}
 */
function initUIControls() {
    // Get UI elements
    const starCountInput = document.getElementById('starCount');
    const distanceInput = document.getElementById('connectionDistance');
    const speedInput = document.getElementById('animationSpeed');
    const maxStarsPerClusterInput = document.getElementById('maxStarsPerCluster');

    // Parallax controls (declared later where used)
    const clusterCountInput = document.getElementById('clusterCount');
    const trailFadeSpeedInput = document.getElementById('trailFadeSpeed');
    const bgColorPicker = document.getElementById('bgColor');
    const bgOpacitySlider = document.getElementById('bgOpacity');
    const bgColorValue = document.getElementById('bgColorValue');
    const opacityValue = document.getElementById('opacityValue');

    // Mouse connections controls
    const mouseConnectionsToggle = document.getElementById('enableMouseConnections');
    const connectionControls = document.getElementById('connectionControls');

    // Ellipse movement controls
    const ellipseToggle = document.getElementById('ellipseMovement');
    const ellipseControls = document.getElementById('ellipseControls');
    const ellipticalMovementRateInput = document.getElementById('ellipticalMovementRate');
    const starMovementSpeedInput = document.getElementById('starMovementSpeed');

    // Set initial values from CONFIG and update displays
    if (mouseConnectionsToggle) {
        mouseConnectionsToggle.checked = CONFIG.mouseConnectionsEnabled;
        if (connectionControls) {
            connectionControls.style.display = CONFIG.mouseConnectionsEnabled ? 'block' : 'none';
        }
    }

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

    // Add mouse connections toggle event listener
    if (mouseConnectionsToggle) {
        mouseConnectionsToggle.addEventListener('change', (e) => {
            CONFIG.mouseConnectionsEnabled = e.target.checked;
            if (connectionControls) {
                connectionControls.style.display = CONFIG.mouseConnectionsEnabled ? 'block' : 'none';
            }
            if (starfield) {
                starfield.setMouseConnectionsEnabled(CONFIG.mouseConnectionsEnabled);
            }
            saveConfig(CONFIG);
        });
    }

    // Add event listeners
    if (bgColorPicker && starfield) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            CONFIG.bgColor = color;
            if (bgColorValue) bgColorValue.textContent = color;
            starfield.setBackgroundColor(color);
            saveConfig(CONFIG);
        });
    }

    if (bgOpacitySlider && starfield) {
        bgOpacitySlider.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            CONFIG.bgOpacity = opacity;
            if (opacityValue) opacityValue.textContent = `${e.target.value}%`;
            starfield.setBackgroundOpacity(opacity);
            saveConfig(CONFIG);
        });
    }

    // Add event listener for trail fade speed
    if (trailFadeSpeedInput && starfield) {
        trailFadeSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            CONFIG.trailFadeSpeed = speed;
            document.getElementById('trailFadeSpeedValue').textContent = speed.toFixed(2);
            starfield.setTrailFadeSpeed(speed);
            saveConfig(CONFIG);
        });
    }

    if (starCountInput) {
        starCountInput.addEventListener('input', (e) => {
            CONFIG.starCount = parseInt(e.target.value);
            document.getElementById('starCountValue').textContent = CONFIG.starCount;
            saveConfig(CONFIG);
            init(); // Reinitialize with new star count
        });
    }

    // Ellipse movement controls initialization
    if (ellipseToggle && ellipseControls) {
        // Set initial state from config
        ellipseToggle.checked = CONFIG.ellipseMovement || false;
        ellipseControls.style.display = ellipseToggle.checked ? 'block' : 'none';

        // Toggle ellipse movement and controls visibility
        ellipseToggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            CONFIG.ellipseMovement = isChecked;
            ellipseControls.style.display = isChecked ? 'block' : 'none';

            if (starfield) {
                starfield.options.ellipseEnabled = isChecked;
                // Recreate stars to apply the new movement type
                starfield.createStars();
            }

            saveConfig(CONFIG);
        });

        // Update elliptical movement rate (displayed as percentage in UI but stored as 0-1)
        if (ellipticalMovementRateInput) {
            // Convert internal value (0-1) to percentage (0-100) for display
            const displayValue = ((CONFIG.ellipticalMovementRate || 0.1) * 100).toFixed(0);
            ellipticalMovementRateInput.value = CONFIG.ellipticalMovementRate || 0.1;
            document.getElementById('ellipticalMovementRateValue').textContent = displayValue;

            ellipticalMovementRateInput.addEventListener('input', (e) => {
                // Store the actual 0-1 value in the config
                const value = parseFloat(e.target.value);
                CONFIG.ellipticalMovementRate = value;

                // Display as percentage (0-100)
                const displayValue = (value * 100).toFixed(0);
                document.getElementById('ellipticalMovementRateValue').textContent = displayValue;

                if (starfield) {
                    starfield.options.ellipticalMovementRate = value;
                    // Recreate stars to apply the new movement rate
                    starfield.createStars();
                }

                saveConfig(CONFIG);
            });
        }

        // Update star movement speed
        if (starMovementSpeedInput) {
            starMovementSpeedInput.value = CONFIG.starMovementSpeed || 0.2;
            document.getElementById('starMovementSpeedValue').textContent = (CONFIG.starMovementSpeed || 0.2).toFixed(2);

            starMovementSpeedInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                CONFIG.starMovementSpeed = value;
                document.getElementById('starMovementSpeedValue').textContent = value.toFixed(2);

                if (starfield) {
                    // Update the starfield's movement speed
                    starfield.options.starMovementSpeed = value;
                    // Update all stars' movement speed
                    starfield.stars.forEach(star => {
                        if (star.animation) {
                            star.animation.timeScale(value);
                        }
                    });
                }

                saveConfig(CONFIG);
            });
        }
    }

    // Cluster controls toggle
    const enableClustersToggle = document.getElementById('enableClusters');
    const clusterControls = document.getElementById('clusterControls');

    if (enableClustersToggle && clusterControls) {
        // Set initial state from config (default to true if not set)
        enableClustersToggle.checked = CONFIG.clusterEnabled !== false;
        clusterControls.style.display = enableClustersToggle.checked ? 'block' : 'none';

        // Add event listener for toggle
        enableClustersToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            CONFIG.clusterEnabled = isEnabled;
            clusterControls.style.display = isEnabled ? 'block' : 'none';

            // Reinitialize the starfield to apply the clustering change
            if (starfield) {
                // Update the starfield's options
                starfield.options.clusterEnabled = isEnabled;
                // Recreate the stars with the new clustering setting
                starfield.createStars();
            }

            saveConfig(CONFIG);
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
            saveConfig(CONFIG);
        });
    }

    if (speedInput) {
        speedInput.addEventListener('input', (e) => {
            const newSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = newSpeed.toFixed(1);
            CONFIG.animationSpeed = newSpeed;
            if (starfield) starfield.setAnimationSpeed(newSpeed);
            saveConfig(CONFIG);
        });
    }

    if (maxStarsPerClusterInput) {
        maxStarsPerClusterInput.addEventListener('input', (e) => {
            CONFIG.maxStarsPerCluster = parseInt(e.target.value);
            document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.maxStarsPerCluster;
            saveConfig(CONFIG);
            // Reinitialize to apply the new max stars per cluster
            init();
        });
    }

    if (clusterCountInput) {
        clusterCountInput.addEventListener('input', (e) => {
            CONFIG.clusterCount = parseInt(e.target.value);
            document.getElementById('clusterCountValue').textContent = CONFIG.clusterCount;
            saveConfig(CONFIG);
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
            saveConfig(CONFIG);
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
                saveConfig(CONFIG);
            }
        });
    }

    // Parallax controls event listeners
    const parallaxEnabledInput = document.getElementById('parallaxEnabled');
    const parallaxIntensityInput = document.getElementById('parallaxIntensity');
    const parallaxMaxOffsetInput = document.getElementById('parallaxMaxOffset');

    if (parallaxEnabledInput) {
        // Set initial state
        if (CONFIG.parallax) {
            parallaxEnabledInput.checked = CONFIG.parallax.enabled !== false; // Default to true if not set
        }

        parallaxEnabledInput.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            if (!CONFIG.parallax) CONFIG.parallax = {};
            CONFIG.parallax.enabled = enabled;

            if (starfield) {
                starfield.setParallaxEnabled(enabled);
            }

            // Update UI to show/hide parallax controls based on enabled state
            updateParallaxUI();
            saveConfig(CONFIG);
        });
    }

    if (parallaxIntensityInput) {
        // Set initial value
        if (CONFIG.parallax && CONFIG.parallax.intensity !== undefined) {
            parallaxIntensityInput.value = CONFIG.parallax.intensity;
            document.getElementById('parallaxIntensityValue').textContent = CONFIG.parallax.intensity.toFixed(2);
        }

        parallaxIntensityInput.addEventListener('input', (e) => {
            const intensity = parseFloat(e.target.value);
            if (!CONFIG.parallax) CONFIG.parallax = {};
            CONFIG.parallax.intensity = intensity;

            if (starfield) {
                starfield.setParallaxConfig({ intensity });
            }

            document.getElementById('parallaxIntensityValue').textContent = intensity.toFixed(2);
            saveConfig(CONFIG);
        });
    }

    if (parallaxMaxOffsetInput) {
        // Set initial value
        if (CONFIG.parallax && CONFIG.parallax.maxOffset !== undefined) {
            parallaxMaxOffsetInput.value = CONFIG.parallax.maxOffset;
            document.getElementById('parallaxMaxOffsetValue').textContent = CONFIG.parallax.maxOffset;
        }

        parallaxMaxOffsetInput.addEventListener('input', (e) => {
            const maxOffset = parseInt(e.target.value);
            if (!CONFIG.parallax) CONFIG.parallax = {};
            CONFIG.parallax.maxOffset = maxOffset;

            if (starfield) {
                starfield.setParallaxConfig({ maxOffset });
            }

            document.getElementById('parallaxMaxOffsetValue').textContent = maxOffset;
            saveConfig(CONFIG);
        });
    }
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
