// Night Sky Map - Enhanced with Zoom and Constellation Identification

class NightSkyMapZoom {
    constructor() {
        this.canvas = document.getElementById('skyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.astronomy = new Astronomy();
        
        // User location
        this.latitude = null;
        this.longitude = null;
        
        // Device orientation
        this.compassHeading = 0;
        this.compassOffset = 0;
        
        // Map settings
        this.centerX = 0;
        this.centerY = 0;
        this.mapRadius = 0;
        
        // Zoom and Pan
        this.zoomLevel = 1.0; // 1.0 = normal, 2.0 = 2x zoom, etc.
        this.panX = 0; // Pan offset in screen coordinates
        this.panY = 0;
        this.minZoom = 1.0;
        this.maxZoom = 4.0;
        
        // Touch handling
        this.isDragging = false;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.lastPinchDistance = 0;
        
        // Celestial objects
        this.stars = [];
        this.planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        this.allObjects = [];
        this.constellationsInView = [];
        
        // Animation
        this.animationId = null;
        
        // UI elements
        this.setupUI();
        this.setupCanvas();
        this.setupTouchHandlers();
        this.showCalibration();
    }

    setupUI() {
        this.statusEl = document.getElementById('status');
        this.latEl = document.getElementById('lat');
        this.lngEl = document.getElementById('lng');
        this.directionEl = document.getElementById('direction');
        this.startBtn = document.getElementById('startBtn');
        this.objectInfo = document.getElementById('objectInfo');
        this.objectList = document.getElementById('objectList');
        this.errorMsg = document.getElementById('errorMsg');
        this.zoomInfo = document.getElementById('zoomInfo');
        this.constellationInfo = document.getElementById('constellationInfo');
        this.constellationList = document.getElementById('constellationList');
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

    setupTouchHandlers() {
        // Pinch to zoom
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Start pinch
                const dist = this.getTouchDistance(e.touches[0], e.touches[1]);
                this.lastPinchDistance = dist;
            } else if (e.touches.length === 1) {
                // Start pan
                this.isDragging = true;
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            }
            e.preventDefault();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                // Pinch zoom
                const dist = this.getTouchDistance(e.touches[0], e.touches[1]);
                const delta = dist - this.lastPinchDistance;
                this.zoomLevel *= (1 + delta / 500);
                this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel));
                this.lastPinchDistance = dist;
                this.updateZoomDisplay();
            } else if (e.touches.length === 1 && this.isDragging) {
                // Pan
                const dx = e.touches[0].clientX - this.lastTouchX;
                const dy = e.touches[0].clientY - this.lastTouchY;
                this.panX += dx;
                this.panY += dy;
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            }
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', (e) => {
            this.isDragging = false;
            if (e.touches.length === 0) {
                this.identifyConstellationsInView();
            }
        });

        // Zoom buttons
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const resetBtn = document.getElementById('resetView');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel * 1.3);
                this.updateZoomDisplay();
                this.identifyConstellationsInView();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomLevel = Math.max(this.minZoom, this.zoomLevel / 1.3);
                this.updateZoomDisplay();
                this.identifyConstellationsInView();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.zoomLevel = 1.0;
                this.panX = 0;
                this.panY = 0;
                this.updateZoomDisplay();
                this.identifyConstellationsInView();
            });
        }
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateZoomDisplay() {
        if (this.zoomInfo) {
            this.zoomInfo.textContent = `${this.zoomLevel.toFixed(1)}x`;
        }
    }

    showCalibration() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            this.startBtn.addEventListener('click', async () => {
                try {
                    if (typeof DeviceOrientationEvent !== 'undefined' && 
                        typeof DeviceOrientationEvent.requestPermission === 'function') {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission !== 'granted') throw new Error('Motion permission denied');
                    }
                    
                    startScreen.classList.add('hidden');
                    this.canvas.classList.remove('hidden');
                    document.getElementById('controls').classList.remove('hidden');
                    document.getElementById('zoomControls').classList.remove('hidden');
                    
                    await this.initialize();
                } catch (error) {
                    this.errorMsg.textContent = error.message;
                    this.errorMsg.classList.remove('hidden');
                }
            });
        }
    }

    async initialize() {
        this.updateStatus('Getting location...');
        await this.getLocation();
        
        this.updateStatus('Loading stars...');
        this.stars = getStars();
        
        this.startOrientationTracking();
        
        this.objectInfo.classList.remove('hidden');
        this.updateStatus('Pinch to zoom!');
        this.updateZoomDisplay();
        this.render();
    }

    async getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    this.latEl.textContent = this.latitude.toFixed(2);
                    this.lngEl.textContent = this.longitude.toFixed(2);
                    resolve();
                },
                reject,
                { enableHighAccuracy: true }
            );
        });
    }

    startOrientationTracking() {
        window.addEventListener('deviceorientation', (event) => {
            if (event.webkitCompassHeading !== undefined) {
                this.compassHeading = event.webkitCompassHeading;
            } else if (event.alpha !== null) {
                this.compassHeading = event.alpha;
            }
            
            if (this.directionEl) {
                const dir = this.getCompassDirection(this.compassHeading);
                this.directionEl.textContent = `${dir} ${Math.round(this.compassHeading)}°`;
            }
        }, true);
    }

    getCompassDirection(degrees) {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[Math.round(((degrees % 360) / 45)) % 8];
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
                    azimuth: pos.azimuth,
                    catalogIndex: star.id
                });
            }
        });
        
        this.allObjects.sort((a, b) => a.magnitude - b.magnitude);
    }

    skyToScreen(altitude, azimuth) {
        const normalizedAlt = altitude / 90;
        const distance = this.mapRadius * (1 - normalizedAlt);
        
        const adjustedAzimuth = (azimuth - this.compassHeading - this.compassOffset + 360) % 360;
        const angleRad = this.deg2rad(adjustedAzimuth);
        
        // Base position
        let x = this.centerX + distance * Math.sin(angleRad);
        let y = this.centerY - distance * Math.cos(angleRad);
        
        // Apply zoom and pan
        x = (x - this.centerX) * this.zoomLevel + this.centerX + this.panX;
        y = (y - this.centerY) * this.zoomLevel + this.centerY + this.panY;
        
        return { x, y };
    }

    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    identifyConstellationsInView() {
        this.constellationsInView = [];
        
        // Check which constellations have stars visible in the zoomed view
        Object.entries(CONSTELLATIONS).forEach(([name, lines]) => {
            let starsInView = 0;
            let totalStars = 0;
            
            lines.forEach(line => {
                line.forEach(starIndex => {
                    totalStars++;
                    const star = this.allObjects.find(obj => obj.catalogIndex === starIndex);
                    if (star) {
                        const pos = this.skyToScreen(star.altitude, star.azimuth);
                        if (this.isInView(pos.x, pos.y)) {
                            starsInView++;
                        }
                    }
                });
            });
            
            if (starsInView > 0) {
                this.constellationsInView.push({
                    name: name,
                    visibility: starsInView / totalStars,
                    starsVisible: starsInView
                });
            }
        });
        
        // Sort by visibility
        this.constellationsInView.sort((a, b) => b.visibility - a.visibility);
        this.updateConstellationInfo();
    }

    isInView(x, y) {
        return x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height;
    }

    updateConstellationInfo() {
        if (!this.constellationList) return;
        
        if (this.constellationsInView.length === 0) {
            this.constellationList.innerHTML = '<div style="color: #888; font-size: 12px;">Pan and zoom to identify constellations</div>';
            return;
        }
        
        const html = this.constellationsInView.slice(0, 3).map(c => {
            const percent = Math.round(c.visibility * 100);
            const info = CONSTELLATIONS_EXTENDED ? CONSTELLATIONS_EXTENDED[c.name] : null;
            
            let output = `<div style="margin: 8px 0; padding: 10px; background: rgba(76,175,80,0.15); border-radius: 8px; border-left: 3px solid #4CAF50;">
                <div style="font-weight: bold; color: #4CAF50; margin-bottom: 4px;">✨ ${c.name}</div>
                <div style="font-size: 11px; color: #aaa; margin-bottom: 6px;">${c.starsVisible} stars visible (${percent}%)</div>`;
            
            if (info && this.zoomLevel > 1.5) {
                output += `<div style="font-size: 11px; color: #ccc; margin-top: 6px; line-height: 1.4;">
                    ${info.description}
                </div>`;
                
                if (info.mainStars && info.mainStars.length > 0) {
                    output += `<div style="font-size: 10px; color: #888; margin-top: 4px;">
                        Main stars: ${info.mainStars.slice(0, 3).join(', ')}
                    </div>`;
                }
            }
            
            output += `</div>`;
            return output;
        }).join('');
        
        this.constellationList.innerHTML = html;
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.calculateAllObjects();
        this.identifyConstellationsInView();
        
        this.drawSkyGradient();
        this.drawHorizon();
        this.drawConstellations();
        this.drawStars();
        this.drawCompassRose();
        
        this.updateObjectInfo();
        
        this.animationId = requestAnimationFrame(() => this.render());
    }

    drawSkyGradient() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.mapRadius * this.zoomLevel
        );
        
        gradient.addColorStop(0, 'rgba(27, 39, 53, 0.4)');
        gradient.addColorStop(1, 'rgba(9, 10, 15, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHorizon() {
        const radius = this.mapRadius * this.zoomLevel;
        const cx = this.centerX + this.panX;
        const cy = this.centerY + this.panY;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Altitude circles
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        [0.33, 0.67].forEach(factor => {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius * factor, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Zenith
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 3 * this.zoomLevel, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCompassRose() {
        const dirs = [{n:'N',a:0},{n:'E',a:90},{n:'S',a:180},{n:'W',a:270}];
        this.ctx.font = `bold ${Math.round(16 * this.zoomLevel)}px Arial`;
        this.ctx.textAlign = 'center';
        
        dirs.forEach(d => {
            const adj = (d.a - this.compassHeading - this.compassOffset + 360) % 360;
            const rad = this.deg2rad(adj);
            const dist = (this.mapRadius + 25) * this.zoomLevel;
            const x = this.centerX + dist * Math.sin(rad) + this.panX;
            const y = this.centerY - dist * Math.cos(rad) + this.panY;
            
            if (this.isInView(x, y)) {
                this.ctx.fillStyle = d.n === 'N' ? '#4CAF50' : '#fff';
                this.ctx.fillText(d.n, x, y);
            }
        });
    }

    drawConstellations() {
        this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.5)';
        this.ctx.lineWidth = 1.5 * this.zoomLevel;
        
        Object.entries(CONSTELLATIONS).forEach(([name, lines]) => {
            // Check if constellation is in view
            const inView = this.constellationsInView.find(c => c.name === name);
            if (inView && inView.visibility > 0.3) {
                this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)'; // Highlight
            } else {
                this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
            }
            
            lines.forEach(line => {
                this.ctx.beginPath();
                let started = false;
                
                line.forEach(starIndex => {
                    const star = this.allObjects.find(obj => obj.catalogIndex === starIndex);
                    if (star) {
                        const pos = this.skyToScreen(star.altitude, star.azimuth);
                        
                        if (!started) {
                            this.ctx.moveTo(pos.x, pos.y);
                            started = true;
                        } else {
                            this.ctx.lineTo(pos.x, pos.y);
                        }
                    }
                });
                
                this.ctx.stroke();
            });
            
            // Draw constellation name when zoomed
            if (inView && inView.visibility > 0.5 && this.zoomLevel > 1.5) {
                const firstStar = this.allObjects.find(obj => obj.catalogIndex === lines[0][0]);
                if (firstStar) {
                    const pos = this.skyToScreen(firstStar.altitude, firstStar.azimuth);
                    if (this.isInView(pos.x, pos.y)) {
                        this.ctx.fillStyle = '#4CAF50';
                        this.ctx.font = `bold ${Math.round(14 * this.zoomLevel)}px Arial`;
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(name, pos.x, pos.y - 20 * this.zoomLevel);
                    }
                }
            }
        });
    }

    drawStars() {
        this.allObjects.filter(obj => obj.type === 'star').forEach(star => {
            const pos = this.skyToScreen(star.altitude, star.azimuth);
            
            if (!this.isInView(pos.x, pos.y)) return;
            
            const size = Math.max(1, (5 - star.magnitude) * this.zoomLevel);
            const color = this.getStarColor(star.spectralClass);
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow for bright stars
            if (star.magnitude < 1.5) {
                this.ctx.fillStyle = color.replace('1)', '0.3)');
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Show names when zoomed
            if (this.zoomLevel > 1.5 && star.magnitude < 2.0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = `${Math.round(11 * this.zoomLevel)}px Arial`;
                this.ctx.textAlign = 'left';
                this.ctx.fillText(star.name, pos.x + size + 5, pos.y);
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

    updateObjectInfo() {
        if (!this.objectList) return;
        
        const visibleInView = this.allObjects.filter(obj => {
            const pos = this.skyToScreen(obj.altitude, obj.azimuth);
            return this.isInView(pos.x, pos.y);
        }).slice(0, 10);
        
        if (visibleInView.length === 0) {
            this.objectList.innerHTML = '<p style="color: #888;">Pan to see objects</p>';
            return;
        }
        
        this.objectList.innerHTML = visibleInView.map(obj => {
            const alt = Math.round(obj.altitude);
            const dir = this.getCompassDirection(obj.azimuth);
            return `<div class="object">⭐ <strong>${obj.name}</strong> - ${dir}, ${alt}°</div>`;
        }).join('');
    }

    updateStatus(message) {
        if (this.statusEl) this.statusEl.textContent = message;
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

let app;
window.addEventListener('load', () => {
    app = new NightSkyMapZoom();
    window.app = app;
});
