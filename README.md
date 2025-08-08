# Cosmic Galaxy

A mesmerizing, interactive galaxy visualization built with GSAP and HTML5 Canvas. Stars gracefully connect to your pointer as you explore the cosmic expanse.

![Cosmic Galaxy Preview](preview.gif)

## Features

- **Butter-smooth animations** powered by GSAP
- **Thousands of stars** with optimized Canvas rendering
- **Interactive connections** that respond to mouse movement
- **Responsive design** that adapts to any screen size
- **Customizable settings** for a personalized experience
- **Mobile-friendly** with touch support
- **Performance optimized** with requestAnimationFrame
- **Resource efficient** with smart animation pausing

## Live Demo

[View Live Demo](https://your-demo-link-here.com) (coming soon)

## Getting Started

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cosmic-galaxy.git
   cd cosmic-galaxy
   ```

2. Open `index.html` in your browser:
   ```bash
   # Using Python (any version)
   python -m http.server 8000
   # Then open http://localhost:8000 in your browser
   ```

### Development

For development, you can use any static file server. For example, with Node.js installed:

```bash
npx serve .
# Then open http://localhost:5000 in your browser
```

## Customization

You can easily customize the visualization by modifying these values in the code:

- Number of stars: Change the second parameter in `new Starfield(scene, 300, bounds)` in `main.js`
- Star colors: Modify the `hue` and `brightness` in the `Star` class
- Connection distance: Adjust the `maxDistance` parameter in `checkStarConnections()`
- Animation speed: Modify the time multipliers in the `update` method of the `Star` class

## Browser Support

This project uses modern JavaScript and WebGL features. For best results, use a recent version of:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## License

This project is open source and available under the [MIT License](LICENSE).

---

Created with ❤️ using Three.js
