/**
 * Storage keys used in the application
 */
const STORAGE_KEYS = {
    MAIN_CONFIG: 'cosmicGalaxyConfig',
    CONTROL_PANEL: 'controlPanelState'
};

/**
 * Default configuration values for the Cosmic Galaxy visualization.
 * These are used when no saved configuration exists in localStorage.
 * @type {Object}
 */
const DEFAULT_CONFIG = {
    // Core settings
    starCount: 1000,
    animationSpeed: 1.0,
    trailFadeSpeed: 0.2,

    // Star clustering configuration
    clusters: {
        enabled: false,
        maxStarsPerCluster: 100,
        clusterCount: 5
    },

    // Visual settings
    bgColor: '#000428',
    bgOpacity: 1.0,

    moveStarsAwayFromMouse: false,

    // Features
    mouseConnection: {
        enabled: false,
        distance: 250
    },

    ellipseMovement: false,
    ellipticalMovementRate: 0.1,
    starMovementSpeed: 0.2,


    // Parallax settings
    parallax: {
        enabled: false,
        intensity: 0.2,
        maxOffset: 100
    },

    // Color settings
    colors: {
        starHueMin: 200,
        starHueMax: 300,
        starSaturation: 80,
        starLightness: 80,
        connectionStart: 'rgba(4, 75, 22, 1)',
        connectionEnd: 'rgba(224, 235, 238, 1)'
    }
};

// Export for use in other files
export { DEFAULT_CONFIG, STORAGE_KEYS };
