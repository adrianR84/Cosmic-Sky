/**
 * Configuration module for the Cosmic Galaxy application.
 * Combines default values with user preferences from localStorage.
 */

// Import dependencies
import { DEFAULT_CONFIG } from './defaults.js';
import { loadConfig, saveConfig, mergeWithDefaults } from '../utils/storage.js';

/**
 * Get the current configuration, merging saved config with defaults.
 * @returns {Object} The current configuration
 */
function getConfig() {
    const savedConfig = loadConfig();
    return mergeWithDefaults(savedConfig, DEFAULT_CONFIG);
}

// Export the public API
export {
    loadConfig,
    saveConfig,
    getConfig
};
