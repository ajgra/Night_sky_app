// Astronomy calculations and star catalog

class Astronomy {
    constructor() {
        this.J2000 = 2451545.0; // Julian date for J2000.0 epoch
    }

    // Convert degrees to radians
    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    // Convert radians to degrees
    rad2deg(rad) {
        return rad * 180 / Math.PI;
    }

    // Calculate Julian Date
    getJulianDate(date = new Date()) {
        return (date.getTime() / 86400000) + 2440587.5;
    }

    // Calculate Local Sidereal Time
    getLocalSiderealTime(jd, longitude) {
        const T = (jd - this.J2000) / 36525;
        const theta0 = 280.46061837 + 360.98564736629 * (jd - this.J2000) + 
                       0.000387933 * T * T - T * T * T / 38710000;
        const lst = (theta0 + longitude) % 360;
        return lst < 0 ? lst + 360 : lst;
    }

    // Convert RA/Dec to Altitude/Azimuth
    equatorialToHorizontal(ra, dec, lat, lon, jd) {
        const lst = this.getLocalSiderealTime(jd, lon);
        const ha = lst - ra; // Hour Angle
        
        const latRad = this.deg2rad(lat);
        const haRad = this.deg2rad(ha);
        const decRad = this.deg2rad(dec);
        
        // Calculate altitude
        const sinAlt = Math.sin(decRad) * Math.sin(latRad) + 
                       Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
        const altitude = this.rad2deg(Math.asin(sinAlt));
        
        // Calculate azimuth
        const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
                      (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
        let azimuth = this.rad2deg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
        
        if (Math.sin(haRad) > 0) {
            azimuth = 360 - azimuth;
        }
        
        return { altitude, azimuth };
    }

    // Calculate Sun position (simplified)
    getSunPosition(jd) {
        const n = jd - this.J2000;
        const L = (280.460 + 0.9856474 * n) % 360;
        const g = this.deg2rad((357.528 + 0.9856003 * n) % 360);
        
        const lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
        const epsilon = 23.439 - 0.0000004 * n;
        
        const ra = this.rad2deg(Math.atan2(
            Math.cos(this.deg2rad(epsilon)) * Math.sin(this.deg2rad(lambda)),
            Math.cos(this.deg2rad(lambda))
        ));
        
        const dec = this.rad2deg(Math.asin(
            Math.sin(this.deg2rad(epsilon)) * Math.sin(this.deg2rad(lambda))
        ));
        
        return { ra: (ra + 360) % 360, dec };
    }

    // Calculate Moon position (simplified)
    getMoonPosition(jd) {
        const n = jd - this.J2000;
        const L = (218.316 + 13.176396 * n) % 360;
        const M = (134.963 + 13.064993 * n) % 360;
        const F = (93.272 + 13.229350 * n) % 360;
        
        const lambda = L + 6.289 * Math.sin(this.deg2rad(M));
        const beta = 5.128 * Math.sin(this.deg2rad(F));
        const epsilon = 23.439 - 0.0000004 * n;
        
        const ra = this.rad2deg(Math.atan2(
            Math.sin(this.deg2rad(lambda)) * Math.cos(this.deg2rad(epsilon)) - 
            Math.tan(this.deg2rad(beta)) * Math.sin(this.deg2rad(epsilon)),
            Math.cos(this.deg2rad(lambda))
        ));
        
        const dec = this.rad2deg(Math.asin(
            Math.sin(this.deg2rad(beta)) * Math.cos(this.deg2rad(epsilon)) +
            Math.cos(this.deg2rad(beta)) * Math.sin(this.deg2rad(epsilon)) * 
            Math.sin(this.deg2rad(lambda))
        ));
        
        return { ra: (ra + 360) % 360, dec };
    }

    // Moon phase calculation
    getMoonPhase(jd) {
        const sun = this.getSunPosition(jd);
        const moon = this.getMoonPosition(jd);
        
        let phase = moon.ra - sun.ra;
        if (phase < 0) phase += 360;
        
        const illumination = (1 - Math.cos(this.deg2rad(phase))) / 2;
        return illumination;
    }

    // Simplified planet positions (uses mean orbital elements)
    getPlanetPosition(planet, jd) {
        const n = jd - this.J2000;
        const planets = {
            'Mercury': { L0: 252.25, w: 4.09233, i: 7.00, a: 0.387, e: 0.206 },
            'Venus': { L0: 181.98, w: 1.60214, i: 3.39, a: 0.723, e: 0.007 },
            'Mars': { L0: 355.43, w: 0.52407, i: 1.85, a: 1.524, e: 0.093 },
            'Jupiter': { L0: 34.35, w: 0.08309, i: 1.31, a: 5.203, e: 0.048 },
            'Saturn': { L0: 50.08, w: 0.03346, i: 2.49, a: 9.537, e: 0.054 }
        };
        
        if (!planets[planet]) return null;
        
        const p = planets[planet];
        const L = (p.L0 + p.w * n) % 360;
        const M = this.deg2rad(L);
        
        // Very simplified - actual planets need complex perturbation calculations
        const ra = L;
        const dec = Math.sin(this.deg2rad(p.i)) * Math.sin(M) * 10;
        
        return { ra, dec, magnitude: this.getPlanetMagnitude(planet) };
    }

    getPlanetMagnitude(planet) {
        const magnitudes = {
            'Mercury': 0.0,
            'Venus': -4.0,
            'Mars': 0.5,
            'Jupiter': -2.5,
            'Saturn': 0.5
        };
        return magnitudes[planet] || 5;
    }
}

// Bright star catalog (top 100 brightest stars)
const STAR_CATALOG = [
    // Format: [name, RA (hours), Dec (degrees), magnitude, spectral class]
    ['Sirius', 6.752, -16.716, -1.46, 'A1V'],
    ['Canopus', 6.399, -52.696, -0.72, 'F0Ib'],
    ['Arcturus', 14.261, 19.182, -0.04, 'K1.5III'],
    ['Rigel Kentaurus', 14.661, -60.833, -0.01, 'G2V'],
    ['Vega', 18.615, 38.783, 0.03, 'A0V'],
    ['Capella', 5.278, 45.998, 0.08, 'G8III'],
    ['Rigel', 5.242, -8.202, 0.12, 'B8Ia'],
    ['Procyon', 7.655, 5.225, 0.38, 'F5IV'],
    ['Achernar', 1.629, -57.237, 0.46, 'B3V'],
    ['Betelgeuse', 5.919, 7.407, 0.50, 'M2Iab'],
    ['Hadar', 14.063, -60.373, 0.61, 'B1III'],
    ['Altair', 19.846, 8.868, 0.77, 'A7V'],
    ['Aldebaran', 4.599, 16.509, 0.85, 'K5III'],
    ['Spica', 13.420, -11.161, 1.04, 'B1V'],
    ['Antares', 16.490, -26.432, 1.09, 'M1.5Iab'],
    ['Pollux', 7.755, 28.026, 1.14, 'K0III'],
    ['Fomalhaut', 22.961, -29.622, 1.16, 'A3V'],
    ['Deneb', 20.690, 45.280, 1.25, 'A2Ia'],
    ['Mimosa', 12.795, -59.689, 1.30, 'B0.5III'],
    ['Regulus', 10.139, 11.967, 1.35, 'B7V'],
    ['Adhara', 6.977, -28.972, 1.50, 'B2II'],
    ['Castor', 7.577, 31.888, 1.57, 'A1V'],
    ['Shaula', 17.560, -37.104, 1.62, 'B2IV'],
    ['Bellatrix', 5.419, 6.350, 1.64, 'B2III'],
    ['Elnath', 5.438, 28.608, 1.65, 'B7III'],
    ['Miaplacidus', 9.220, -69.717, 1.68, 'A2IV'],
    ['Alnilam', 5.603, -1.202, 1.69, 'B0Ia'],
    ['Alnitak', 5.679, -1.943, 1.70, 'O9Ib'],
    ['Alnair', 22.137, -46.961, 1.74, 'B7IV'],
    ['Alioth', 12.900, 55.960, 1.77, 'A0pCr'],
    ['Dubhe', 11.062, 61.751, 1.79, 'K1III'],
    ['Mirfak', 3.405, 49.861, 1.79, 'F5Ib'],
    ['Wezen', 7.140, -26.393, 1.84, 'F8Ia'],
    ['Alkaid', 13.792, 49.313, 1.86, 'B3V'],
    ['Sargas', 17.621, -42.998, 1.87, 'F1II'],
    ['Avior', 8.375, -59.509, 1.86, 'K3III'],
    ['Menkalinan', 6.008, 44.947, 1.90, 'A2V'],
    ['Atria', 16.811, -69.028, 1.92, 'K2IIb'],
    ['Alhena', 6.628, 16.399, 1.93, 'A0IV'],
    ['Peacock', 20.427, -56.735, 1.94, 'B2IV'],
    ['Polaris', 2.530, 89.264, 1.98, 'F7Ib'],
    ['Mirzam', 6.378, -17.956, 1.98, 'B1II'],
    ['Alphard', 9.460, -8.659, 1.98, 'K3II'],
    ['Hamal', 2.120, 23.462, 2.00, 'K2III'],
    ['Kaus Australis', 18.403, -34.385, 2.02, 'B9.5III'],
    ['Algieba', 10.332, 19.842, 2.08, 'K1III'],
    ['Diphda', 0.726, -17.987, 2.04, 'K0III'],
    ['Nunki', 18.921, -26.297, 2.05, 'B2.5V'],
    ['Mizar', 13.397, 54.925, 2.04, 'A2V'],
    ['Scheat', 23.063, 28.083, 2.42, 'M2.5II'],
];

// Constellation lines (connecting stars by their catalog positions)
const CONSTELLATIONS = {
    'Ursa Major': [[0, 30], [30, 33], [33, 29], [29, 0], [30, 48]], // Big Dipper
    'Orion': [[6, 9, 24], [24, 26, 27], [9, 26]], // Orion's Belt & shoulders
    'Cassiopeia': [[40, 41, 46, 50, 51]],
    'Leo': [[19, 44]], // Lion's head
    'Scorpius': [[14, 43, 23]],
};

// Convert RA from hours to degrees
function raHoursToDegrees(hours) {
    return hours * 15;
}

// Process star catalog
function getStars() {
    return STAR_CATALOG.map((star, index) => ({
        id: index,
        name: star[0],
        ra: raHoursToDegrees(star[1]),
        dec: star[2],
        magnitude: star[3],
        spectralClass: star[4]
    }));
}
