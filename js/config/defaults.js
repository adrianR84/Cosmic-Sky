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

    // Star clustering
    maxStarsPerCluster: 100,
    clusterCount: 5,

    // Visual settings
    bgColor: '#000428',
    bgOpacity: 1.0,

    moveStarsAwayFromMouse: false,

    // Features
    mouseConnectionsEnabled: false,
    connectionDistance: 250,


    starMovementSpeed: 0.2,


    ellipseMovement: false,
    ellipticalMovementRate: 0.1,


    // Parallax settings
    parallax: {
        enabled: true,
        intensity: 0.2,
        maxOffset: 100
    },

    // Color settings
    colors: {
        starHueMin: 200,
        starHueMax: 300,
        starSaturation: 80,
        starLightness: 80,
        connectionStart: 'rgba(3, 28, 39, 0.8)',
        connectionEnd: 'rgba(146, 29, 8, 0.4)'
    }
};

// Export for use in other files
export { DEFAULT_CONFIG, STORAGE_KEYS };
