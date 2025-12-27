// Enhanced Constellation Data with Descriptions

// Constellation lines (extended from astronomy.js)
const CONSTELLATIONS_EXTENDED = {
    'Ursa Major': {
        lines: [[30, 33], [33, 29], [29, 0], [0, 30], [30, 48]],
        description: 'The Great Bear - contains the Big Dipper asterism',
        mainStars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid'],
        mythology: 'In Greek mythology, Ursa Major represents Callisto, transformed into a bear by Zeus\'s jealous wife Hera.'
    },
    
    'Orion': {
        lines: [[6, 9], [9, 24], [24, 26], [26, 27], [27, 6], [9, 26]],
        description: 'The Hunter - most recognizable constellation',
        mainStars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Alnilam', 'Alnitak', 'Mintaka'],
        mythology: 'Orion was a legendary hunter in Greek mythology, placed among the stars by Zeus.'
    },
    
    'Cassiopeia': {
        lines: [[40, 41], [41, 46], [46, 50], [50, 51]],
        description: 'The Queen - distinctive W or M shape',
        mainStars: ['Schedar', 'Caph', 'Gamma Cassiopeiae', 'Ruchbah', 'Segin'],
        mythology: 'Queen Cassiopeia of Ethiopia, mother of Andromeda, boasted of her beauty and angered the gods.'
    },
    
    'Leo': {
        lines: [[19, 44], [19, 45]],
        description: 'The Lion - prominent spring constellation',
        mainStars: ['Regulus', 'Denebola', 'Algieba'],
        mythology: 'Represents the Nemean Lion slain by Hercules as his first labor.'
    },
    
    'Scorpius': {
        lines: [[14, 23], [23, 43]],
        description: 'The Scorpion - distinctive hook shape',
        mainStars: ['Antares', 'Shaula', 'Sargas'],
        mythology: 'The scorpion sent by Gaia to kill Orion. They are placed opposite in the sky.'
    },
    
    'Lyra': {
        lines: [[4, 4]],  // Just Vega for now
        description: 'The Lyre - small but bright constellation',
        mainStars: ['Vega'],
        mythology: 'Represents the lyre of Orpheus, the legendary musician of Greek mythology.'
    },
    
    'Cygnus': {
        lines: [[17, 17]],  // Deneb
        description: 'The Swan - Northern Cross asterism',
        mainStars: ['Deneb'],
        mythology: 'Zeus disguised as a swan. Forms the Summer Triangle with Vega and Altair.'
    },
    
    'Aquila': {
        lines: [[11, 11]],  // Altair
        description: 'The Eagle - summer constellation',
        mainStars: ['Altair'],
        mythology: 'The eagle that carried Zeus\'s thunderbolts.'
    },
    
    'Taurus': {
        lines: [[12, 12]],  // Aldebaran
        description: 'The Bull - contains Pleiades cluster',
        mainStars: ['Aldebaran'],
        mythology: 'Zeus transformed into a white bull to seduce Europa.'
    },
    
    'Gemini': {
        lines: [[15, 21]],  // Pollux and Castor
        description: 'The Twins - winter constellation',
        mainStars: ['Pollux', 'Castor'],
        mythology: 'The twin brothers Castor and Pollux, sons of Zeus.'
    }
};

// Function to get constellation info
function getConstellationInfo(name) {
    return CONSTELLATIONS_EXTENDED[name] || {
        description: 'Ancient constellation',
        mainStars: [],
        mythology: 'Part of the 88 modern constellations.'
    };
}

// Merge with original CONSTELLATIONS for backward compatibility
if (typeof CONSTELLATIONS !== 'undefined') {
    Object.keys(CONSTELLATIONS_EXTENDED).forEach(name => {
        if (CONSTELLATIONS[name]) {
            // Keep original line data but add metadata
            CONSTELLATIONS_EXTENDED[name].lines = CONSTELLATIONS[name];
        }
    });
}
