/* -----------------------------------------------------------
   CORE GAME STATE
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
    if (typeof syncToFirebase === "function") syncToFirebase();
}

/** Update a player's name, creating player object if needed. */
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

/** Randomise player order for a new round, but keep names + races. */
function randomisePlayerOrder() {
    const filled = players.filter(p => p.name.trim() !== "" && p.raceId);
    for (let i = filled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filled[i], filled[j]] = [filled[j], filled[i]];
    }
    players = filled;
    passedOrder = [];
    lastPassed = null;
    turn = 1;
    if (typeof syncToFirebase === "function") syncToFirebase();
}

/** Mark given player (by index) as passed if not already. */
function markPassedByIndex(index) {
    const player = players[index];
    if (!player) return;
    if (!passedOrder.includes(player.name)) {
        passedOrder.push(player.name);
        lastPassed = player.name;
        turn++;
        if (typeof syncToFirebase === "function") syncToFirebase();
    }
}

/** Undo last pass. */
function undoLastPass() {
    if (passedOrder.length === 0) return;
    const popped = passedOrder.pop();
    lastPassed = popped || null;
    if (turn > 1) turn--;
    if (typeof syncToFirebase === "function") syncToFirebase();
}

function allPlayersPassed() {
    const active = players.filter(p => p.name && p.raceId);
    return active.length > 0 && passedOrder.length >= active.length;
}
