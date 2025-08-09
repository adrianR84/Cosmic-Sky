/**
 * Control Panel Manager
 * Handles dragging, resizing, and minimizing the control panel
 */

class ControlPanelManager {
    constructor() {
        this.panel = document.querySelector('#controlsPanel');
        if (!this.panel) {
            console.error('Control panel element not found');
            return;
        }

        // Set default position if not set
        if (!this.panel.style.position) {
            this.panel.style.position = 'fixed';
            this.panel.style.top = '10px';
            this.panel.style.right = '10px';
        }

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
        this.minimizeButton = this.panel.querySelector('.minimize-btn-dark');
        
        if (!this.minimizeButton) {
            console.error('Minimize button not found');
            return;
        }
        
        // Set initial state
        this.minimizeButton.innerHTML = '−';
        this.minimizeButton.title = 'Minimize';
        this.minimizeButton.setAttribute('aria-label', 'Minimize control panel');
        
        // Add click handler
        this.minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
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
            this.isDragging = false;
            this.panel.style.cursor = 'move';
        });
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

        // Set minimized state
        const modalContent = this.panel.querySelector('.modal-content-dark');
        if (modalContent) {
            modalContent.style.display = 'none';
        }
        
        this.panel.style.height = 'auto';
        this.minimizeButton.innerHTML = '+';
        this.minimizeButton.title = 'Restore';
        this.isMinimized = true;
    }

    /**
     * Restore the control panel to its previous size
     */
    restore() {
        if (!this.isMinimized) return;

        // Restore content
        const modalContent = this.panel.querySelector('.modal-content-dark');
        if (modalContent) {
            modalContent.style.display = '';
        }
        
        this.panel.style.height = '';
        this.minimizeButton.innerHTML = '−';
        this.minimizeButton.title = 'Minimize';
        this.isMinimized = false;
    }

    /**
     * Initialize panel position and state
     */
    initializePosition() {
        this.panel.style.position = 'fixed';
        this.panel.style.top = '10px';
        this.panel.style.right = '10px';
        this.panel.style.left = '';
        this.panel.style.height = '';
        this.originalHeight = this.panel.offsetHeight;
    }

    /**
     * Ensure the panel is visible on screen
     */
    ensureVisibility() {
        const rect = this.panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Reset any negative positions
        if (rect.left < 0) this.panel.style.left = '10px';
        if (rect.top < 0) this.panel.style.top = '10px';

        // If panel is completely off-screen, reset to default position
        if (rect.right < 0 || rect.bottom < 0 ||
            rect.left > viewportWidth || rect.top > viewportHeight) {
            this.panel.style.top = '10px';
            this.panel.style.right = '10px';
            this.panel.style.left = '';
        }
    }
}

// Initialize the control panel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const controlPanel = new ControlPanelManager();
});
