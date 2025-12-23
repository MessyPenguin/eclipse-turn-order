/* -----------------------------------------------------------
   CORE GAME STATE (LOCAL ONLY, CLEAN + CORRECT)
----------------------------------------------------------- */

let players = [];       // [{ name, raceId }]
let passedOrder = [];   // [playerName, ...]
let turn = 1;

/* ------------------ PLAYER SETUP ------------------ */

function setPlayerCount(count) {
    const n = parseInt(count, 10) || 0;

    // Grow or shrink players array
    if (n < players.length) {
        players = players.slice(0, n);
    } else {
        while (players.length < n) {
            players.push({ name: "", raceId: null });
        }
    }

    resetRoundState();
}

function setPlayerName(index, name) {
    players[index].name = name.trim();
}

function setPlayerRace(index, raceId) {
    const current = players[index].raceId;

    // Free old race
    if (current) {
        usedRaces.delete(current);
    }

    // Assign new race
    players[index].raceId = raceId;

    // Lock new race
    usedRaces.add(raceId);
}

/* ------------------ RACE LOCKING ------------------ */

const usedRaces = new Set();

function isRaceAvailable(raceId) {
    return !usedRaces.has(raceId);
}

/* ------------------ ACTIVE PLAYERS ------------------ */

function getActivePlayers() {
    return players.filter(p => p.name && p.raceId);
}

function allPlayersPassed() {
    const active = getActivePlayers();
    return active.length > 0 && passedOrder.length === active.length;
}

/* ------------------ ROUND LOGIC ------------------ */

function resetRoundState() {
    passedOrder = [];
    turn = 1;
}

function randomisePlayerOrder() {
    const active = getActivePlayers();

    // Shuffle active players
    for (let i = active.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [active[i], active[j]] = [active[j], active[i]];
    }

    // Reinsert into full players array
    let idx = 0;
    players = players.map(p => {
        if (p.name && p.raceId) {
            return active[idx++];
        }
        return p;
    });

    resetRoundState();
}

/* ------------------ PASSING ------------------ */

function markPassedByIndex(index) {
    const p = players[index];
    if (!p || !p.name || !p.raceId) return;

    if (!passedOrder.includes(p.name)) {
        passedOrder.push(p.name);
        turn++;

        if (allPlayersPassed()) {
            finishRoundAndReorder();
        }
    }
}

function undoLastPass() {
    if (passedOrder.length === 0) return;
    passedOrder.pop();
    turn = Math.max(1, turn - 1);
}

/* ------------------ ROUND END ------------------ */

function finishRoundAndReorder() {
    const active = getActivePlayers();

    // Build new order based on pass order
    const newOrder = passedOrder.map(name =>
        active.find(p => p.name === name)
    );

    // Reinsert into full players array
    let idx = 0;
    players = players.map(p => {
        if (p.name && p.raceId) {
            return newOrder[idx++];
        }
        return p;
    });

    resetRoundState();
}
