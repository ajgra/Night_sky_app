# Night Sky Identifier 🌌

A mobile-first web app that uses your phone's GPS and orientation sensors to identify stars, planets, constellations, and the Moon in real-time as you point your device at the night sky.

## Features ✨

### Basic Features (Included)
- **GPS Location Tracking** - Automatically detects your position
- **Device Orientation** - Tracks where you're pointing your phone
- **Star Catalog** - 50+ brightest stars with accurate positions
- **Planet Display** - Mercury, Venus, Mars, Jupiter, Saturn
- **Moon Phase** - Shows current moon position and illumination percentage
- **Constellation Lines** - Connects major stars to show constellation patterns
- **Real-time Labels** - Identifies objects you're looking at
- **Magnitude Display** - Shows star brightness
- **Compass Direction** - Shows which direction you're facing

### How It Works
1. Opens the app on your smartphone
2. Grants location and motion sensor permissions
3. Points phone at the sky
4. App shows what celestial objects are in that direction
5. Labels appear for stars, planets, and the Moon

## Usage Instructions 📱

### Setup
1. Open `night-sky-app.html` in a mobile browser (Safari on iOS, Chrome on Android)
2. **IMPORTANT**: Must use HTTPS or localhost (GPS requires secure connection)
3. Click "Get Started"
4. Allow location access when prompted
5. Allow motion sensor access when prompted (iOS 13+)

### Using the App
- **Point at sky** - Hold phone up and point at any part of the night sky
- **Move around** - Pan left/right, up/down to explore different areas
- **Read labels** - Bright objects are automatically labeled
- **Check bottom panel** - Shows list of visible objects with directions
- **Top bar** - Shows your location, compass direction, and tilt angle

### Best Practices
- Use on a clear night away from city lights
- Calibrate phone compass by moving it in a figure-8 pattern
- Hold phone steady for accurate readings
- Give eyes 20-30 minutes to adjust to darkness
- Check "Visible Objects" panel at bottom for what's currently in view

## Technical Details 🔧

### Files
- `night-sky-app.html` - Main HTML interface
- `astronomy.js` - Celestial calculations and star catalog
- `app.js` - Application logic, GPS, orientation, rendering

### Browser Requirements
- Modern smartphone browser (iOS Safari 13+, Chrome 80+)
- HTTPS connection (or localhost for testing)
- Geolocation API support
- DeviceOrientation API support

### Astronomy Calculations
- **Coordinate Conversion** - RA/Dec to Altitude/Azimuth
- **Julian Date** - Accurate time calculations
- **Sidereal Time** - Local star time based on longitude
- **Planet Positions** - Simplified orbital calculations
- **Moon Phase** - Illumination percentage
- **Star Positions** - Precessed to current date

### Star Catalog
Contains 50 brightest stars including:
- Sirius (brightest star)
- Polaris (North Star)
- Betelgeuse, Rigel (Orion)
- Vega, Deneb, Altair (Summer Triangle)
- And many more!

### Constellations Included
- Ursa Major (Big Dipper)
- Orion
- Cassiopeia
- Leo
- Scorpius

## Troubleshooting 🔍

### "Location access denied"
- Check browser settings
- Enable location services in phone settings
- Make sure you're using HTTPS

### "Device orientation permission denied"
- On iOS 13+, must explicitly grant permission
- Check Safari settings > Motion & Orientation Access

### Stars not appearing in correct position
- Calibrate compass by moving phone in figure-8
- Make sure you're pointing at the sky (not ground)
- Check that location is accurate

### App not loading
- Must use HTTPS (not HTTP)
- Or use localhost for testing
- Check browser console for errors

## Hosting the App 🌐

### Option 1: GitHub Pages (Free HTTPS)
1. Create GitHub repository
2. Upload all three files
3. Enable GitHub Pages in settings
4. Access via `https://yourusername.github.io/repository-name/night-sky-app.html`

### Option 2: Local Testing
1. Run local HTTPS server:
```bash
# Python 3
python -m http.server 8000

# Or use localhost (works for GPS)
```
2. Access via `http://localhost:8000/night-sky-app.html`

### Option 3: Web Hosting
- Upload to any web host with HTTPS
- Examples: Netlify, Vercel, AWS S3 + CloudFront

## Future Enhancements 🚀

Possible features to add:
- More stars (1000+ catalog)
- Deep sky objects (nebulae, galaxies)
- ISS tracking
- Meteor shower information
- Augmented reality camera overlay
- Search functionality
- Time travel (past/future sky)
- Star trails and motion
- Dark mode toggle
- Offline mode with cached data
- Screenshot/sharing capabilities

## Browser Compatibility 📱

| Browser | GPS | Orientation | Status |
|---------|-----|-------------|--------|
| iOS Safari 13+ | ✅ | ✅ | Full support |
| Android Chrome | ✅ | ✅ | Full support |
| iOS Safari <13 | ✅ | ⚠️ | No permission prompt |
| Desktop | ❌ | ❌ | No sensors |

## Privacy 🔒

- Location data is used only for astronomical calculations
- No data is stored or transmitted to any server
- Everything runs locally in your browser
- No tracking, no analytics, no cookies

## Credits & Data Sources 📚

- Star catalog: Yale Bright Star Catalog
- Celestial mechanics: Based on Jean Meeus algorithms
- Constellation data: IAU official boundaries
- Built with vanilla JavaScript (no frameworks)

## License

This project is provided as-is for educational and personal use.

---

**Enjoy stargazing! 🌟🔭**
