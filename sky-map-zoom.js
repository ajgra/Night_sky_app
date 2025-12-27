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
        this.maxZoom = 10.0; // Increased for better detail
        this.focusMode = false; // Focus on selected constellation only
        
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
        this.selectedConstellation = null; // Currently selected constellation
        
        // Constellation colors
        this.constellationColors = {
            'Ursa Major': '#FF6B6B',
            'Orion': '#4ECDC4',
            'Cassiopeia': '#FFD93D',
            'Leo': '#FF9F1C',
            'Scorpius': '#C44569',
            'Lyra': '#5B8C5A',
            'Cygnus': '#6C5CE7',
            'Aquila': '#00B894',
            'Taurus': '#E17055',
            'Gemini': '#A29BFE'
        };
        
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
                // Check if this was a tap (not a drag)
                if (e.changedTouches.length === 1) {
                    const touch = e.changedTouches[0];
                    this.handleTap(touch.clientX, touch.clientY);
                }
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
        
        const focusBtn = document.getElementById('focusMode');
        if (focusBtn) {
            focusBtn.addEventListener('click', () => {
                this.focusMode = !this.focusMode;
                focusBtn.textContent = this.focusMode ? '🔦 ON' : '🔦 OFF';
                focusBtn.style.background = this.focusMode ? '#4CAF50' : 'rgba(76, 175, 80, 0.6)';
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
                    if (document.getElementById('legend')) {
                        document.getElementById('legend').classList.remove('hidden');
                    }
                    
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
        
        // Add stars
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
        
        // Add planets
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
        
        // Add Moon
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

    handleTap(x, y) {
        // Only handle taps when zoomed in
        if (this.zoomLevel < 1.5) {
            this.selectedConstellation = null;
            return;
        }
        
        // Check if tap is on a constellation
        for (const constellation of this.constellationsInView) {
            if (this.isPointInConstellation(x, y, constellation.name)) {
                // Toggle selection
                if (this.selectedConstellation === constellation.name) {
                    this.selectedConstellation = null;
                } else {
                    this.selectedConstellation = constellation.name;
                }
                return;
            }
        }
        
        // Tap on empty space deselects
        this.selectedConstellation = null;
    }

    isPointInConstellation(x, y, constellationName) {
        const constellation = CONSTELLATIONS[constellationName];
        if (!constellation) return false;
        
        // Check if point is near any star in the constellation
        const lines = Array.isArray(constellation) ? constellation : constellation;
        for (const line of lines) {
            for (const starIndex of line) {
                const star = this.allObjects.find(obj => obj.catalogIndex === starIndex);
                if (star) {
                    const pos = this.skyToScreen(star.altitude, star.azimuth);
                    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (distance < 40) { // 40 pixel tap radius
                        return true;
                    }
                }
            }
        }
        return false;
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
        
        // If a constellation is selected, show detailed info
        if (this.selectedConstellation) {
            const constellation = CONSTELLATIONS[this.selectedConstellation];
            const info = CONSTELLATIONS_EXTENDED ? CONSTELLATIONS_EXTENDED[this.selectedConstellation] : null;
            const color = this.constellationColors[this.selectedConstellation] || '#4CAF50';
            
            // Get all stars in this constellation
            const constellationStars = [];
            if (constellation) {
                constellation.forEach(line => {
                    line.forEach(starIndex => {
                        const star = this.allObjects.find(obj => obj.catalogIndex === starIndex);
                        if (star && !constellationStars.find(s => s.catalogIndex === starIndex)) {
                            constellationStars.push(star);
                        }
                    });
                });
            }
            
            // Sort by magnitude (brightest first)
            constellationStars.sort((a, b) => a.magnitude - b.magnitude);
            
            let html = `<div style="padding: 10px; background: rgba(0,0,0,0.9); border-radius: 10px; border: 2px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: ${color}; font-size: 16px;">✨ ${this.selectedConstellation}</div>
                    <div style="color: #888; font-size: 11px; cursor: pointer;" onclick="app.selectedConstellation = null;">✕ Close</div>
                </div>`;
            
            if (info) {
                html += `<div style="font-size: 12px; color: #ccc; margin-bottom: 8px; line-height: 1.4;">
                    ${info.description}
                </div>`;
                
                if (info.mythology) {
                    html += `<div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic; line-height: 1.3;">
                        ${info.mythology}
                    </div>`;
                }
            }
            
            // List all stars
            html += `<div style="font-size: 12px; color: ${color}; margin: 8px 0; font-weight: bold;">
                Stars in this constellation:
            </div>`;
            
            html += `<div style="max-height: 120px; overflow-y: auto;">`;
            constellationStars.forEach((star, index) => {
                html += `<div style="font-size: 11px; color: #aaa; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    ${index + 1}. <span style="color: #fff; font-weight: bold;">${star.name}</span> 
                    <span style="color: #666;">(mag ${star.magnitude.toFixed(1)})</span>
                </div>`;
            });
            html += `</div>`;
            
            html += `<div style="font-size: 10px; color: #666; margin-top: 8px; text-align: center;">
                Tap elsewhere to deselect
            </div>`;
            
            html += `</div>`;
            
            this.constellationList.innerHTML = html;
            return;
        }
        
        // Normal view - show constellations in view
        if (this.constellationsInView.length === 0 || this.zoomLevel < 1.2) {
            this.constellationList.innerHTML = '<div style="color: #888; font-size: 12px;">Zoom in to see constellations</div>';
            return;
        }
        
        const html = this.constellationsInView.slice(0, 3).map(c => {
            const percent = Math.round(c.visibility * 100);
            const info = CONSTELLATIONS_EXTENDED ? CONSTELLATIONS_EXTENDED[c.name] : null;
            const color = this.constellationColors[c.name] || '#4CAF50';
            
            let output = `<div style="margin: 8px 0; padding: 10px; background: rgba(76,175,80,0.15); border-radius: 8px; border-left: 3px solid ${color}; cursor: pointer;" onclick="app.selectedConstellation = '${c.name}';">
                <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">✨ ${c.name}</div>
                <div style="font-size: 11px; color: #aaa; margin-bottom: 6px;">${c.starsVisible} stars visible (${percent}%)</div>`;
            
            if (info && this.zoomLevel > 1.5) {
                output += `<div style="font-size: 11px; color: #ccc; margin-top: 6px; line-height: 1.4;">
                    ${info.description}
                </div>`;
            }
            
            output += `<div style="font-size: 10px; color: #666; margin-top: 6px;">
                Tap to see all stars
            </div>`;
            
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
        
        // Only show constellations when zoomed
        if (this.zoomLevel > 1.2) {
            this.drawConstellations();
        }
        
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
        Object.entries(CONSTELLATIONS).forEach(([name, lines]) => {
            const isSelected = this.selectedConstellation === name;
            const inView = this.constellationsInView.find(c => c.name === name);
            
            // In focus mode, only draw selected constellation
            if (this.focusMode && this.selectedConstellation && !isSelected) {
                return;
            }
            
            // Determine color and opacity
            let color, lineWidth;
            if (isSelected) {
                // Selected constellation - bright and thick
                color = this.constellationColors[name] || '#4CAF50';
                lineWidth = 3 * Math.min(this.zoomLevel, 4.0);
                this.ctx.strokeStyle = color;
                this.ctx.globalAlpha = 1.0;
            } else if (inView && inView.visibility > 0.3) {
                // Visible constellation - colored but subtle
                color = this.constellationColors[name] || '#87CEEB';
                lineWidth = 1.5 * Math.min(this.zoomLevel, 3.0);
                this.ctx.strokeStyle = color;
                this.ctx.globalAlpha = 0.5;
            } else {
                // Faint constellation
                color = 'rgba(135, 206, 235, 0.2)';
                lineWidth = 1 * Math.min(this.zoomLevel, 2.0);
                this.ctx.strokeStyle = color;
                this.ctx.globalAlpha = 0.3;
            }
            
            this.ctx.lineWidth = lineWidth;
            
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
            
            // Reset alpha
            this.ctx.globalAlpha = 1.0;
            
            // Draw constellation name if selected or highly visible
            if (isSelected || (inView && inView.visibility > 0.6 && this.zoomLevel > 2.0)) {
                const firstStar = this.allObjects.find(obj => obj.catalogIndex === lines[0][0]);
                if (firstStar) {
                    const pos = this.skyToScreen(firstStar.altitude, firstStar.azimuth);
                    if (this.isInView(pos.x, pos.y)) {
                        const fontSize = Math.round(16 * Math.min(this.zoomLevel, 4.0));
                        this.ctx.fillStyle = color;
                        this.ctx.font = `bold ${fontSize}px Arial`;
                        this.ctx.textAlign = 'center';
                        this.ctx.strokeStyle = '#000';
                        this.ctx.lineWidth = 3;
                        this.ctx.strokeText(name, pos.x, pos.y - 25 * Math.min(this.zoomLevel, 3.0));
                        this.ctx.fillText(name, pos.x, pos.y - 25 * Math.min(this.zoomLevel, 3.0));
                    }
                }
            }
        });
    }

    drawStars() {
        this.allObjects.filter(obj => obj.type === 'star').forEach(star => {
            const pos = this.skyToScreen(star.altitude, star.azimuth);
            
            if (!this.isInView(pos.x, pos.y)) return;
            
            // Check if this star is in the selected constellation
            const isInSelectedConstellation = this.selectedConstellation && 
                this.isStarInConstellation(star.catalogIndex, this.selectedConstellation);
            
            // Smart filtering for clarity
            // At high zoom, hide dim stars unless they're in selected constellation
            if (this.zoomLevel > 4.0 && star.magnitude > 3.5 && !isInSelectedConstellation) {
                return; // Skip very dim stars at high zoom
            }
            
            // Focus mode: only show selected constellation stars (and very bright stars)
            if (this.focusMode && this.selectedConstellation) {
                if (!isInSelectedConstellation && star.magnitude > 0.5) {
                    return; // Hide non-constellation stars in focus mode
                }
            }
            
            // Dim non-constellation stars when something is selected
            let alpha = 1.0;
            if (this.selectedConstellation && !isInSelectedConstellation) {
                alpha = 0.3; // Dim other stars
            }
            
            const size = Math.max(1, (5 - star.magnitude) * this.zoomLevel * 0.8);
            const color = this.getStarColor(star.spectralClass);
            
            // Draw star with appropriate alpha
            this.ctx.globalAlpha = alpha;
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
            
            this.ctx.globalAlpha = 1.0; // Reset alpha
            
            // Show star names:
            // - Always for very bright stars (mag < 0.5)
            // - For selected constellation stars (any magnitude)
            // - For bright stars when zoomed (mag < 2.0 and zoom > 1.5x)
            const shouldShowName = 
                star.magnitude < 0.5 || 
                isInSelectedConstellation ||
                (this.zoomLevel > 1.5 && star.magnitude < 2.0 && !this.selectedConstellation);
            
            if (shouldShowName) {
                const fontSize = Math.round(11 * Math.min(this.zoomLevel, 3.0)); // Cap font scaling
                
                this.ctx.fillStyle = isInSelectedConstellation ? 
                    (this.constellationColors[this.selectedConstellation] || '#4CAF50') : '#fff';
                this.ctx.font = `${isInSelectedConstellation ? 'bold ' : ''}${fontSize}px Arial`;
                this.ctx.textAlign = 'left';
                
                // Add background for selected constellation stars
                if (isInSelectedConstellation) {
                    const metrics = this.ctx.measureText(star.name);
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    this.ctx.fillRect(pos.x + size + 3, pos.y - fontSize/2 - 2, metrics.width + 6, fontSize + 4);
                    this.ctx.fillStyle = this.constellationColors[this.selectedConstellation] || '#4CAF50';
                }
                
                this.ctx.fillText(star.name, pos.x + size + 5, pos.y);
            }
        });
    }

    isStarInConstellation(starIndex, constellationName) {
        const constellation = CONSTELLATIONS[constellationName];
        if (!constellation) return false;
        
        for (const line of constellation) {
            if (line.includes(starIndex)) {
                return true;
            }
        }
        return false;
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

    drawPlanets() {
        this.allObjects.filter(obj => obj.type === 'planet').forEach(planet => {
            const pos = this.skyToScreen(planet.altitude, planet.azimuth);
            
            if (!this.isInView(pos.x, pos.y)) return;
            
            const size = 6 * Math.min(this.zoomLevel, 3.0); // Cap size scaling
            
            // Dim planets when constellation is selected (unless very bright or low zoom)
            const alpha = (this.selectedConstellation && this.focusMode) ? 0.4 : 1.0;
            this.ctx.globalAlpha = alpha;
            
            // Draw planet
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow effect
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1.0; // Reset
            
            // Show planet names (always, but smaller at high zoom)
            const fontSize = Math.round(13 * Math.min(this.zoomLevel, 2.5));
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'left';
            
            // Background for readability
            const metrics = this.ctx.measureText(planet.name);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(pos.x + size + 3, pos.y - fontSize/2 - 2, metrics.width + 6, fontSize + 4);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText(planet.name, pos.x + size + 5, pos.y);
        });
    }

    drawMoon() {
        const moon = this.allObjects.find(obj => obj.type === 'moon');
        if (!moon) return;
        
        const pos = this.skyToScreen(moon.altitude, moon.azimuth);
        if (!this.isInView(pos.x, pos.y)) return;
        
        const radius = 10 * Math.min(this.zoomLevel, 3.0); // Cap size scaling
        
        // Dim moon when constellation is selected in focus mode
        const alpha = (this.selectedConstellation && this.focusMode) ? 0.4 : 1.0;
        this.ctx.globalAlpha = alpha;
        
        // Draw moon
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Phase shadow
        if (moon.phase < 0.99) {
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            const shadowWidth = radius * 2 * (1 - moon.phase);
            this.ctx.ellipse(pos.x, pos.y, shadowWidth, radius, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Glow
        this.ctx.fillStyle = 'rgba(224, 224, 224, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1.0; // Reset
        
        // Label
        const fontSize = Math.round(13 * Math.min(this.zoomLevel, 2.5));
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'left';
        const phasePercent = Math.round(moon.phase * 100);
        
        // Background
        const text = `Moon ${phasePercent}%`;
        const metrics = this.ctx.measureText(text);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(pos.x + radius + 3, pos.y - fontSize/2 - 2, metrics.width + 6, fontSize + 4);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(text, pos.x + radius + 5, pos.y);
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
