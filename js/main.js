/**
 * Main application entry point for the Cosmic Galaxy visualization.
 * Handles initialization, configuration, and user interface interactions.
 * @module main
 */

// Import configuration and utilities
import { loadConfig, saveConfig, getConfig, FEATURES } from './config/index.js';
import { Starfield } from './starfield.js';
import ControlPanelManager from './utils/controlPanel.js';
import Utils from './utils/utils.js';
import { isCanvasSupported, showError } from './utils/browser.js';

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
        showError('Your browser does not support all the features required for this visualization.');
        return;
    }

    // Initialize the control panel
    const controlPanel = new ControlPanelManager();

    // Initialize the starfield with the current config
    init();

    // Set up UI controls after the starfield is ready
    initUIControls();

    // Initialize parallax controls state
    updateParallaxUI();

});



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

            connectionDistance: CONFIG.mouseConnection.distance,
            mouseConnectionsEnabled: CONFIG.mouseConnection.enabled,

            moveStarsAwayFromMouse: CONFIG.moveStarsAwayFromMouse !== undefined ? CONFIG.moveStarsAwayFromMouse : false,

            clustersEnabled: CONFIG.clusters.enabled,
            maxStarsPerCluster: CONFIG.clusters.maxStarsPerCluster,
            clusterCount: CONFIG.clusters.clusterCount,

            starColor: {
                hue: Utils.randomInRange(CONFIG.colors.starHueMin, CONFIG.colors.starHueMax),
                saturation: CONFIG.colors.starSaturation,
                lightness: CONFIG.colors.starLightness
            },
            connectionColor: {
                start: CONFIG.colors.connectionStart,
                end: CONFIG.colors.connectionEnd,
                opacity: CONFIG.colors.connectionOpacity
            },
            background: {
                // Always use colorOriginal when background is disabled, otherwise use the current color
                color: CONFIG.background.enabled ? (CONFIG.background.color || CONFIG.background.colorOriginal) : CONFIG.background.colorOriginal,
                opacity: CONFIG.background.enabled ? (CONFIG.background.opacity ?? 1) : 0
            },
            trailFadeSpeed: CONFIG.trailFadeSpeed,

            ellipseEnabled: CONFIG.starMoving.enabled,
            ellipticalMovementRate: CONFIG.starMoving.ellipticalRate,

            starMovementSpeed: CONFIG.starMoving.speed,
        };

        // Create the starfield with configuration
        starfield = new Starfield(canvas, starfieldOptions);

        isInitialized = true;
    } catch (error) {
        console.error('Error initializing starfield:', error);
        showError('Failed to initialize the visualization. Please try refreshing the page.');
    }
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

    // Background controls
    const bgEnabledToggle = document.getElementById('bgEnabled');
    const bgControls = document.getElementById('bgControls');
    const bgColorPicker = document.getElementById('bgColor');
    const bgOpacitySlider = document.getElementById('bgOpacity');
    const bgColorValue = document.getElementById('bgColorValue');
    const opacityValue = document.getElementById('opacityValue');

    // Parallax controls (declared later where used)
    const clusterCountInput = document.getElementById('clusterCount');
    const trailFadeSpeedInput = document.getElementById('trailFadeSpeed');

    // Mouse connections controls
    const mouseConnectionsToggle = document.getElementById('enableMouseConnections');
    const connectionControls = document.getElementById('connectionControls');

    // Ellipse movement controls
    const ellipseToggle = document.getElementById('ellipseMovement');
    const ellipseControls = document.getElementById('ellipseControls');
    const ellipticalMovementRateInput = document.getElementById('ellipticalMovementRate');
    const starMovementSpeedInput = document.getElementById('starMovementSpeed');

    // Shooting stars controls
    const shootingStarsToggle = document.getElementById('enableShootingStars');
    const shootingStarsControls = document.getElementById('shootingStarControls');
    const maxStarsAtOnceInput = document.getElementById('maxStarsAtOnce');
    const maxShootDurationInput = document.getElementById('maxShootDuration');
    const maxEventSecondsInput = document.getElementById('maxEventSeconds');

    // Initialize background settings with safe defaults if not present
    if (!CONFIG.background) {
        CONFIG.background = {
            enabled: true,
            color: '#000428',
            colorOriginal: '#000428',
            opacity: 1.0
        };
    }
    
    // Ensure colorOriginal exists and is set to the default if not present
    if (CONFIG.background && !CONFIG.background.colorOriginal) {
        CONFIG.background.colorOriginal = CONFIG.background.color || '#000428';
    }

    // Set up background controls
    if (bgEnabledToggle) {
        bgEnabledToggle.checked = CONFIG.background.enabled;
        
        // Set initial visibility of background controls
        if (bgControls) {
            bgControls.style.display = CONFIG.background.enabled ? 'block' : 'none';
            bgControls.style.transition = 'opacity 0.3s ease, display 0.3s ease';
        }

        // Toggle background controls visibility
        bgEnabledToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            CONFIG.background.enabled = isEnabled;
            
            if (bgControls) {
                bgControls.style.display = isEnabled ? 'block' : 'none';
                
                // Apply background changes to the starfield if it exists
                if (starfield) {
                    if (isEnabled) {
                        // When enabling, use the saved color
                        starfield.setBackgroundColor(CONFIG.background.color, CONFIG.background.opacity);
                    } else {
                        // When disabling, use the original color but with 0 opacity
                        starfield.setBackgroundColor(CONFIG.background.colorOriginal, 0);
                    }
                }
            }
            
            // Save the updated configuration
            saveConfig(CONFIG);
        });
    }

    // Initialize shooting stars settings with safe defaults if not present
    if (!CONFIG.shootingStar) {
        CONFIG.shootingStar = {
            enabled: false,
            maxStarsAtOnce: 3,
            maxShootDurationSeconds: 3,
            maxEventSeconds: 0.5
        };
    }
    if (starfield) {
        starfield.updateShootingStarSettings(CONFIG.shootingStar);
    }

    if (maxStarsAtOnceInput) {
        maxStarsAtOnceInput.value = CONFIG.shootingStar.maxStarsAtOnce;
        document.getElementById('maxStarsAtOnceValue').textContent = CONFIG.shootingStar.maxStarsAtOnce;
    }
    if (maxShootDurationInput) {
        maxShootDurationInput.value = CONFIG.shootingStar.maxShootDurationSeconds;
        document.getElementById('maxShootDurationValue').textContent = CONFIG.shootingStar.maxShootDurationSeconds;
    }
    if (maxEventSecondsInput) {
        maxEventSecondsInput.value = CONFIG.shootingStar.maxEventSeconds;
        document.getElementById('maxEventSecondsValue').textContent = CONFIG.shootingStar.maxEventSeconds;
    }

    // Set initial values from CONFIG and update displays
    if (mouseConnectionsToggle) {
        // Initialize mouse connection settings with safe defaults if not present
        if (!CONFIG.mouseConnection) {
            CONFIG.mouseConnection = { enabled: false, distance: 250 };
        }
        mouseConnectionsToggle.checked = CONFIG.mouseConnection.enabled;
        if (connectionControls) {
            connectionControls.style.display = CONFIG.mouseConnection.enabled ? 'block' : 'none';
        }
    }

    if (starCountInput) {
        starCountInput.value = CONFIG.starCount;
        document.getElementById('starCountValue').textContent = CONFIG.starCount;
    }

    if (distanceInput) {
        // Ensure mouseConnection object exists
        if (!CONFIG.mouseConnection) {
            CONFIG.mouseConnection = { enabled: false, distance: 250 };
        }
        distanceInput.value = CONFIG.mouseConnection.distance;
        document.getElementById('distanceValue').textContent = CONFIG.mouseConnection.distance;
    }

    if (speedInput) {
        speedInput.value = CONFIG.animationSpeed;
        document.getElementById('speedValue').textContent = CONFIG.animationSpeed.toFixed(1) + 'x';
    }

    if (starMovementSpeedInput) {
        starMovementSpeedInput.value = CONFIG.starMoving.speed;
        const starMovementSpeedValue = document.getElementById('starMovementSpeedValue');
        if (starMovementSpeedValue) {
            starMovementSpeedValue.textContent = CONFIG.starMoving.speed.toFixed(2);
        }
    }

    // Initialize clusters object if it doesn't exist
    if (!CONFIG.clusters) {
        CONFIG.clusters = {
            enabled: true,
            maxStarsPerCluster: 100,
            clusterCount: 5
        };
    }

    if (maxStarsPerClusterInput) {
        maxStarsPerClusterInput.value = CONFIG.clusters.maxStarsPerCluster;
        document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.clusters.maxStarsPerCluster;
    }

    if (clusterCountInput) {
        clusterCountInput.value = CONFIG.clusters.clusterCount;
        document.getElementById('clusterCountValue').textContent = CONFIG.clusters.clusterCount;
    }

    if (trailFadeSpeedInput) {
        trailFadeSpeedInput.value = CONFIG.trailFadeSpeed;
        document.getElementById('trailFadeSpeedValue').textContent = CONFIG.trailFadeSpeed.toFixed(2);
    }

    if (ellipseToggle) {
        ellipseToggle.checked = CONFIG.starMoving.enabled;
        const starMovementSpeedContainer = document.getElementById('starMovementSpeedContainer');
        if (starMovementSpeedContainer) {
            starMovementSpeedContainer.style.display = CONFIG.starMoving.enabled ? 'block' : 'none';
        }
    }

    if (bgColorPicker) {
        const bgColor = CONFIG.background?.color || '#000428';
        bgColorPicker.value = bgColor;
        if (bgColorValue) bgColorValue.textContent = bgColor;
    }

    if (bgOpacitySlider) {
        const opacity = CONFIG.background?.opacity ?? 1;
        const opacityPercent = Math.round(opacity * 100);
        bgOpacitySlider.value = opacityPercent;
        if (opacityValue) opacityValue.textContent = `${opacityPercent}%`;
    }

    // Add mouse connections toggle event listener
    if (mouseConnectionsToggle) {
        // Set initial state from config
        if (CONFIG.mouseConnection) {
            mouseConnectionsToggle.checked = CONFIG.mouseConnection.enabled;
            if (connectionControls) {
                connectionControls.style.display = CONFIG.mouseConnection.enabled ? 'block' : 'none';
            }
        }

        mouseConnectionsToggle.addEventListener('change', (e) => {
            if (!CONFIG.mouseConnection) {
                CONFIG.mouseConnection = { enabled: true };
            }
            CONFIG.mouseConnection.enabled = e.target.checked;
            if (connectionControls) {
                connectionControls.style.display = CONFIG.mouseConnection.enabled ? 'block' : 'none';
            }
            if (starfield) {
                starfield.mouseConnectionsEnabled = CONFIG.mouseConnection.enabled;
            }
            saveConfig(CONFIG);
        });
    }

    // Initialize connection color controls
    const connectionColorStartInput = document.getElementById('connectionColorStart');
    const connectionColorEndInput = document.getElementById('connectionColorEnd');
    const connectionOpacityInput = document.getElementById('connectionOpacity');

    // Helper function to convert rgba to hex
    const rgbaToHex = (rgba) => {
        // Extract r, g, b values from rgba string
        const values = rgba.match(/\d+/g);
        if (!values || values.length < 3) return '#000000';

        const r = parseInt(values[0]).toString(16).padStart(2, '0');
        const g = parseInt(values[1]).toString(16).padStart(2, '0');
        const b = parseInt(values[2]).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`.toLowerCase();
    };

    // Set initial values from config
    if (connectionColorStartInput) {
        const startColor = CONFIG.colors.connectionStart || '#044b16';
        const hexColor = startColor.startsWith('#') ? startColor : rgbaToHex(startColor);
        connectionColorStartInput.value = hexColor;
        document.getElementById('connectionColorStartValue').textContent = hexColor;
    }

    if (connectionColorEndInput) {
        const endColor = CONFIG.colors.connectionEnd || '#e0ebee';
        const hexColor = endColor.startsWith('#') ? endColor : rgbaToHex(endColor);
        connectionColorEndInput.value = hexColor;
        document.getElementById('connectionColorEndValue').textContent = hexColor;
    }

    if (connectionOpacityInput) {
        const opacityPercent = Math.round((CONFIG.colors.connectionOpacity || 0.2) * 100);
        connectionOpacityInput.value = opacityPercent;
        document.getElementById('connectionOpacityValue').textContent = `${opacityPercent}`;
    }

    // Add event listeners for connection color controls
    if (connectionColorStartInput && starfield) {
        connectionColorStartInput.addEventListener('input', (e) => {
            const color = e.target.value;
            CONFIG.colors.connectionStart = color;
            document.getElementById('connectionColorStartValue').textContent = color;

            if (starfield.options.connectionColor) {
                starfield.options.connectionColor.start = color;
                starfield.setConnectionOpacity();
            }
            saveConfig(CONFIG);
        });
    }

    if (connectionColorEndInput && starfield) {
        connectionColorEndInput.addEventListener('input', (e) => {
            const color = e.target.value;
            CONFIG.colors.connectionEnd = color;
            document.getElementById('connectionColorEndValue').textContent = color;

            if (starfield.options.connectionColor) {
                starfield.options.connectionColor.end = color;
                starfield.setConnectionOpacity();
            }
            saveConfig(CONFIG);
        });
    }

    if (connectionOpacityInput && starfield) {
        connectionOpacityInput.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100; // Convert to 0-1 range
            CONFIG.colors.connectionOpacity = opacity;
            document.getElementById('connectionOpacityValue').textContent = `${e.target.value}`;

            if (starfield) {

                starfield.setConnectionOpacity(opacity);
            }
            saveConfig(CONFIG);
        });
    }

    // Add event listeners
    if (bgColorPicker && starfield) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            if (!CONFIG.background) CONFIG.background = {};
            CONFIG.background.color = color;
            if (bgColorValue) bgColorValue.textContent = color;
            starfield.setBackgroundColor(color);
            saveConfig(CONFIG);
        });
    }

    if (bgOpacitySlider && starfield) {
        bgOpacitySlider.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            if (!CONFIG.background) CONFIG.background = {};
            CONFIG.background.opacity = opacity;
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
            if (starfield) {
                starfield.options.starCount = CONFIG.starCount;
                starfield.createStars();
            }
        });
    }

    // Ellipse movement controls initialization
    if (ellipseToggle && ellipseControls) {
        // Set initial state from config
        ellipseToggle.checked = CONFIG.starMoving.enabled || false;
        ellipseControls.style.display = ellipseToggle.checked ? 'block' : 'none';

        // Toggle ellipse movement and controls visibility
        ellipseToggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            CONFIG.starMoving.enabled = isChecked;
            ellipseControls.style.display = isChecked ? 'block' : 'none';

            if (starfield) {
                starfield.options.ellipseEnabled = isChecked;
                // starfield.setEllipseMovement(isChecked);
                // Recreate stars to apply the new movement type
                starfield.createStars();
            }

            saveConfig(CONFIG);
        });

        // Update elliptical movement rate (displayed as percentage in UI but stored as 0-1)
        if (ellipticalMovementRateInput) {
            // Convert internal value (0-1) to percentage (0-100) for display
            const displayValue = ((CONFIG.starMoving.ellipticalRate || 0.1) * 100).toFixed(0);
            ellipticalMovementRateInput.value = CONFIG.starMoving.ellipticalRate || 0.1;
            document.getElementById('ellipticalMovementRateValue').textContent = displayValue;

            ellipticalMovementRateInput.addEventListener('input', (e) => {
                // Store the actual 0-1 value in the config
                const value = parseFloat(e.target.value);
                CONFIG.starMoving.ellipticalRate = value;

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
            starMovementSpeedInput.value = CONFIG.starMoving.speed || 0.2;
            document.getElementById('starMovementSpeedValue').textContent = (CONFIG.starMoving.speed || 0.2).toFixed(2);

            starMovementSpeedInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                CONFIG.starMoving.speed = value;
                document.getElementById('starMovementSpeedValue').textContent = value.toFixed(2);

                if (starfield) {
                    // Update the starfield's movement speed
                    starfield.options.starMovementSpeed = value;

                    starfield.setStarMovementSpeed(value);
                    // // Update all stars' movement speed
                    // starfield.stars.forEach(star => {
                    //     if (star.animation) {
                    //         star.animation.timeScale(value);
                    //     }
                    // });
                }

                saveConfig(CONFIG);
            });
        }
    }

    // Initialize shooting stars controls
    if (shootingStarsToggle && shootingStarsControls) {
        // Set initial state from config
        shootingStarsToggle.checked = CONFIG.shootingStar.enabled || false;
        shootingStarsControls.style.display = shootingStarsToggle.checked ? 'block' : 'none';

        // Toggle shooting stars
        shootingStarsToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            CONFIG.shootingStar.enabled = isEnabled;
            shootingStarsControls.style.display = isEnabled ? 'block' : 'none';

            // Update starfield with new settings
            if (starfield && typeof starfield.updateShootingStarSettings === 'function') {
                starfield.updateShootingStarSettings({
                    enabled: isEnabled
                });
            }
            saveConfig(CONFIG);
        });

        // Max stars at once
        if (maxStarsAtOnceInput) {
            maxStarsAtOnceInput.value = CONFIG.shootingStar.maxStarsAtOnce || 3;
            document.getElementById('maxStarsAtOnceValue').textContent = CONFIG.shootingStar.maxStarsAtOnce || 3;

            maxStarsAtOnceInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                CONFIG.shootingStar.maxStarsAtOnce = value;
                document.getElementById('maxStarsAtOnceValue').textContent = value;

                if (starfield && typeof starfield.updateShootingStarSettings === 'function') {
                    starfield.updateShootingStarSettings({
                        maxStarsAtOnce: value
                    });
                }
                saveConfig(CONFIG);
            });
        }

        // Max shoot duration
        if (maxShootDurationInput) {
            maxShootDurationInput.value = CONFIG.shootingStar.maxShootDurationSeconds || 3;
            document.getElementById('maxShootDurationValue').textContent = CONFIG.shootingStar.maxShootDurationSeconds || 3;

            maxShootDurationInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                CONFIG.shootingStar.maxShootDurationSeconds = value;
                document.getElementById('maxShootDurationValue').textContent = value;

                if (starfield && typeof starfield.updateShootingStarSettings === 'function') {
                    starfield.updateShootingStarSettings({
                        maxShootDurationSeconds: value
                    });
                }
                saveConfig(CONFIG);
            });
        }

        // Max event seconds
        if (maxEventSecondsInput) {
            maxEventSecondsInput.value = CONFIG.shootingStar.maxEventSeconds || 6;
            document.getElementById('maxEventSecondsValue').textContent = CONFIG.shootingStar.maxEventSeconds || 6;

            maxEventSecondsInput.addEventListener('input', (e) => {
                const value = e.target.value;
                CONFIG.shootingStar.maxEventSeconds = value;
                document.getElementById('maxEventSecondsValue').textContent = value;

                if (starfield && typeof starfield.updateShootingStarSettings === 'function') {
                    starfield.updateShootingStarSettings({
                        maxEventSeconds: value
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
        // Ensure clusters object exists
        if (!CONFIG.clusters) {
            CONFIG.clusters = {
                enabled: true,
                maxStarsPerCluster: 100,
                clusterCount: 5
            };
        }

        // Set initial state from config (default to true if not set)
        enableClustersToggle.checked = CONFIG.clusters.enabled !== false;
        clusterControls.style.display = enableClustersToggle.checked ? 'block' : 'none';

        // Add event listener for toggle
        enableClustersToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            CONFIG.clusters.enabled = isEnabled;
            clusterControls.style.display = isEnabled ? 'block' : 'none';

            // Reinitialize the starfield to apply the clustering change
            if (starfield) {
                // Update the starfield's options
                if (starfield.options) {
                    starfield.options.clustersEnabled = isEnabled;
                }
                // Recreate the stars with the new clustering setting
                if (typeof starfield.createStars === 'function') {
                    starfield.createStars();
                }
            }
            saveConfig(CONFIG);

        });
    }

    if (maxStarsPerClusterInput) {
        maxStarsPerClusterInput.addEventListener('input', (e) => {
            // Ensure clusters object exists
            if (!CONFIG.clusters) {
                CONFIG.clusters = {
                    enabled: true,
                    maxStarsPerCluster: 100,
                    clusterCount: 5
                };
            }
            CONFIG.clusters.maxStarsPerCluster = parseInt(e.target.value);
            document.getElementById('maxStarsPerClusterValue').textContent = CONFIG.clusters.maxStarsPerCluster;
            saveConfig(CONFIG);
            if (starfield) {
                starfield.options.maxStarsPerCluster = CONFIG.clusters.maxStarsPerCluster;
                starfield.createStars();
            }
        });
    }

    if (clusterCountInput) {
        clusterCountInput.addEventListener('input', (e) => {
            // Ensure clusters object exists
            if (!CONFIG.clusters) {
                CONFIG.clusters = {
                    enabled: true,
                    maxStarsPerCluster: 100,
                    clusterCount: 5
                };
            }
            CONFIG.clusters.clusterCount = parseInt(e.target.value);
            document.getElementById('clusterCountValue').textContent = CONFIG.clusters.clusterCount;
            saveConfig(CONFIG);
            if (starfield) {
                starfield.options.clusterCount = CONFIG.clusters.clusterCount;
                starfield.createStars();
            }
        });
    }

    if (distanceInput) {
        distanceInput.addEventListener('input', (e) => {
            // Ensure mouseConnection object exists
            if (!CONFIG.mouseConnection) {
                CONFIG.mouseConnection = { enabled: false, distance: 250 };
            }
            CONFIG.mouseConnection.distance = parseInt(e.target.value);
            document.getElementById('distanceValue').textContent = CONFIG.mouseConnection.distance;
            if (starfield) {
                starfield.setConnectionDistance(CONFIG.mouseConnection.distance);
            }
            saveConfig(CONFIG);
        });
    }

    if (speedInput) {
        speedInput.addEventListener('input', (e) => {
            const newSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = newSpeed.toFixed(1);
            CONFIG.animationSpeed = newSpeed;
            if (starfield) {
                starfield.setAnimationSpeed(newSpeed);
                // gsap.globalTimeline.timeScale(newSpeed);
            }
            saveConfig(CONFIG);
        });
    }


    // Add event listener for regenerate canvas button
    const regenerateBtn = document.getElementById('regenerateCanvas');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
            if (starfield) {
                // Recreate stars with current settings
                starfield.createStars();

                // Show a brief visual feedback
                regenerateBtn.textContent = 'Regenerating...';
                regenerateBtn.disabled = true;

                // Reset button state after a short delay
                setTimeout(() => {
                    regenerateBtn.textContent = 'Regenerate Canvas';
                    regenerateBtn.disabled = false;
                }, 1000);
            }
        });
    }

    // Initialize clear settings button if the feature is enabled
    const clearSettingsBtn = document.getElementById('clearSettings');
    if (clearSettingsBtn) {
        // Show or hide the button based on the feature flag
        if (FEATURES.CLEAR_LOCAL_STORAGE) {
            clearSettingsBtn.style.display = 'block';

            clearSettingsBtn.addEventListener('click', () => {
                // Clear local storage
                localStorage.clear();

                // Show feedback
                clearSettingsBtn.textContent = 'Cleared!';
                clearSettingsBtn.style.backgroundColor = '#4CAF50';

                // Reload the page to apply default settings
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        } else {
            // Hide the button if the feature is disabled
            clearSettingsBtn.style.display = 'none';
        }
    }

    if (trailFadeSpeedInput) {
        trailFadeSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            CONFIG.trailFadeSpeed = speed;
            document.getElementById('trailFadeSpeedValue').textContent = speed.toFixed(2);
            if (starfield) {
                starfield.setTrailFadeSpeed(speed);
                // starfield.createStars();
            }
            saveConfig(CONFIG);
        });
    }

    if (starMovementSpeedInput) {
        // Set initial value display
        const starMovementSpeedValue = document.getElementById('starMovementSpeedValue');
        if (starMovementSpeedValue) {
            starMovementSpeedValue.textContent = CONFIG.starMoving.speed.toFixed(2);
        }

        starMovementSpeedInput.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            if (starMovementSpeedValue) {
                starMovementSpeedValue.textContent = speed.toFixed(2);
            }
            if (starfield) {
                CONFIG.starMoving.speed = speed;
                starfield.setStarMovementSpeed(speed);
                saveConfig(CONFIG);
                starfield.createStars();
            }
        });
    }


    if (CONFIG.parallax) {
        starfield.setParallaxConfig({
            enabled: CONFIG.parallax.enabled,
            intensity: CONFIG.parallax.intensity,
            maxOffset: CONFIG.parallax.maxOffset
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


// Set up window resize handler
window.addEventListener('resize', handleResize);

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

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up resources
    if (starfield) {
        starfield.dispose();
    }
});
