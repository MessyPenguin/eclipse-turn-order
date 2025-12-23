/* -----------------------------------------------------------
   CORE GAME STATE
   - Players
   - Pass order
   - Turn tracking
   - Eclipse-style "pass determines next round order"
----------------------------------------------------------- */

let players = [];       // [{ name, raceId }]
let passedOrder = [];   // [playerName, ...] in the order they passed
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
    if (typeof syncToFirebase === "function") syncToFirebase();
}

/** Update a player's name. */
function setPlayerName(index, name) {
    if (!players[index]) {
        players[index] = { name: "", raceId: null };
    }
    players[index].name = name.trim();
    if (typeof syncToFirebase === "function") syncToFirebase();
}

/** Update a player's race ID. */
function setPlayerRace(index, raceId) {
    if (!players[index]) {
        players[index] = { name: "", raceId: null };
    }
    players[index].raceId = raceId;
    if (typeof syncToFirebase === "function") syncToFirebase();
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

/** Randomise player order for a new round, keeping only filled players. */
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

    if (typeof syncToFirebase === "function") syncToFirebase();
}

/**
 * Mark given player (by index) as passed if not already.
 * When all players have passed, reorder players based on pass order
 * and reset for the next round.
 */
function markPassedByIndex(index) {
    const player = players[index];
    if (!player) return;

    if (!passedOrder.includes(player.name)) {
        passedOrder.push(player.name);
        lastPassed = player.name;
        turn++;

        if (allPlayersPassed()) {
            // Everyone has passed → finish round and generate next order
            finishRoundAndReorder();
        } else {
            if (typeof syncToFirebase === "function") syncToFirebase();
        }
    }
}

/**
 * Undo last pass (only meaningful before the round finishes).
 * Once everyone has passed and the next order is generated,
 * passes are cleared and undo no longer affects the previous round.
 */
function undoLastPass() {
    if (passedOrder.length === 0) return;
    const popped = passedOrder.pop();
    lastPassed = popped || null;
    if (turn > 1) turn--;
    if (typeof syncToFirebase === "function") syncToFirebase();
}

/**
 * Finish the current round and generate the next round order based
 * on the order in which players passed.
 *
 * Eclipse logic:
 * - First player to pass becomes first player next round
 * - Last player to pass becomes last player next round
 */
function finishRoundAndReorder() {
    const active = getActivePlayers();
    if (active.length === 0) return;

    // Build new order based on pass order
    const newActiveOrder = passedOrder
        .map(name => active.find(p => p.name === name))
        .filter(Boolean);

    // If mismatch, fall back to active list
    if (newActiveOrder.length !== active.length) {
        newActiveOrder = active;
    }

    // Rebuild full players array:
    // - Keep empty slots in place
    // - Replace active players in order
    let activeIndex = 0;
    players = players.map(p => {
        if (p.name && p.raceId) {
            return newActiveOrder[activeIndex++];
        }
        return p; // keep empty slot
    });

    // Reset round state
    passedOrder = [];
    lastPassed = null;
    turn = 1;

    if (typeof syncToFirebase === "function") syncToFirebase();
}


