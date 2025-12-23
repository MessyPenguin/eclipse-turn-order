/* -----------------------------------------------------------
   CORE GAME STATE (LOCAL ONLY)
----------------------------------------------------------- */

let players = [];       // [{ name, raceId }]
let passedOrder = [];   // [playerName, ...]
let lastPassed = null;
let turn = 1;

/** Ensure players array has at least count items (fill with blanks). */
function setPlayerCount(count) {
    const n = parseInt(count, 10) || 0;
    if (n < players.length) {
        players = players.slice(0, n);
    } else {
        while (players.length < n) {
            players.push({ name: "", raceId: null });
        }
    }
    passedOrder = [];
    lastPassed = null;
    turn = 1;
}

/** Update a player's name. */
function setPlayerName(index, name) {
    if (!players[index]) {
        players[index] = { name: "", raceId: null };
    }
    players[index].name = name.trim();
}

/** Update a player's race ID. */
function setPlayerRace(index, raceId) {
    if (!players[index]) {
        players[index] = { name: "", raceId: null };
    }
    players[index].raceId = raceId;
}

/** Active = players that actually have a name + race. */
function getActivePlayers() {
    return players.filter(p => p.name && p.raceId);
}

/** Have all active players passed? */
function allPlayersPassed() {
    const active = getActivePlayers();
    return active.length > 0 && passedOrder.length >= active.length;
}

/** Randomise player order for a new round, keeping empty slots intact. */
function randomisePlayerOrder() {
    const active = getActivePlayers();

    // Shuffle active players
    for (let i = active.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [active[i], active[j]] = [active[j], active[i]];
    }

    // Rebuild full players array
    let activeIndex = 0;
    players = players.map(p => {
        if (p.name && p.raceId) {
            return active[activeIndex++];
        }
        return p;
    });

    passedOrder = [];
    lastPassed = null;
    turn = 1;
}

/**
 * Mark given player (by index) as passed.
 * When all players have passed, reorder players based on pass order.
 */
function markPassedByIndex(index) {
    const player = players[index];
    if (!player) return;

    if (!passedOrder.includes(player.name)) {
        passedOrder.push(player.name);
        lastPassed = player.name;
        turn++;

        if (allPlayersPassed()) {
            finishRoundAndReorder();
        }
    }
}

/** Undo last pass (only before round finishes). */
function undoLastPass() {
    if (passedOrder.length === 0) return;
    const popped = passedOrder.pop();
    lastPassed = popped || null;
    if (turn > 1) turn--;
}

/**
 * Finish the current round and generate the next round order
 * based on the order in which players passed.
 */
function finishRoundAndReorder() {
    const active = getActivePlayers();
    if (active.length === 0) return;

    let newActiveOrder = passedOrder
        .map(name => active.find(p => p.name === name))
        .filter(Boolean);

    if (newActiveOrder.length !== active.length) {
        newActiveOrder = active;
    }

    let activeIndex = 0;
    players = players.map(p => {
        if (p.name && p.raceId) {
            return newActiveOrder[activeIndex++];
        }
        return p;
    });

    passedOrder = [];
    lastPassed = null;
    turn = 1;
}
