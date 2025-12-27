// Night Sky Map - Improved Compass Reading

class NightSkyMap {
    constructor() {
        this.canvas = document.getElementById('skyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.astronomy = new Astronomy();
        
        // User location
        this.latitude = null;
        this.longitude = null;
        
        // Device orientation - try multiple methods
        this.compassHeading = 0;
        this.compassOffset = 0;
        this.useWebkit = false; // Track which method works best
        
        // Map settings
        this.centerX = 0;
        this.centerY = 0;
        this.mapRadius = 0;
        
        // Celestial objects
        this.stars = [];
        this.planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        this.allObjects = [];
        
        // Animation
        this.animationId = null;
        
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
        this.errorMsg = document.getElementById('errorMessage') || document.getElementById('errorMsg');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.setupCanvas();
        this.showCalibration();
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            const size = Math.min(window.innerWidth, window.innerHeight);
            this.mapRadius = (size * 0.85) / 2;
            this.centerX = window.innerWidth / 2;
            this.centerY = window.innerHeight / 2;
        };
        
        resize();
        window.addEventListener('resize', resize);
    }

    showCalibration() {
        const startScreen = document.getElementById('startScreen');
        const calibrationPanel = document.getElementById('calibrationPanel');
        
        if (startScreen) {
            this.startBtn = document.getElementById('startBtn');
            this.errorMsg = document.getElementById('errorMsg');
            
            this.startBtn.addEventListener('click', async () => {
                try {
                    await this.requestOrientationPermission();
                    startScreen.classList.add('hidden');
                    this.canvas.classList.remove('hidden');
                    if (document.getElementById('controls')) {
                        document.getElementById('controls').classList.remove('hidden');
                    }
                    await this.initialize();
                } catch (error) {
                    this.errorMsg.textContent = error.message;
                    this.errorMsg.classList.remove('hidden');
                }
            });
        } else if (calibrationPanel) {
            calibrationPanel.classList.remove('hidden');
            this.startBtn.addEventListener('click', async () => {
                calibrationPanel.classList.add('hidden');
                
                try {
                    await this.requestOrientationPermission();
                    await this.initialize();
                } catch (error) {
                    this.showError(error.message);
                    if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
                }
            });
        }
    }

    async requestOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Please allow motion sensors');
            }
        }
    }

    async initialize() {
        if (this.loadingScreen) this.loadingScreen.classList.remove('hidden');
        this.updateStatus('Getting your location...');
        
        await this.getLocation();
        
        this.updateStatus('Loading stars...');
        this.stars = getStars();
        
        this.startOrientationTracking();
        
        if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
        if (this.objectInfo) this.objectInfo.classList.remove('hidden');
        this.updateStatus('Hold phone FLAT!');
        this.render();
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
                    if (this.latEl) this.latEl.textContent = this.latitude.toFixed(4);
                    if (this.lngEl) this.lngEl.textContent = this.longitude.toFixed(4);
                    resolve();
                },
                (error) => {
                    reject(new Error('Location access denied'));
                },
                { enableHighAccuracy: true }
            );
        });
    }

    startOrientationTracking() {
        console.log('Starting orientation tracking with improved compass reading');
        
        // Try deviceorientationabsolute first (most accurate when available)
        let absoluteAvailable = false;
        window.addEventListener('deviceorientationabsolute', (event) => {
            if (event.alpha !== null) {
                absoluteAvailable = true;
                this.compassHeading = event.alpha;
                this.updateCompassDisplay(event);
            }
        }, true);
        
        // Fallback to regular deviceorientation
        window.addEventListener('deviceorientation', (event) => {
            // Only use this if absolute orientation isn't available
            if (!absoluteAvailable) {
                // Prefer webkitCompassHeading on iOS (more accurate)
                if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
                    this.compassHeading = event.webkitCompassHeading;
                    this.useWebkit = true;
                    console.log('Using webkitCompassHeading');
                } else if (event.alpha !== null) {
                    this.compassHeading = event.alpha;
                    console.log('Using event.alpha');
                }
                
                this.updateCompassDisplay(event);
            }
        }, true);
    }

    updateCompassDisplay(event) {
        if (this.directionEl) {
            const direction = this.getCompassDirection(this.compassHeading);
            this.directionEl.textContent = `${direction} (${Math.round(this.compassHeading)}°)`;
        }
        if (this.tiltEl && event.beta) {
            this.tiltEl.textContent = `${Math.round(event.beta)}°`;
        }
    }

    getCompassDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(((degrees % 360) / 45)) % 8;
        return directions[index];
    }

    calculateAllObjects() {
        const jd = this.astronomy.getJulianDate();
        this.allObjects = [];
        
        this.stars.forEach(star => {
            const pos = this.astronomy.equatorialToHorizontal(
                star.ra, star.dec, this.latitude, this.longitude, jd
            );
            
            if (pos.altitude > 0) {
                this.allObjects.push({
                    type: 'star',
                    name: star.name,
                    magnitude: star.magnitude,
                    spectralClass: star.spectralClass,
                    altitude: pos.altitude,
                    azimuth: pos.azimuth
                });
            }
        });
        
        this.planets.forEach(planetName => {
            const planet = this.astronomy.getPlanetPosition(planetName, jd);
            if (planet) {
                const pos = this.astronomy.equatorialToHorizontal(
                    planet.ra, planet.dec, this.latitude, this.longitude, jd
                );
                
                if (pos.altitude > 0) {
                    this.allObjects.push({
                        type: 'planet',
                        name: planetName,
                        magnitude: planet.magnitude,
                        altitude: pos.altitude,
                        azimuth: pos.azimuth
                    });
                }
            }
        });
        
        const moon = this.astronomy.getMoonPosition(jd);
        const moonPos = this.astronomy.equatorialToHorizontal(
            moon.ra, moon.dec, this.latitude, this.longitude, jd
        );
        
        if (moonPos.altitude > 0) {
            const phase = this.astronomy.getMoonPhase(jd);
            this.allObjects.push({
                type: 'moon',
                name: 'Moon',
                phase: phase,
                magnitude: -12.74,
                altitude: moonPos.altitude,
                azimuth: moonPos.azimuth
            });
        }
        
        this.allObjects.sort((a, b) => a.magnitude - b.magnitude);
    }

    skyToScreen(altitude, azimuth) {
        const normalizedAlt = altitude / 90;
        const distance = this.mapRadius * (1 - normalizedAlt);
        
        const adjustedAzimuth = (azimuth - this.compassHeading - this.compassOffset + 360) % 360;
        const angleRad = this.deg2rad(adjustedAzimuth);
        
        const x = this.centerX + distance * Math.sin(angleRad);
        const y = this.centerY - distance * Math.cos(angleRad);
        
        return { x, y };
    }

    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.calculateAllObjects();
        
        this.drawSkyGradient();
        this.drawHorizon();
        this.drawConstellations();
        this.drawStars();
        this.drawPlanets();
        this.drawMoon();
        this.drawCompassRose();
        
        this.updateObjectInfo();
        
        this.animationId = requestAnimationFrame(() => this.render());
    }

    drawSkyGradient() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.mapRadius
        );
        
        gradient.addColorStop(0, 'rgba(27, 39, 53, 0.4)');
        gradient.addColorStop(1, 'rgba(9, 10, 15, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mapRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHorizon() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mapRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mapRadius * 0.33, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mapRadius * 0.67, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCompassRose() {
        const directions = [
            { name: 'N', angle: 0 },
            { name: 'E', angle: 90 },
            { name: 'S', angle: 180 },
            { name: 'W', angle: 270 }
        ];
        
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        directions.forEach(dir => {
            const adjustedAngle = (dir.angle - this.compassHeading - this.compassOffset + 360) % 360;
            const angleRad = this.deg2rad(adjustedAngle);
            
            const distance = this.mapRadius + 25;
            const x = this.centerX + distance * Math.sin(angleRad);
            const y = this.centerY - distance * Math.cos(angleRad);
            
            this.ctx.fillStyle = dir.name === 'N' ? '#4CAF50' : '#fff';
            this.ctx.fillText(dir.name, x, y);
        });
    }

    drawStars() {
        this.allObjects.filter(obj => obj.type === 'star').forEach(star => {
            const pos = this.skyToScreen(star.altitude, star.azimuth);
            
            const size = Math.max(1, 5 - star.magnitude);
            
            const color = this.getStarColor(star.spectralClass);
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (star.magnitude < 1.5) {
                this.ctx.fillStyle = color.replace('1)', '0.3)');
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                if (star.magnitude < 0.5) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = '11px Arial';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(star.name, pos.x + size + 5, pos.y);
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
        this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
        this.ctx.lineWidth = 1;
        
        Object.entries(CONSTELLATIONS).forEach(([name, lines]) => {
            lines.forEach(line => {
                this.ctx.beginPath();
                let started = false;
                
                line.forEach(starIndex => {
                    const star = this.stars[starIndex];
                    if (!star) return;
                    
                    const jd = this.astronomy.getJulianDate();
                    const pos = this.astronomy.equatorialToHorizontal(
                        star.ra, star.dec, this.latitude, this.longitude, jd
                    );
                    
                    if (pos.altitude > 0) {
                        const screenPos = this.skyToScreen(pos.altitude, pos.azimuth);
                        
                        if (!started) {
                            this.ctx.moveTo(screenPos.x, screenPos.y);
                            started = true;
                        } else {
                            this.ctx.lineTo(screenPos.x, screenPos.y);
                        }
                    }
                });
                
                this.ctx.stroke();
            });
        });
    }

    drawPlanets() {
        this.allObjects.filter(obj => obj.type === 'planet').forEach(planet => {
            const pos = this.skyToScreen(planet.altitude, planet.azimuth);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(planet.name, pos.x + 10, pos.y);
        });
    }

    drawMoon() {
        const moon = this.allObjects.find(obj => obj.type === 'moon');
        if (!moon) return;
        
        const pos = this.skyToScreen(moon.altitude, moon.azimuth);
        const radius = 8;
        
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (moon.phase < 0.99) {
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            const shadowWidth = radius * 2 * (1 - moon.phase);
            this.ctx.ellipse(pos.x, pos.y, shadowWidth, radius, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = 'rgba(224, 224, 224, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        const phasePercent = Math.round(moon.phase * 100);
        this.ctx.fillText(`Moon ${phasePercent}%`, pos.x + 12, pos.y);
    }

    updateObjectInfo() {
        if (!this.objectList) return;
        
        if (this.allObjects.length === 0) {
            this.objectList.innerHTML = '<p style="color: #888;">No objects visible</p>';
            return;
        }
        
        const topObjects = this.allObjects.slice(0, 15);
        
        this.objectList.innerHTML = topObjects.map(obj => {
            const icon = obj.type === 'planet' ? '🪐' : 
                        obj.type === 'moon' ? '🌙' : '⭐';
            const altitude = Math.round(obj.altitude);
            const direction = this.getCompassDirection(obj.azimuth);
            
            return `<div class="object">
                ${icon} <strong>${obj.name}</strong> - 
                ${direction}, ${altitude}° high
                ${obj.type === 'star' ? ` (mag ${obj.magnitude.toFixed(1)})` : ''}
            </div>`;
        }).join('');
    }

    updateStatus(message) {
        if (this.statusEl) {
            this.statusEl.textContent = message;
        }
    }

    showError(message) {
        if (this.errorMsg) {
            this.errorMsg.textContent = message;
            this.errorMsg.classList.remove('hidden');
        }
        if (this.statusEl) {
            this.statusEl.textContent = 'Error';
        }
        console.error('Sky Map Error:', message);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new NightSkyMap();
        window.app = app; // For calibration access
    });
} else {
    app = new NightSkyMap();
    window.app = app;
}
