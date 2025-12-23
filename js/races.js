/* -----------------------------------------------------------
   RACES + SIMPLE SELECTION LOGIC
----------------------------------------------------------- */

cconst RACES = [
  // Base Game
  { id: "terran", name: "Terran Federation", glyph: "assets/glyphs/terran.png" },
  { id: "planta", name: "Planta", glyph: "assets/glyphs/planta.png" },
  { id: "hydran", name: "Hydran Progress", glyph: "assets/glyphs/hydran.png" },
  { id: "orion", name: "Orion Hegemony", glyph: "assets/glyphs/orion.png" },
  { id: "mechanema", name: "Mechanema", glyph: "assets/glyphs/mechanema.png" },
  { id: "exiles", name: "Exiles", glyph: "assets/glyphs/exiles.png" },
  { id: "magellan", name: "Magellan", glyph: "assets/glyphs/magellan.png" },
  { id: "rhoindi", name: "Rho Indi Syndicate", glyph: "assets/glyphs/rhoindi.png" },
  { id: "enclave", name: "Enclave of the Void", glyph: "assets/glyphs/enclave.png" },
  { id: "wardens", name: "Wardens of the Council", glyph: "assets/glyphs/wardens.png" },

  // Expansion Factions
  { id: "shapers", name: "Shapers of the Void", glyph: "assets/glyphs/shapers.png" },
  { id: "lyra", name: "Enlightened of Lyra", glyph: "assets/glyphs/lyra.png" },
  { id: "keepers", name: "Keepers of the Gate", glyph: "assets/glyphs/keepers.png" },
  { id: "architects", name: "The Architects", glyph: "assets/glyphs/architects.png" },
  { id: "riftborn", name: "The Riftborn", glyph: "assets/glyphs/riftborn.png" }
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

