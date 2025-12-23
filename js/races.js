/* -----------------------------------------------------------
   RACE DATA + MODAL
   All Eclipse: Second Dawn races (base + expansion)
----------------------------------------------------------- */

const RACES = [
    // Base game
    {
        id: "terran",
        name: "Terran Federation",
        description: "Balanced, flexible, straightforward.",
        colorClass: "faction-terran",
        glyph: "assets/glyphs/terran.png"
    },
    {
        id: "eridani",
        name: "Eridani Empire",
        description: "Aggressive, resource-poor start, strong economy later.",
        colorClass: "faction-eridani",
        glyph: "assets/glyphs/eridani.png"
    },
    {
        id: "hydran",
        name: "Hydran Progress",
        description: "Science-focused, tech acceleration.",
        colorClass: "faction-hydran",
        glyph: "assets/glyphs/hydran.png"
    },
    {
        id: "planta",
        name: "Planta",
        description: "Growth, influence, map control.",
        colorClass: "faction-planta",
        glyph: "assets/glyphs/planta.png"
    },
    {
        id: "orion",
        name: "Orion Hegemony",
        description: "Combat specialists, strong early military.",
        colorClass: "faction-orion",
        glyph: "assets/glyphs/orion.png"
    },
    {
        id: "mechanema",
        name: "Mechanema",
        description: "Efficient, low upkeep, strong economy.",
        colorClass: "faction-mechanema",
        glyph: "assets/glyphs/mechanema.png"
    },
    {
        id: "exiles",
        name: "Exiles",
        description: "Mobile, flexible, strong repositioning.",
        colorClass: "faction-exiles",
        glyph: "assets/glyphs/exiles.png"
    },
    {
        id: "rhoindi",
        name: "Rho Indi Syndicate",
        description: "Trade-focused, economic manipulation.",
        colorClass: "faction-rhoindi",
        glyph: "assets/glyphs/rhoindi.png"
    },

    // Expansion: Rise of the Ancients
    {
        id: "magellan",
        name: "Magellan",
        description: "Exploration specialists, map manipulation.",
        colorClass: "faction-magellan",
        glyph: "assets/glyphs/magellan.png"
    },
    {
        id: "wardens",
        name: "Wardens of Magellan",
        description: "Defensive, influence-based control.",
        colorClass: "faction-wardens",
        glyph: "assets/glyphs/wardens.png"
    },
    {
        id: "enclave",
        name: "Enclave of the Ancients",
        description: "Ancient tech mastery, unique upgrades.",
        colorClass: "faction-enclave",
        glyph: "assets/glyphs/enclave.png"
    },
    {
        id: "shapers",
        name: "Shapers of Draconis",
        description: "Terraforming, map shaping, influence tricks.",
        colorClass: "faction-shapers",
        glyph: "assets/glyphs/shapers.png"
    }
];

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */

function findRaceById(id) {
    return RACES.find(r => r.id === id) || null;
}

function getNextRaceId(currentId) {
    if (!currentId) return RACES[0].id;
    const idx = RACES.findIndex(r => r.id === currentId);
    if (idx === -1 || idx === RACES.length - 1) return RACES[0].id;
    return RACES[idx + 1].id;
}
