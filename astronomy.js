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

// Bright star catalog (top 50 + essential constellation stars)
const STAR_CATALOG = [
    // Format: [name, RA (hours), Dec (degrees), magnitude, spectral class]
    // Top brightest stars
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
    // Big Dipper stars (add missing ones)
    ['Merak', 11.031, 56.382, 2.37, 'A1V'],      // Index 50
    ['Phecda', 11.897, 53.695, 2.44, 'A0V'],     // Index 51
    ['Megrez', 12.257, 57.032, 3.31, 'A3V'],     // Index 52
    // Cassiopeia stars (add missing ones)
    ['Schedar', 0.675, 56.537, 2.23, 'K0III'],   // Index 53
    ['Caph', 0.153, 59.150, 2.27, 'F2III'],      // Index 54
    ['Gamma Cas', 0.945, 60.717, 2.47, 'B0IVe'], // Index 55
    ['Ruchbah', 1.430, 60.235, 2.68, 'A5V'],     // Index 56
    ['Segin', 1.911, 63.670, 3.38, 'B3V'],       // Index 57
    // Orion Belt (add Mintaka if missing)
    ['Mintaka', 5.533, -0.299, 2.23, 'O9.5II'],  // Index 58
    // Leo stars
    ['Denebola', 11.818, 14.572, 2.14, 'A3V'],   // Index 59
    // Andromeda stars
    ['Alpheratz', 0.140, 29.090, 2.06, 'B9p'],   // Index 60 (shared with Pegasus)
    ['Mirach', 1.162, 35.620, 2.06, 'M0III'],    // Index 61
    ['Almach', 2.065, 42.330, 2.26, 'K3IIb'],    // Index 62
    ['Delta And', 0.655, 30.860, 3.27, 'K3III'],  // Index 63
    // Pegasus stars
    ['Markab', 23.079, 15.210, 2.49, 'B9III'],   // Index 64
    ['Algenib', 0.220, 15.180, 2.83, 'B2IV'],    // Index 65
    ['Enif', 21.736, 9.880, 2.39, 'K2Ib'],       // Index 66
    // Perseus stars  
    ['Algol', 3.136, 40.960, 2.12, 'B8V'],       // Index 67 (famous variable star!)
    ['Gamma Per', 3.079, 53.510, 2.93, 'G9III'], // Index 68
    ['Delta Per', 3.715, 47.790, 3.01, 'B5III'], // Index 69
    // Auriga stars (Capella & Menkalinan already in catalog)
    ['Theta Aur', 5.995, 37.210, 2.62, 'A0pSi'], // Index 70
    ['Iota Aur', 4.950, 33.170, 2.69, 'K3II'],   // Index 71
    ['Eta Aur', 5.103, 41.230, 3.17, 'B3V'],     // Index 72
    // Southern Cross (Crux) stars
    ['Acrux', 12.443, -63.099, 0.77, 'B0.5IV'],  // Index 73 (Alpha Crucis)
    ['Gacrux', 12.519, -57.113, 1.63, 'M3.5III'], // Index 74 (Gamma Crucis)
    ['Delta Cru', 12.253, -58.749, 2.79, 'B2IV'], // Index 75
    // Centaurus stars (Alpha & Beta already in catalog)
    ['Theta Cen', 14.111, -36.370, 2.06, 'K0III'], // Index 76
    ['Epsilon Cen', 13.665, -53.466, 2.29, 'B1III'], // Index 77
    ['Zeta Cen', 13.928, -47.288, 2.55, 'B2.5IV'], // Index 78
    // Carina stars (Canopus, Miaplacidus, Avior already in catalog)
    ['Theta Car', 10.716, -64.394, 2.76, 'B0Vp'], // Index 79
    ['Iota Car', 9.285, -59.275, 2.25, 'A8Ib'],   // Index 80
    // Corvus stars
    ['Gienah', 12.263, -17.542, 2.59, 'B8III'],   // Index 81 (Gamma Corvi)
    ['Kraz', 12.573, -23.397, 2.65, 'G5II'],      // Index 82 (Beta Corvi)
    ['Algorab', 12.498, -16.515, 2.95, 'A0IV'],   // Index 83 (Delta Corvi)
    ['Alchiba', 12.139, -24.729, 4.02, 'F0V'],    // Index 84 (Alpha Corvi)
    // Hydra stars (Alphard already in catalog)
    ['Gamma Hya', 13.315, -23.172, 3.00, 'G8III'], // Index 85
    ['Zeta Hya', 8.923, 5.945, 3.11, 'G9II'],     // Index 86
    ['Epsilon Hya', 8.779, 6.419, 3.38, 'G5III'], // Index 87
];

// Constellation lines (connecting stars by their catalog indices)
const CONSTELLATIONS = {
    // Big Dipper - all 7 stars
    'Ursa Major': [
        [30, 50],    // Dubhe to Merak
        [50, 51],    // Merak to Phecda
        [51, 52],    // Phecda to Megrez
        [52, 29],    // Megrez to Alioth
        [29, 48],    // Alioth to Mizar
        [48, 33],    // Mizar to Alkaid
        [50, 30],    // Close the bowl (Merak back to Dubhe)
        [51, 29]     // Connect bowl to handle
    ],
    // Orion - full constellation
    'Orion': [
        [9, 23],     // Betelgeuse to Bellatrix (shoulders)
        [23, 58],    // Bellatrix to Mintaka (belt start)
        [58, 26],    // Mintaka to Alnilam (belt middle)
        [26, 27],    // Alnilam to Alnitak (belt end)
        [27, 6],     // Alnitak to Rigel
        [6, 9],      // Rigel to Betelgeuse (close)
    ],
    // Cassiopeia - W/M shape (5 stars, west to east order)
    'Cassiopeia': [
        [54, 53],    // Caph to Schedar (start at rightmost/earliest RA)
        [53, 55],    // Schedar to Gamma Cas
        [55, 56],    // Gamma Cas to Ruchbah
        [56, 57]     // Ruchbah to Segin (end at leftmost/latest RA)
    ],
    // Leo - Lion shape
    'Leo': [
        [19, 45],    // Regulus to Algieba (sickle)
        [19, 59]     // Regulus to Denebola (body)
    ],
    // Scorpius - Scorpion
    'Scorpius': [
        [14, 22],    // Antares to Shaula (body/tail)
        [22, 34]     // Shaula to Sargas (stinger)
    ],
    // Andromeda - Princess (curved line of stars)
    'Andromeda': [
        [60, 63],    // Alpheratz to Delta And
        [63, 61],    // Delta And to Mirach (middle star)
        [61, 62]     // Mirach to Almach (end of chain)
    ],
    // Pegasus - Winged Horse (Great Square + nose)
    'Pegasus': [
        [64, 65],    // Markab to Algenib (bottom of square)
        [65, 60],    // Algenib to Alpheratz (side of square)
        [60, 49],    // Alpheratz to Scheat (top of square)
        [49, 64],    // Scheat to Markab (close the square)
        [64, 66]     // Markab to Enif (nose/head)
    ],
    // Perseus - The Hero (main chain)
    'Perseus': [
        [31, 67],    // Mirfak to Algol (demon star)
        [67, 68],    // Algol to Gamma Per
        [68, 69]     // Gamma Per to Delta Per
    ],
    // Auriga - The Charioteer (pentagon shape)
    'Auriga': [
        [5, 36],     // Capella to Menkalinan
        [36, 70],    // Menkalinan to Theta Aur
        [70, 71],    // Theta Aur to Iota Aur
        [71, 72],    // Iota Aur to Eta Aur
        [72, 5]      // Eta Aur back to Capella (close pentagon)
    ],
    // SOUTHERN HEMISPHERE CONSTELLATIONS
    // Crux - Southern Cross (most famous southern constellation)
    'Crux': [
        [73, 18],    // Acrux to Mimosa (long axis of cross)
        [74, 75]     // Gacrux to Delta Cru (short axis, perpendicular)
    ],
    // Centaurus - The Centaur (contains Alpha Centauri)
    'Centaurus': [
        [3, 10],     // Alpha Cen to Beta Cen (the pointers to Southern Cross)
        [3, 76],     // Alpha Cen to Theta Cen
        [76, 77],    // Theta Cen to Epsilon Cen
        [10, 78]     // Beta Cen to Zeta Cen
    ],
    // Carina - The Keel (part of ancient Argo Navis)
    'Carina': [
        [1, 25],     // Canopus to Miaplacidus
        [25, 35],    // Miaplacidus to Avior
        [35, 80],    // Avior to Iota Car
        [80, 79],    // Iota Car to Theta Car
        [79, 1]      // Theta Car back to Canopus (keel shape)
    ],
    // Corvus - The Crow (trapezoid shape)
    'Corvus': [
        [81, 82],    // Gienah to Kraz
        [82, 83],    // Kraz to Algorab
        [83, 84],    // Algorab to Alchiba
        [84, 81]     // Alchiba back to Gienah (close trapezoid)
    ],
    // Hydra - The Sea Serpent (largest constellation)
    'Hydra': [
        [42, 85],    // Alphard to Gamma Hya (body)
        [85, 86],    // Gamma Hya to Zeta Hya
        [86, 87]     // Zeta Hya to Epsilon Hya (head)
    ],
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
