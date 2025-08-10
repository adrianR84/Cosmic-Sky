/**
 * Storage module for handling configuration persistence in localStorage.
 * Provides methods to save, load, and merge configurations.
 */

import { STORAGE_KEYS } from '../config/index.js';

/**
 * Save configuration to localStorage.
 * @param {Object} config - The configuration object to save
 * @param {string} [name=STORAGE_KEYS.MAIN_CONFIG] - The name under which to save the configuration
 * @returns {boolean} True if saved successfully, false otherwise
 */
function saveConfig(config, name = STORAGE_KEYS.MAIN_CONFIG) {
    try {
        localStorage.setItem(name, JSON.stringify(config));
        return true;
    } catch (error) {
        console.error(`Failed to save configuration '${name}':`, error);
        return false;
    }
}

/**
 * Load configuration from localStorage.
 * @param {string} [name=STORAGE_KEYS.MAIN_CONFIG] - The name of the configuration to load
 * @returns {Object|null} The loaded configuration or null if none exists or error occurs
 */
function loadConfig(name = STORAGE_KEYS.MAIN_CONFIG) {
    try {
        const savedConfig = localStorage.getItem(name);
        if (!savedConfig) return null;
        
        const parsed = JSON.parse(savedConfig);
        // Validate that the parsed config is an object and not null
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        console.error(`Failed to load configuration '${name}':`, error);
        // Clear invalid config from storage
        localStorage.removeItem(name);
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
