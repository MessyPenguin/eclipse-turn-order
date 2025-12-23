/* -----------------------------------------------------------
   UI RENDERING + DOM BINDING
----------------------------------------------------------- */

let playerCountSelect;
let playerRowsContainer;
let startRoundBtn;
let quickSetupBtn;
let orderListEl;
let hintTextEl;
let turnDisplayEl;
let undoBtnEl;

function cacheDom() {
    playerCountSelect   = document.getElementById("playerCount");
    playerRowsContainer = document.getElementById("playerRows");
    startRoundBtn       = document.getElementById("startRoundBtn");
    quickSetupBtn       = document.getElementById("quickSetupBtn");
    orderListEl         = document.getElementById("orderList");
    hintTextEl          = document.getElementById("hintText");
    turnDisplayEl       = document.getElementById("turnDisplay");
    undoBtnEl           = document.getElementById("undoBtn");
}

function bindUiEvents() {
    playerCountSelect.addEventListener("change", () => {
        setPlayerCount(playerCountSelect.value);
        renderSetupFromState();
        renderOrderFromState();
    });

    startRoundBtn.addEventListener("click", () => {
        randomisePlayerOrder();
        renderSetupFromState();
        renderOrderFromState();
        hintTextEl.textContent = "Tap a player when they have taken their turn.";
        playBeep("shuffle");
    });

    quickSetupBtn.addEventListener("click", () => {
        quickSetup();
        renderSetupFromState();
        renderOrderFromState();
        playBeep("tap");
    });

    undoBtnEl.addEventListener("click", () => {
        undoLastPass();
        renderOrderFromState();
        updateUndoVisibility();
        hintTextEl.textContent = allPlayersPassed()
            ? "Round complete."
            : "Tap a player when they have taken their turn.";
        playBeep("tap");
    });
}

/** Set up a simple quick-setup: generic names + sequential races */
function quickSetup() {
    const count = parseInt(playerCountSelect.value, 10) || 4;
    setPlayerCount(count);
    for (let i = 0; i < count; i++) {
        const name = `Player ${i + 1}`;
        const raceId = RACES[i % RACES.length].id;
        setPlayerName(i, name);
        setPlayerRace(i, raceId);
    }
}

/** Render setup rows from players state. */
function renderSetupFromState() {
    const count = parseInt(playerCountSelect.value, 10) || 4;
    setPlayerCount(count); // ensure players length matches count

    playerRowsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const p = players[i] || { name: "", raceId: null };

        const row = document.createElement("div");
        row.className = "player-row";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = `Player ${i + 1}`;
        nameInput.value = p.name || "";
        nameInput.addEventListener("input", (e) => {
            setPlayerName(i, e.target.value);
        });

        const raceBtn = document.createElement("button");
        const race = p.raceId ? findRaceById(p.raceId) : null;
        const raceId = race ? race.id : null;
        const raceName = race ? race.name : "Pick race";
        const colorClass = race ? race.colorClass : "faction-generic";
        raceBtn.className = `race-chip ${colorClass}`;
        raceBtn.innerHTML = `
            <span class="race-dot"></span>
            <span>${raceName}</span>
        `;
        raceBtn.addEventListener("click", () => {
            const nextId = getNextRaceId(p.raceId);
            setPlayerRace(i, nextId);
            renderSetupFromState();
            renderOrderFromState();
        });

        row.appendChild(nameInput);
        row.appendChild(raceBtn);
        playerRowsContainer.appendChild(row);
    }
}

function updateTurnDisplay() {
    turnDisplayEl.textContent = `Turn: ${turn}`;
}

function renderOrderFromState() {
    orderListEl.innerHTML = "";

    const activePlayers = players
        .map((p, idx) => ({ ...p, index: idx }))
        .filter(p => p.name && p.raceId);

    activePlayers.forEach(p => {
        const li = document.createElement("li");
        const race = findRaceById(p.raceId);
        const colorClass = race ? race.colorClass : "faction-generic";
        li.className = `order-item ${colorClass}`;

        if (passedOrder.includes(p.name)) {
            li.classList.add("passed");
        }

        li.innerHTML = `
            <div class="order-item-main">
                <span class="order-name">${p.name}</span>
                <span class="order-race">${race ? race.name : ""}</span>
            </div>
            <span class="order-status">${
                passedOrder.includes(p.name) ? "Passed" : "Tap when done"
            }</span>
        `;

        li.addEventListener("click", () => {
            if (!passedOrder.includes(p.name)) {
                markPassedByIndex(p.index);
                renderOrderFromState();
                updateTurnDisplay();
                updateUndoVisibility();
                hintTextEl.textContent = allPlayersPassed()
                    ? "Round complete."
                    : "Tap a player when they have taken their turn.";
                playBeep("tap");
            }
        });

        orderListEl.appendChild(li);
    });

    updateTurnDisplay();
    updateUndoVisibility();
}

function updateUndoVisibility() {
    undoBtnEl.style.display = passedOrder.length > 0 ? "inline-flex" : "none";
}
