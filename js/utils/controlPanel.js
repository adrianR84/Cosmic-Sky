/**
 * Control Panel Manager
 * Handles dragging, resizing, and minimizing the control panel
 */
import { saveConfig, loadConfig, STORAGE_KEYS } from '../config/index.js';
import { showError } from './browser.js';

class ControlPanelManager {
    constructor() {
        this.panel = document.querySelector('#controlsPanel');
        if (!this.panel) {
            console.error('Control panel element not found');
            return;
        }


        // Load saved state if available
        this.savedState = loadConfig(STORAGE_KEYS.CONTROL_PANEL) || {};

        this.isDragging = false;
        this.isMinimized = false;
        this.originalHeight = this.panel.offsetHeight;
        this.originalOverflow = this.panel.style.overflow || 'auto';
        this.offsetX = 0;
        this.offsetY = 0;
        this.minHeight = 40; // Minimum height when minimized

        // Initialize the panel
        this.init();
    }

    /**
     * Initialize the control panel with all functionality
     */
    init() {
        if (!this.panel) return;

        // Initialize controls and drag handlers
        this.initializeControls();
        this.setupDragHandlers();
        this.initializePosition();
    }

    /**
     * Initialize the minimize button and header drag functionality
     */
    initializeControls() {
        // Find the existing minimize button
        this.minimizeButton = this.panel.querySelector('#minimize-btn-dark');
        this.hideButton = this.panel.querySelector('#hide-btn-dark');

        if (!this.minimizeButton || !this.hideButton) {
            console.error('Control buttons not found');
            return;
        }

        // Set initial state if not minimized from saved state
        this.minimizeButton.innerHTML = '−';
        this.minimizeButton.title = 'Minimize';
        this.minimizeButton.setAttribute('aria-label', 'Minimize control panel');

        // Set hide button properties
        this.hideButton.innerHTML = '×';
        this.hideButton.title = 'Hide';
        this.hideButton.setAttribute('aria-label', 'Hide control panel');

        // Add click handlers
        this.minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });

        this.hideButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleHide();
        });
    }

    /**
     * Set up drag handlers for the panel
     */
    setupDragHandlers() {
        // Make only the modal header draggable
        const header = this.panel.querySelector('.modal-header-dark');
        if (!header) {
            console.error('Modal header not found');
            return;
        }

        // Make the header cursor indicate it's draggable
        header.style.cursor = 'move';

        header.addEventListener('mousedown', (e) => {
            // Don't start drag on the minimize button
            if (e.target === this.minimizeButton || e.target.closest('.minimize-btn-dark')) {
                return;
            }

            this.isDragging = true;
            this.offsetX = e.clientX - this.panel.offsetLeft;
            this.offsetY = e.clientY - this.panel.offsetTop;
            this.panel.style.cursor = 'grabbing';

            // Bring to front
            const maxZ = Math.max(
                ...Array.from(document.querySelectorAll('*'))
                    .map(el => parseFloat(window.getComputedStyle(el).zIndex) || 0)
            );
            this.panel.style.zIndex = maxZ + 1;

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const x = e.clientX - this.offsetX;
            const y = e.clientY - this.offsetY;

            // Keep panel within viewport
            const maxX = window.innerWidth - this.panel.offsetWidth;
            const maxY = window.innerHeight - (this.isMinimized ? this.minHeight : this.originalHeight);

            this.panel.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            this.panel.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.panel.style.cursor = 'move';
                // Save state after drag ends
                this.saveState();
            }
        });
    }

    /**
     * Save the current state of the control panel
     * @private
     */
    saveState() {
        if (!this.panel) return;

        // Get computed styles to ensure we have the actual values
        const computedStyle = window.getComputedStyle(this.panel);
        const top = computedStyle.top;
        const left = computedStyle.left;

        const state = {
            isMinimized: this.isMinimized,
            position: { top, left }
        };

        // Save using storage utility with the correct key
        saveConfig(state, STORAGE_KEYS.CONTROL_PANEL);
    }

    /**
     * Toggle between minimized and restored states
     */
    toggleMinimize() {
        if (this.isMinimized) {
            this.restore();
        } else {
            this.minimize();
        }
        this.saveState();
    }

    /**
     * Minimize the control panel
     */
    minimize() {
        if (this.isMinimized) return;

        // Save current height before minimizing
        this.originalHeight = this.panel.offsetHeight;
        this.originalOverflow = this.panel.style.overflow;

        // Hide the content
        const modalContent = this.panel.querySelector('.modal-content-dark');
        if (modalContent) {
            modalContent.style.display = 'none';
        }

        // Set minimized styles
        this.panel.style.height = 'auto';
        this.minimizeButton.innerHTML = '+';
        this.minimizeButton.title = 'Restore';
        this.isMinimized = true;

        // Save the state
        this.saveState();
    }

    /**
     * Restore the control panel to its previous size
     */
    restore() {
        if (!this.isMinimized) return;

        // Show the content
        const modalContent = this.panel.querySelector('.modal-content-dark');
        if (modalContent) {
            modalContent.style.display = '';
        }

        // Restore the original height
        if (this.originalHeight) {
            this.panel.style.height = `${this.originalHeight}px`;
        } else {
            this.panel.style.height = '';
        }

        // Update UI
        this.minimizeButton.innerHTML = '−';
        this.minimizeButton.title = 'Minimize';
        this.isMinimized = false;

        // Save the state
        this.saveState();
    }

    /**
     * Initialize panel position and state
     */
    initializePosition() {
        // Apply saved state if available
        if (this.savedState) {
            const { isMinimized, position } = this.savedState;

            // Apply position if it exists
            if (position) {
                // Apply position first before making it visible to prevent flicker
                if (position.top) {
                    this.panel.style.top = position.top;
                }
                if (position.left) {
                    this.panel.style.left = position.left;
                }

                // Remove right style if we have a left position to prevent conflicts
                if (position.left) {
                    this.panel.style.removeProperty('right');
                }

                // Make sure the panel is visible
                this.panel.style.display = 'block';
                this.panel.style.visibility = 'visible';
                this.panel.offsetHeight; // Force reflow
            }

            // Apply minimized state if needed
            if (isMinimized) {
                this.minimize();
            }
        }
    }

    /**
     * Hide the control panel and show an error message
     */
    toggleHide() {
        this.panel.style.display = 'none';
        showError('Control panel hidden. Please refresh the page to restore it.');
    }

}

// Export the ControlPanelManager class as default
export default ControlPanelManager;
