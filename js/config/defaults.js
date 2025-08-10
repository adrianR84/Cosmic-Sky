/**
 * Feature flags and application settings
 * These can be toggled to enable/disable features
 */
export const FEATURES = {
    CLEAR_LOCAL_STORAGE: true,    // Show clear local storage button
};

/**
 * Storage keys used in the application
 */
const STORAGE_KEYS = {
    MAIN_CONFIG: 'cosmicGalaxyConfig',
    CONTROL_PANEL: 'controlPanelState'
};

/**
 * Default configuration values for the Sky visualization.
 * These are used when no saved configuration exists in localStorage.
 * @type {Object}
 */
const DEFAULT_CONFIG = {
    // Core settings
    starCount: 2000,
    animationSpeed: 1.0,
    trailFadeSpeed: 0.2,

    // Star clustering configuration
    clusters: {
        enabled: false,
        maxStarsPerCluster: 100,
        clusterCount: 5
    },

    // Visual settings
    background: {
        color: '#000428',
        opacity: 1.0
    },

    // Features
    mouseConnection: {
        enabled: false,
        distance: 350
    },

    // Shooting stars configuration
    shootingStar: {
        enabled: false,
        maxStarsAtOnce: 3,
        maxShootDurationSeconds: 3,
        maxEventSeconds: 0.5
    },

    // Star movement settings
    starMoving: {
        enabled: false,
        ellipticalRate: 0.3,
        speed: 0.3
    },

    // Parallax settings
    parallax: {
        enabled: false,
        intensity: 0.2,
        maxOffset: 100
    },

    moveStarsAwayFromMouse: false,

    // Color settings
    colors: {
        starHueMin: 200,
        starHueMax: 300,
        starSaturation: 80,
        starLightness: 80,
        connectionStart: '#044b16',
        connectionEnd: '#e0ebee',
        connectionOpacity: 0.5
    }
};

// Export for use in other files
export { DEFAULT_CONFIG, STORAGE_KEYS };
