/* -----------------------------------------------------------
   RACES + SIMPLE SELECTION LOGIC
----------------------------------------------------------- */

const RACES = [
    { id: "terran",   name: "Terran",   colorClass: "faction-terran" },
    { id: "eridani",  name: "Eridani",  colorClass: "faction-eridani" },
    { id: "planta",   name: "Planta",   colorClass: "faction-planta" },
    { id: "hydran",   name: "Hydran",   colorClass: "faction-hydran" }
];

function findRaceById(id) {
    return RACES.find(r => r.id === id) || null;
}

/** Cycle through races when the race chip is clicked. */
function getNextRaceId(currentId) {
    if (!currentId) return RACES[0].id;
    const idx = RACES.findIndex(r => r.id === currentId);
    if (idx === -1 || idx === RACES.length - 1) return RACES[0].id;
    return RACES[idx + 1].id;
}
