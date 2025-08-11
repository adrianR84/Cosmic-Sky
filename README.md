# Cosmic Galaxy

A mesmerizing, interactive galaxy visualization built with GSAP and HTML5 Canvas. Stars gracefully connect to your pointer as you explore the cosmic expanse, with dynamic shooting stars and customizable features.

![Cosmic Galaxy Preview](preview.gif)

## ✨ Features

- **Smooth Animations** - Powered by GSAP for buttery-smooth motion
- **Dynamic Starfield** - Thousands of stars with optimized Canvas 2D rendering
- **Interactive Connections** - Stars connect to your pointer and each other
- **Shooting Stars** - Configurable shooting stars with adjustable frequency and duration
- **Responsive Design** - Adapts to any screen size and device
- **Customizable** - Fine-tune every aspect of the visualization
- **Performance Optimized** - Efficient rendering with requestAnimationFrame
- **Resource Friendly** - Smart animation pausing when tab is inactive
- **Feature Flags** - Toggle features on/off via configuration
- **Persistent Settings** - Saves your preferences in local storage

## Live Demo

[View Live Demo](https://your-demo-link-here.com) (coming soon)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Optional: Node.js for local development server

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cosmic-galaxy.git
   cd cosmic-galaxy
   ```

2. Open `index.html` in your browser using one of these methods:
   - **Directly** - Just open the file in your browser
   - **With Python** (any version):
     ```bash
     python -m http.server 8000
     # Then open http://localhost:8000
     ```
   - **With Node.js**:
     ```bash
     npx serve .
     # Then open http://localhost:5000
     ```

### Development

1. Install dependencies (if any):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx serve .
   ```

3. Open your browser to `http://localhost:5000`

## ⚙️ Controls & Customization

### Interactive Controls
- **Star Movement Speed** - Adjust how quickly stars move (0.0 to 1.0)
- **Star Count** - Set the number of stars (100-4000)
- **Trail Fade Speed** - Adjust how quickly star trails disappear (0.01-0.3)
- **Mouse Connections** - Toggle connections between cursor and stars
- **Connection Distance** - Set how far connections reach (150-500px)
- **Connection Colors** - Customize start and end colors of connections
- **Connection Opacity** - Adjust transparency of connections (5-100%)

### Shooting Stars
- **Enable/Disable** - Toggle shooting stars on/off
- **Max Stars at Once** - Control number of shooting stars (1-10)
- **Shoot Duration** - Set how long stars shoot (1-10 seconds)
- **Star Frequency** - Adjust time between shooting stars (0.1-1.0 seconds)

### Configuration Persistence
All your customization settings are automatically saved to your browser's local storage. This means:
- Your preferred settings will be remembered between sessions
- The visualization will start with your last used configuration
- No need to reconfigure the settings each time you visit

To reset to default settings, you can either:
1. Click the "Clear" button in the control panel (if enabled)
2. Clear your browser's local storage for this site, or
3. Use the browser's developer tools to remove the 'cosmicGalaxyConfig' item from local storage

### Feature Flags
You can enable/disable features by modifying the `FEATURES` object in `js/config/defaults.js`:

```javascript
export const FEATURES = {
    CLEAR_LOCAL_STORAGE: true,    // Show clear local storage button
};
```

### Advanced Customization
You can further customize the visualization by modifying these values in the code. These changes will be saved automatically:

- **Star Count**: `CONFIG.starCount` in `main.js`
- **Connection Distance**: `CONFIG.connectionDistance` in `main.js`
- **Color Scheme**: `CONFIG.colors` in `main.js`
- **Star Appearance**: `Star` class in `js/star.js`
- **Animation Parameters**: `Starfield` class in `js/starfield.js`

### Example: Changing Star Colors
```javascript
// In main.js
CONFIG.colors = {
  starHueMin: 180,    // Blue-cyan
  starHueMax: 300,    // Purple
  starSaturation: 80, // 0-100
  starLightness: 80   // 0-100
};
```

## 🌐 Browser Support

This project uses modern JavaScript and Canvas 2D features. For best results, use a recent version of:

- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Mobile Safari (iOS)
- Chrome for Android

## 📚 Documentation

### Project Structure
- `index.html` - Main HTML file
- `js/main.js` - Application entry point and configuration
- `js/starfield.js` - Core visualization logic
- `js/star.js` - Individual star behavior
- `js/utils.js` - Utility functions

### Building from Source
1. Clone the repository
2. Open `index.html` in a web server (see Getting Started)
3. Make your changes
4. Test in multiple browsers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [GSAP](https://greensock.com/gsap/) for smooth animations
- Inspired by the beauty of the cosmos
- Special thanks to all contributors

---

Created with ❤️ using GSAP and HTML5 Canvas
