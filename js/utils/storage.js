/**
 * Storage module for handling configuration persistence in localStorage.
 * Provides methods to save, load, and merge configurations.
 */

/**
 * Save configuration to localStorage.
 * @param {Object} config - The configuration object to save
 * @returns {boolean} True if saved successfully, false otherwise
 */
function saveConfig(config) {
    try {
        localStorage.setItem('cosmicGalaxyConfig', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Failed to save configuration:', error);
        return false;
    }
}

/**
 * Load configuration from localStorage.
 * @returns {Object|null} The loaded configuration or null if none exists or error occurs
 */
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('cosmicGalaxyConfig');
        if (!savedConfig) return null;
        
        const parsed = JSON.parse(savedConfig);
        // Validate that the parsed config is an object and not null
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        console.error('Failed to load configuration:', error);
        // Clear invalid config from storage
        localStorage.removeItem('cosmicGalaxyConfig');
        return null;
    }
}

/**
 * Merge a partial configuration with defaults.
 * @param {Object} config - The configuration to merge with defaults
 * @param {Object} defaults - The default configuration values
 * @returns {Object} A new object with merged configuration
 */
function mergeWithDefaults(config, defaults) {
    if (!config) return { ...defaults };
    
    // Handle nested objects like parallax and colors
    const result = { ...defaults };
    
    for (const key in config) {
        if (config.hasOwnProperty(key)) {
            if (typeof config[key] === 'object' && config[key] !== null && 
                !Array.isArray(config[key]) && defaults[key]) {
                // Deep merge for nested objects
                result[key] = { ...defaults[key], ...config[key] };
            } else {
                result[key] = config[key];
            }
        }
    }
    
    return result;
}

// Export for use in other files
export { saveConfig, loadConfig, mergeWithDefaults };
