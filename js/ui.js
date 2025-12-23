/* -----------------------------------------------------------
   UI RENDERING + DOM BINDING (LOCAL ONLY)
----------------------------------------------------------- */

let playerCountSelect;
let playerRowsContainer;
let startRoundBtn;
let quickSetupBtn;
let orderListEl;
let hintTextEl;
let turnDisplayEl;
let undoBtnEl;
let setupBodyEl;
let toggleSetupBtnEl;
let toggleSetupIconEl;
let setupSummaryEl;

// Race modal
let raceModalBackdropEl;
let raceModalEl;
let raceGridEl;
let closeRaceModalBtnEl;
let raceModalCurrentIndex = null;

function cacheDom() {
    playerCountSelect   = document.getElementById("playerCount");
    playerRowsContainer = document.getElementById("playerRows");
    startRoundBtn       = document.getElementById("startRoundBtn");
    quickSetupBtn       = document.getElementById("quickSetupBtn");
    orderListEl         = document.getElementById("orderList");
    hintTextEl          = document.getElementById("hintText");
    turnDisplayEl       = document.getElementById("turnDisplay");
    undoBtnEl           = document.getElementById("undoBtn");
    setupBodyEl         = document.getElementById("setupBody");
    toggleSetupBtnEl    = document.getElementById("toggleSetupBtn");
    toggleSetupIconEl   = document.getElementById("toggleSetupIcon");
    setupSummaryEl      = document.getElementById("setupSummary");

    raceModalBackdropEl = document.getElementById("raceModalBackdrop");
    raceModalEl         = document.getElementById("raceModal");
    raceGridEl          = document.getElementById("raceGrid");
    closeRaceModalBtnEl = document.getElementById("closeRaceModalBtn");
}

function bindUiEvents() {
    playerCountSelect.addEventListener("change", () => {
        setPlayerCount(playerCountSelect.value);
        renderSetupFromState();
        renderOrderFromState();
        updateSetupSummary();
    });

    startRoundBtn.addEventListener("click", () => {
        randomisePlayerOrder();
        renderSetupFromState();
        renderOrderFromState();
        hintTextEl.textContent = "Tap a player when they have taken their turn.";
        playBeep("shuffle");
        collapseSetupPanel();
        updateSetupSummary();
    });

    quickSetupBtn.addEventListener("click", () => {
        quickSetup();
        renderSetupFromState();
        renderOrderFromState();
        playBeep("tap");
        updateSetupSummary();
    });

    undoBtnEl.addEventListener("click", () => {
        undoLastPass();
        renderOrderFromState();
        updateUndoVisibility();

        hintTextEl.textContent = allPlayersPassed()
            ? "Round complete. New order generated."
            : "Tap a player when they have taken their turn.";

        playBeep("tap");
    });

    toggleSetupBtnEl.addEventListener("click", () => {
        const isCollapsed = setupBodyEl.classList.toggle("collapsed");
        toggleSetupBtnEl.setAttribute("aria-expanded", String(!isCollapsed));
        toggleSetupIconEl.textContent = isCollapsed ? "▸" : "▾";
    });

    closeRaceModalBtnEl.addEventListener("click", closeRaceModal);
    raceModalBackdropEl.addEventListener("click", (e) => {
        if (e.target === raceModalBackdropEl || e.target.dataset.closeModal === "race") {
            closeRaceModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && raceModalBackdropEl.classList.contains("visible")) {
            closeRaceModal();
        }
    });
}

/* --------------------- QUICK SETUP ------------------------ */

function quickSetup() {
    const count = parseInt(playerCountSelect.value, 10) || 4;
    setPlayerCount(count);
    usedRaces.clear();

    for (let i = 0; i < count; i++) {
        const name = `Player ${i + 1}`;
        const raceId = RACES[i % RACES.length].id;

        setPlayerName(i, name);
        setPlayerRace(i, raceId);
    }
}

/* --------------------- SETUP PANEL ------------------------ */

function renderSetupFromState() {
    const count = parseInt(playerCountSelect.value, 10) || 4;
    setPlayerCount(count);

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
            updateSetupSummary();
        });

        const raceBtn = document.createElement("button");
        const race = p.raceId ? findRaceById(p.raceId) : null;
        const raceName = race ? race.name : "Select race";
        const colorClass = race ? race.colorClass : "faction-generic";
        const glyphPath = race ? race.glyph : null;

        raceBtn.className = `race-chip ${colorClass}`;

        const glyphHtml = glyphPath
            ? `
                <div class="race-chip-glyph">
                    <img src="${glyphPath}" alt=""
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'race-chip-dot\'></span>';">
                </div>
              `
            : `<span class="race-chip-dot"></span>`;

        raceBtn.innerHTML = `
            <div class="race-chip-inner">
                ${glyphHtml}
                <span>${raceName}</span>
            </div>
        `;

        raceBtn.addEventListener("click", () => {
            openRaceModalForPlayer(i);
        });

        row.appendChild(nameInput);
        row.appendChild(raceBtn);
        playerRowsContainer.appendChild(row);
    }

    updateSetupSummary();
}

function updateSetupSummary() {
    const active = players.filter(p => p.name && p.raceId);
    const count = active.length;
    setupSummaryEl.textContent =
        count === 0 ? "No players yet" :
        count === 1 ? "1 player configured" :
        `${count} players configured`;
}

/* --------------------- ORDER LIST ------------------------ */

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

        const passIndex = passedOrder.indexOf(p.name);
        const hasPassed = passIndex !== -1;

        const passLabel = hasPassed
            ? `Passed ${ordinal(passIndex + 1)}`
            : "Tap when done";

        if (hasPassed) li.classList.add("passed");

        li.innerHTML = `
            <div class="order-item-main">
                <span class="order-name">${p.name}</span>
                <span class="order-race">${race ? race.name : ""}</span>
            </div>
            <span class="order-status">${passLabel}</span>
        `;

        li.addEventListener("click", () => {
            const wasCompleteBefore = allPlayersPassed();
            markPassedByIndex(p.index);

            renderOrderFromState();
            updateTurnDisplay();
            updateUndoVisibility();

            if (allPlayersPassed() && !wasCompleteBefore) {
                hintTextEl.textContent = "Round complete. New order generated.";
                playBeep("shuffle");
            } else if (!allPlayersPassed()) {
                hintTextEl.textContent = "Tap a player when they have taken their turn.";
                playBeep("tap");
            }
        });

        orderListEl.appendChild(li);
    });

    updateTurnDisplay();
    updateUndoVisibility();
}

function ordinal(n) {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
}

function updateUndoVisibility() {
    undoBtnEl.style.display = passedOrder.length > 0 ? "inline-flex" : "none";
}

/* --------------------- SETUP PANEL COLLAPSE ------------------------ */

function collapseSetupPanel() {
    setupBodyEl.classList.add("collapsed");
    toggleSetupBtnEl.setAttribute("aria-expanded", "false");
    toggleSetupIconEl.textContent = "▸";
}

function expandSetupPanel() {
    setupBodyEl.classList.remove("collapsed");
    toggleSetupBtnEl.setAttribute("aria-expanded", "true");
    toggleSetupIconEl.textContent = "▾";
}

/* --------------------- RACE MODAL ------------------------ */

function openRaceModalForPlayer(playerIndex) {
    raceModalCurrentIndex = playerIndex;
    populateRaceGrid();
    raceModalBackdropEl.classList.add("visible");
}

function closeRaceModal() {
    raceModalBackdropEl.classList.remove("visible");
    raceModalCurrentIndex = null;
}

function populateRaceGrid() {
    raceGridEl.innerHTML = "";

    RACES.forEach(race => {
        const taken = !isRaceAvailable(race.id);
        const card = document.createElement("button");
        card.type = "button";
        card.className = `race-card ${race.colorClass}`;
        card.disabled = taken;

        const status = taken ? `<div class="race-card-meta">Taken</div>` : "";

        card.innerHTML = `
            <div class="race-card-main">
                <div class="race-card-glyph">
                    <img src="${race.glyph}" alt="${race.name} glyph"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'race-chip-dot\'></span>';">
                </div>
                <div>
                    <div class="race-card-name">${race.name}</div>
                    ${status}
                </div>
            </div>
        `;

        if (!taken) {
            card.addEventListener("click", () => {
                if (raceModalCurrentIndex != null) {
                    setPlayerRace(raceModalCurrentIndex, race.id);
                    renderSetupFromState();
                    renderOrderFromState();
                    playBeep("tap");
                }
                closeRaceModal();
            });
        }

        raceGridEl.appendChild(card);
    });
}
