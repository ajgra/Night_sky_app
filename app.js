// Night Sky Identifier - Main Application

class NightSkyApp {
    constructor() {
        this.canvas = document.getElementById('skyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.astronomy = new Astronomy();
        
        // User location
        this.latitude = null;
        this.longitude = null;
        
        // Device orientation
        this.alpha = 0; // Compass (0-360)
        this.beta = 0;  // Front-back tilt (-180 to 180)
        this.gamma = 0; // Left-right tilt (-90 to 90)
        
        // Calibration offset
        this.compassOffset = 0;
        
        // Field of view
        this.fov = 60; // degrees
        
        // Celestial objects
        this.stars = [];
        this.planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        this.visibleObjects = [];
        
        // Animation
        this.animationId = null;
        this.lastUpdate = Date.now();
        
        // UI elements
        this.statusEl = document.getElementById('status');
        this.latEl = document.getElementById('lat');
        this.lngEl = document.getElementById('lng');
        this.directionEl = document.getElementById('direction');
        this.tiltEl = document.getElementById('tilt');
        this.calibrationPanel = document.getElementById('calibrationPanel');
        this.startBtn = document.getElementById('startBtn');
        this.objectInfo = document.getElementById('objectInfo');
        this.objectList = document.getElementById('objectList');
        this.errorMsg = document.getElementById('errorMessage');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.setupCanvas();
        this.showCalibration();
    }

    setupCanvas() {
        // Set canvas size to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    showCalibration() {
        this.calibrationPanel.classList.remove('hidden');
        this.startBtn.addEventListener('click', () => {
            this.calibrationPanel.classList.add('hidden');
            this.initialize();
        });
    }

    async initialize() {
        try {
            this.loadingScreen.classList.remove('hidden');
            this.updateStatus('Requesting location...');
            
            // Get location
            await this.getLocation();
            
            // Load star data
            this.updateStatus('Loading star catalog...');
            this.stars = getStars();
            
            // Request device orientation permission (iOS 13+)
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Device orientation permission denied');
                }
            }
            
            // Start orientation tracking
            this.startOrientationTracking();
            
            // Start rendering
            this.loadingScreen.classList.add('hidden');
            this.objectInfo.classList.remove('hidden');
            this.updateStatus('Ready! Point at the sky');
            this.render();
            
        } catch (error) {
            this.showError(error.message);
            this.loadingScreen.classList.add('hidden');
        }
    }

    async getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    this.latEl.textContent = this.latitude.toFixed(4);
                    this.lngEl.textContent = this.longitude.toFixed(4);
                    resolve();
                },
                (error) => {
                    reject(new Error('Location access denied. Please enable location services.'));
                },
                { enableHighAccuracy: true }
            );
        });
    }

    startOrientationTracking() {
        window.addEventListener('deviceorientation', (event) => {
            // iOS vs Android differences
            this.alpha = event.alpha || 0; // 0-360
            this.beta = event.beta || 0;   // -180 to 180
            this.gamma = event.gamma || 0; // -90 to 90
            
            // Update UI
            const direction = this.getCompassDirection(this.alpha);
            this.directionEl.textContent = `${direction} (${Math.round(this.alpha)}°)`;
            this.tiltEl.textContent = `${Math.round(this.beta)}°`;
        }, true);
    }

    getCompassDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(((degrees % 360) / 45)) % 8;
        return directions[index];
    }

    calculateVisibleObjects() {
        const jd = this.astronomy.getJulianDate();
        this.visibleObjects = [];
        
        // Calculate which direction user is pointing
        const viewAzimuth = (this.alpha + this.compassOffset) % 360;
        const viewAltitude = 90 - Math.abs(this.beta); // Simplified
        
        // Check stars
        this.stars.forEach(star => {
            const pos = this.astronomy.equatorialToHorizontal(
                star.ra, star.dec, this.latitude, this.longitude, jd
            );
            
            star.altitude = pos.altitude;
            star.azimuth = pos.azimuth;
            
            // Only show objects above horizon and in field of view
            if (pos.altitude > 0) {
                const azDiff = Math.abs(this.angleDifference(pos.azimuth, viewAzimuth));
                const altDiff = Math.abs(pos.altitude - viewAltitude);
                
                if (azDiff < this.fov && altDiff < this.fov) {
                    this.visibleObjects.push({
                        type: 'star',
                        name: star.name,
                        magnitude: star.magnitude,
                        ...pos
                    });
                }
            }
        });
        
        // Check planets
        this.planets.forEach(planetName => {
            const planet = this.astronomy.getPlanetPosition(planetName, jd);
            if (planet) {
                const pos = this.astronomy.equatorialToHorizontal(
                    planet.ra, planet.dec, this.latitude, this.longitude, jd
                );
                
                if (pos.altitude > 0) {
                    const azDiff = Math.abs(this.angleDifference(pos.azimuth, viewAzimuth));
                    const altDiff = Math.abs(pos.altitude - viewAltitude);
                    
                    if (azDiff < this.fov && altDiff < this.fov) {
                        this.visibleObjects.push({
                            type: 'planet',
                            name: planetName,
                            magnitude: planet.magnitude,
                            ...pos
                        });
                    }
                }
            }
        });
        
        // Check Moon
        const moon = this.astronomy.getMoonPosition(jd);
        const moonPos = this.astronomy.equatorialToHorizontal(
            moon.ra, moon.dec, this.latitude, this.longitude, jd
        );
        
        if (moonPos.altitude > 0) {
            const azDiff = Math.abs(this.angleDifference(moonPos.azimuth, viewAzimuth));
            const altDiff = Math.abs(moonPos.altitude - viewAltitude);
            
            if (azDiff < this.fov && altDiff < this.fov) {
                const phase = this.astronomy.getMoonPhase(jd);
                this.visibleObjects.push({
                    type: 'moon',
                    name: 'Moon',
                    phase: phase,
                    magnitude: -12.74,
                    ...moonPos
                });
            }
        }
        
        // Sort by magnitude (brightest first)
        this.visibleObjects.sort((a, b) => a.magnitude - b.magnitude);
    }

    angleDifference(a, b) {
        let diff = a - b;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate visible objects
        this.calculateVisibleObjects();
        
        // Draw gradient background
        this.drawSkyGradient();
        
        // Draw all stars in view
        this.drawStars();
        
        // Draw constellation lines
        this.drawConstellations();
        
        // Draw planets
        this.drawPlanets();
        
        // Draw moon
        this.drawMoon();
        
        // Update object info panel
        this.updateObjectInfo();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.render());
    }

    drawSkyGradient() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height,
            0,
            this.canvas.width / 2, this.canvas.height,
            this.canvas.height
        );
        
        gradient.addColorStop(0, 'rgba(27, 39, 53, 0.3)');
        gradient.addColorStop(1, 'rgba(9, 10, 15, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars() {
        const jd = this.astronomy.getJulianDate();
        const viewAzimuth = (this.alpha + this.compassOffset) % 360;
        const viewAltitude = 90 - Math.abs(this.beta);
        
        this.stars.forEach(star => {
            if (star.altitude > 0) {
                const azDiff = this.angleDifference(star.azimuth, viewAzimuth);
                const altDiff = star.altitude - viewAltitude;
                
                if (Math.abs(azDiff) < this.fov && Math.abs(altDiff) < this.fov) {
                    // Map to screen coordinates
                    const x = this.canvas.width / 2 + (azDiff / this.fov) * this.canvas.width;
                    const y = this.canvas.height / 2 - (altDiff / this.fov) * this.canvas.height;
                    
                    // Star size based on magnitude (brighter = bigger)
                    const size = Math.max(1, 5 - star.magnitude);
                    
                    // Star color based on spectral class
                    const color = this.getStarColor(star.spectralClass);
                    
                    // Draw star
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Add glow for bright stars
                    if (star.magnitude < 1.5) {
                        this.ctx.fillStyle = color.replace('1)', '0.3)');
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // Label bright stars
                        this.ctx.fillStyle = '#fff';
                        this.ctx.font = '12px Arial';
                        this.ctx.fillText(star.name, x + size + 5, y - 5);
                    }
                }
            }
        });
    }

    getStarColor(spectralClass) {
        const type = spectralClass ? spectralClass[0] : 'A';
        const colors = {
            'O': 'rgba(155, 176, 255, 1)',
            'B': 'rgba(170, 191, 255, 1)',
            'A': 'rgba(202, 215, 255, 1)',
            'F': 'rgba(248, 247, 255, 1)',
            'G': 'rgba(255, 244, 234, 1)',
            'K': 'rgba(255, 210, 161, 1)',
            'M': 'rgba(255, 204, 111, 1)'
        };
        return colors[type] || 'rgba(255, 255, 255, 1)';
    }

    drawConstellations() {
        const viewAzimuth = (this.alpha + this.compassOffset) % 360;
        const viewAltitude = 90 - Math.abs(this.beta);
        
        this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
        this.ctx.lineWidth = 1;
        
        Object.entries(CONSTELLATIONS).forEach(([name, lines]) => {
            lines.forEach(line => {
                this.ctx.beginPath();
                let started = false;
                
                line.forEach(starIndex => {
                    const star = this.stars[starIndex];
                    if (!star || star.altitude <= 0) return;
                    
                    const azDiff = this.angleDifference(star.azimuth, viewAzimuth);
                    const altDiff = star.altitude - viewAltitude;
                    
                    if (Math.abs(azDiff) < this.fov && Math.abs(altDiff) < this.fov) {
                        const x = this.canvas.width / 2 + (azDiff / this.fov) * this.canvas.width;
                        const y = this.canvas.height / 2 - (altDiff / this.fov) * this.canvas.height;
                        
                        if (!started) {
                            this.ctx.moveTo(x, y);
                            started = true;
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                });
                
                this.ctx.stroke();
            });
        });
    }

    drawPlanets() {
        this.visibleObjects.filter(obj => obj.type === 'planet').forEach(planet => {
            const viewAzimuth = (this.alpha + this.compassOffset) % 360;
            const viewAltitude = 90 - Math.abs(this.beta);
            
            const azDiff = this.angleDifference(planet.azimuth, viewAzimuth);
            const altDiff = planet.altitude - viewAltitude;
            
            const x = this.canvas.width / 2 + (azDiff / this.fov) * this.canvas.width;
            const y = this.canvas.height / 2 - (altDiff / this.fov) * this.canvas.height;
            
            // Draw planet
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow effect
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Label
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(planet.name, x + 10, y - 10);
        });
    }

    drawMoon() {
        const moon = this.visibleObjects.find(obj => obj.type === 'moon');
        if (!moon) return;
        
        const viewAzimuth = (this.alpha + this.compassOffset) % 360;
        const viewAltitude = 90 - Math.abs(this.beta);
        
        const azDiff = this.angleDifference(moon.azimuth, viewAzimuth);
        const altDiff = moon.altitude - viewAltitude;
        
        const x = this.canvas.width / 2 + (azDiff / this.fov) * this.canvas.width;
        const y = this.canvas.height / 2 - (altDiff / this.fov) * this.canvas.height;
        
        const radius = 10;
        
        // Draw moon
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw phase shadow
        if (moon.phase < 0.99) {
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            const shadowWidth = radius * 2 * (1 - moon.phase);
            this.ctx.ellipse(x, y, shadowWidth, radius, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Glow
        this.ctx.fillStyle = 'rgba(224, 224, 224, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        const phasePercent = Math.round(moon.phase * 100);
        this.ctx.fillText(`Moon (${phasePercent}%)`, x + 15, y - 15);
    }

    updateObjectInfo() {
        if (this.visibleObjects.length === 0) {
            this.objectList.innerHTML = '<p style="color: #888;">Point at the sky to identify objects</p>';
            return;
        }
        
        // Show top 10 brightest objects in view
        const topObjects = this.visibleObjects.slice(0, 10);
        
        this.objectList.innerHTML = topObjects.map(obj => {
            const icon = obj.type === 'planet' ? '🪐' : 
                        obj.type === 'moon' ? '🌙' : '⭐';
            const altitude = Math.round(obj.altitude);
            const azimuth = Math.round(obj.azimuth);
            const direction = this.getCompassDirection(obj.azimuth);
            
            return `<div class="object">
                ${icon} <strong>${obj.name}</strong> - 
                ${direction} ${azimuth}°, ${altitude}° above horizon
                ${obj.type === 'star' ? ` (mag ${obj.magnitude.toFixed(1)})` : ''}
            </div>`;
        }).join('');
    }

    updateStatus(message) {
        this.statusEl.textContent = message;
    }

    showError(message) {
        this.errorMsg.textContent = message;
        this.errorMsg.classList.remove('hidden');
        this.statusEl.textContent = 'Error';
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new NightSkyApp();
    });
} else {
    app = new NightSkyApp();
}
