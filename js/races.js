/* -----------------------------------------------------------
   RACE DATA + MODAL
----------------------------------------------------------- */

const RACES = [
    {
        id: "terran",
        name: "Terran",
        description: "Balanced, flexible, straightforward.",
        colorClass: "faction-terran",
        glyph: "assets/glyphs/terran.png"
    },
    {
        id: "planta",
        name: "Planta",
        description: "Growth, influence, map control.",
        colorClass: "faction-planta",
        glyph: "assets/glyphs/planta.png"
    }
    // You can add more races here later
];

function findRaceById(id) {
    return RACES.find(r => r.id === id) || null;
}

function getNextRaceId(currentId) {
    if (!currentId) return RACES[0].id;
    const idx = RACES.findIndex(r => r.id === currentId);
    if (idx === -1 || idx === RACES.length - 1) return RACES[0].id;
    return RACES[idx + 1].id;
}
