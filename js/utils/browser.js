/**
 * Browser utility functions for the Cosmic Galaxy visualization.
 * Includes feature detection and UI feedback functions.
 */

/**
 * Check if the browser supports all required features.
 * @returns {boolean} True if all required features are supported
 */
export function isCanvasSupported() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Display an error message to the user.
 * @param {string} message - The error message to display
 * @returns {void}
 */
export function showError(message) {
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
