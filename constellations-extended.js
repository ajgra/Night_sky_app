// Enhanced Constellation Data with Descriptions

// Constellation lines (extended from astronomy.js)
const CONSTELLATIONS_EXTENDED = {
    'Ursa Major': {
        lines: [
            [30, 50],    // Dubhe to Merak
            [50, 51],    // Merak to Phecda
            [51, 52],    // Phecda to Megrez
            [52, 29],    // Megrez to Alioth
            [29, 48],    // Alioth to Mizar
            [48, 33],    // Mizar to Alkaid
            [50, 30],    // Close the bowl
            [51, 29]     // Connect bowl to handle
        ],
        description: 'The Great Bear - contains the Big Dipper asterism',
        mainStars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid'],
        mythology: 'In Greek mythology, Ursa Major represents Callisto, transformed into a bear by Zeus\'s jealous wife Hera.'
    },
    
    'Orion': {
        lines: [
            [9, 23],     // Betelgeuse to Bellatrix
            [23, 58],    // Bellatrix to Mintaka
            [58, 26],    // Mintaka to Alnilam
            [26, 27],    // Alnilam to Alnitak
            [27, 6],     // Alnitak to Rigel
            [6, 9]       // Rigel to Betelgeuse
        ],
        description: 'The Hunter - most recognizable constellation',
        mainStars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Alnilam', 'Alnitak', 'Mintaka'],
        mythology: 'Orion was a legendary hunter in Greek mythology, placed among the stars by Zeus.'
    },
    
    'Cassiopeia': {
        lines: [
            [54, 53],    // Caph to Schedar (rightmost to next, west to east)
            [53, 55],    // Schedar to Gamma Cas (valley to peak)
            [55, 56],    // Gamma Cas to Ruchbah (peak to valley)
            [56, 57]     // Ruchbah to Segin (valley to leftmost high)
        ],
        description: 'The Queen - distinctive W or M shape',
        mainStars: ['Caph', 'Schedar', 'Gamma Cas', 'Ruchbah', 'Segin'],
        mythology: 'Queen Cassiopeia of Ethiopia, mother of Andromeda, boasted of her beauty and angered the gods.'
    },
    
    'Leo': {
        lines: [
            [19, 45],    // Regulus to Algieba
            [19, 59]     // Regulus to Denebola
        ],
        description: 'The Lion - prominent spring constellation',
        mainStars: ['Regulus', 'Denebola', 'Algieba'],
        mythology: 'Represents the Nemean Lion slain by Hercules as his first labor.'
    },
    
    'Scorpius': {
        lines: [
            [14, 22],    // Antares to Shaula
            [22, 34]     // Shaula to Sargas
        ],
        description: 'The Scorpion - distinctive hook shape',
        mainStars: ['Antares', 'Shaula', 'Sargas'],
        mythology: 'The scorpion sent by Gaia to kill Orion. They are placed opposite in the sky.'
    },
    
    'Lyra': {
        lines: [[4, 4]],  // Just Vega
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
    },
    
    'Andromeda': {
        lines: [
            [60, 63],    // Alpheratz to Delta And
            [63, 61],    // Delta And to Mirach
            [61, 62]     // Mirach to Almach
        ],
        description: 'The Princess - home to Andromeda Galaxy (M31)',
        mainStars: ['Alpheratz', 'Mirach', 'Almach', 'Delta And'],
        mythology: 'Princess Andromeda, daughter of Cassiopeia, chained to a rock as sacrifice to a sea monster. Rescued by Perseus. Contains the Andromeda Galaxy, 2.5 million light-years away.'
    },
    
    'Pegasus': {
        lines: [
            [64, 65],    // Great Square bottom
            [65, 60],    // Great Square side
            [60, 49],    // Great Square top
            [49, 64],    // Close the square
            [64, 66]     // Nose/head
        ],
        description: 'The Winged Horse - Great Square asterism',
        mainStars: ['Markab', 'Scheat', 'Algenib', 'Alpheratz', 'Enif'],
        mythology: 'The winged horse of Greek mythology, born from Medusa\'s blood when Perseus slayed her. The Great Square is one of autumn\'s most recognizable patterns.'
    },
    
    'Perseus': {
        lines: [
            [31, 67],    // Mirfak to Algol
            [67, 68],    // Algol to Gamma Per
            [68, 69]     // Gamma Per to Delta Per
        ],
        description: 'The Hero - contains Algol, the Demon Star',
        mainStars: ['Mirfak', 'Algol', 'Gamma Per', 'Delta Per'],
        mythology: 'The hero who slayed Medusa and rescued Andromeda. Algol represents Medusa\'s blinking eye - a famous eclipsing binary star that dims every 2.87 days.'
    },
    
    'Auriga': {
        lines: [
            [5, 36],     // Capella to Menkalinan
            [36, 70],    // Menkalinan to Theta Aur
            [70, 71],    // Theta to Iota
            [71, 72],    // Iota to Eta
            [72, 5]      // Eta back to Capella
        ],
        description: 'The Charioteer - contains brilliant Capella',
        mainStars: ['Capella', 'Menkalinan', 'Theta Aur', 'Iota Aur', 'Eta Aur'],
        mythology: 'The chariot driver, often depicted carrying a goat (Capella means "little goat"). A prominent winter constellation with a distinctive pentagon shape.'
    },
    
    'Crux': {
        lines: [
            [73, 18],    // Acrux to Mimosa (long axis)
            [74, 75]     // Gacrux to Delta Cru (short axis)
        ],
        description: 'The Southern Cross - most famous southern constellation',
        mainStars: ['Acrux', 'Mimosa', 'Gacrux', 'Delta Crucis'],
        mythology: 'The smallest of all 88 constellations but one of the most distinctive. Used for navigation in the Southern Hemisphere. Points to the south celestial pole. Featured on flags of Australia, New Zealand, Brazil, and Papua New Guinea.'
    },
    
    'Centaurus': {
        lines: [
            [3, 10],     // Alpha Cen to Beta Cen
            [3, 76],     // Alpha Cen to Theta Cen
            [76, 77],    // Theta Cen to Epsilon Cen
            [10, 78]     // Beta Cen to Zeta Cen
        ],
        description: 'The Centaur - contains Alpha Centauri (nearest star system)',
        mainStars: ['Alpha Centauri', 'Hadar', 'Theta Cen', 'Epsilon Cen', 'Zeta Cen'],
        mythology: 'Represents Chiron, the wise centaur who tutored many Greek heroes including Achilles and Hercules. Alpha Centauri is only 4.37 light-years away - our nearest stellar neighbor. Alpha and Beta Centauri are the "pointer stars" that guide to the Southern Cross.'
    },
    
    'Carina': {
        lines: [
            [1, 25],     // Canopus to Miaplacidus
            [25, 35],    // Miaplacidus to Avior
            [35, 80],    // Avior to Iota Car
            [80, 79],    // Iota Car to Theta Car
            [79, 1]      // Theta Car back to Canopus
        ],
        description: 'The Keel - part of the ship Argo, contains Canopus',
        mainStars: ['Canopus', 'Miaplacidus', 'Avior', 'Theta Car', 'Iota Car'],
        mythology: 'Once part of the massive constellation Argo Navis (the ship of Jason and the Argonauts), later divided into Carina (keel), Vela (sails), and Puppis (stern). Canopus is the 2nd brightest star in the night sky, used for spacecraft navigation.'
    },
    
    'Corvus': {
        lines: [
            [81, 82],    // Gienah to Kraz
            [82, 83],    // Kraz to Algorab
            [83, 84],    // Algorab to Alchiba
            [84, 81]     // Alchiba back to Gienah
        ],
        description: 'The Crow - distinctive trapezoid shape',
        mainStars: ['Gienah', 'Kraz', 'Algorab', 'Alchiba'],
        mythology: 'The crow of Apollo. Sent to fetch water, the crow instead waited by a fig tree to eat the ripening fruit. When it finally returned, Apollo punished the bird by placing it in the sky, forever thirsty near the cup (Crater) it cannot reach.'
    },
    
    'Hydra': {
        lines: [
            [42, 85],    // Alphard to Gamma Hya
            [85, 86],    // Gamma Hya to Zeta Hya
            [86, 87]     // Zeta Hya to Epsilon Hya
        ],
        description: 'The Sea Serpent - largest constellation in the sky',
        mainStars: ['Alphard', 'Gamma Hya', 'Zeta Hya', 'Epsilon Hya'],
        mythology: 'The multi-headed Hydra slain by Hercules as one of his twelve labors. The largest constellation, stretching over 100 degrees across the sky. Alphard means "the solitary one" - it stands alone in an empty region of sky.'
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
