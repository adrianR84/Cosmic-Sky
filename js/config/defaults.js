/**
 * Default configuration values for the Cosmic Galaxy visualization.
 * These are used when no saved configuration exists in localStorage.
 * @type {Object}
 */
const DEFAULT_CONFIG = {
    // Core settings
    starCount: 1000,
    connectionDistance: 250,
    animationSpeed: 1.0,
    starMovementSpeed: 0.2,
    trailFadeSpeed: 0.2,
    
    // Star clustering
    maxStarsPerCluster: 100,
    clusterCount: 5,
    
    // Visual settings
    bgColor: '#000428',
    bgOpacity: 1.0,
    
    // Features
    mouseConnectionsEnabled: true,
    moveStarsAwayFromMouse: false,
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
export { DEFAULT_CONFIG };
