/* -----------------------------------------------------------
   RACES + SIMPLE SELECTION LOGIC
----------------------------------------------------------- */

const RACES = [
  // Base Game
  { id: "terran", name: "Terran Federation", glyph: "assets/glyphs/terran.png" },
  { id: "planta", name: "Planta", glyph: "assets/glyphs/planta.png" },
  { id: "hydran", name: "Hydran Progress", glyph: "assets/glyphs/hydran.png" },
  { id: "orion", name: "Orion Hegemony", glyph: "assets/glyphs/orion.png" },
  { id: "mechanema", name: "Mechanema", glyph: "assets/glyphs/mechanema.png" },
  { id: "exiles", name: "The Exiles", glyph: "assets/glyphs/exiles.png" },
  { id: "magellan", name: "Wardens of Magellan", glyph: "assets/glyphs/magellan.png" },
  { id: "rhoindi", name: "Rho Indi Syndicate", glyph: "assets/glyphs/rhoindi.png" },
  { id: "draco", name: "Descentdants of Draco", glyph: "assets/glyphs/draco.png" },
  { id: "eridani", name: "Eridani Empire", glyph: "assets/glyphs/eridani.png" },
  { id: "lyra", name: "Enlightened of Lyra", glyph: "assets/glyphs/lyra.png" },
  
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

