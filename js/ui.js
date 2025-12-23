// DOM elements
const startGameBtn = document.getElementById("startGameBtn");
const setupPanel = document.getElementById("setupPanel");
const playerList = document.getElementById("playerList");
const raceChipContainer = document.getElementById("raceChipContainer");
const orderList = document.getElementById("orderList");
const turnDisplay = document.getElementById("turnDisplay");
const hintText = document.getElementById("hintText");

// Example races
const RACES = [
    { id: "terran", name: "Terran" },
    { id: "planta", name: "Planta" },
    { id: "hydran", name: "Hydran" },
    { id: "orion", name: "Orion" },
    { id: "mechanema", name: "Mechanema" },
    { id: "exiles", name: "Exiles" },
    { id: "magellan", name: "Magellan" }
];

// State
let players = [];

// Add player
document.getElementById("addPlayerBtn").addEventListener("click", () => {
    players.push({ name: "", race: null, passed: false });
    renderPlayers();
});

// Render players
function renderPlayers() {
    playerList.innerHTML = "";

    players.forEach((p, i) => {
        const row = document.createElement("div");
        row.className = "player-row";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Player ${i + 1}`;
        input.value = p.name;
        input.addEventListener("input", () => {
            p.name = input.value;
        });

        const raceBtn = document.createElement("button");
        raceBtn.textContent = p.race ? p.race.name : "Choose Race";
        raceBtn.addEventListener("click", () => openRaceModal(i));

        row.appendChild(input);
        row.appendChild(raceBtn);
        playerList.appendChild(row);
    });

    updateSetupSummary();
}

// Setup summary
function updateSetupSummary() {
    const summary = document.getElementById("setupSummary");
    summary.textContent = `${players.length} players configured`;
}

// Race modal
const raceModalBackdrop = document.getElementById("raceModalBackdrop");
const raceGrid = document.getElementById("raceGrid");
let raceSelectIndex = null;

function openRaceModal(index) {
    raceSelectIndex = index;
    raceGrid.innerHTML = "";

    RACES.forEach(r => {
        const card = document.createElement("div");
        card.className = "race-card";
        card.innerHTML = `
            <div class="race-card-main">
                <div class="race-card-glyph"></div>
                <div class="race-card-name">${r.name}</div>
            </div>
        `;
        card.addEventListener("click", () => {
            players[index].race = r;
            raceModalBackdrop.classList.remove("visible");
            renderPlayers();
        });
        raceGrid.appendChild(card);
    });

    raceModalBackdrop.classList.add("visible");
}

document.getElementById("closeRaceModalBtn").addEventListener("click", () => {
    raceModalBackdrop.classList.remove("visible");
});

// Start Game
startGameBtn.addEventListener("click", () => {
    if (players.length === 0) return;

    document.body.classList.add("game-started");

    randomiseOrder();
    renderOrderList();

    turnDisplay.textContent = "Round 1";
    hintText.textContent = "Tap a player when they have taken their turn.";
});

// Randomise order
function randomiseOrder() {
    players = players
        .map(p => ({ ...p, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(p => ({ name: p.name, race: p.race, passed: false }));
}

// Render order list
function renderOrderList() {
    orderList.innerHTML = "";

    players.forEach((p, i) => {
        const li = document.createElement("li");
        li.className = "order-item";

        li.innerHTML = `
            <div class="order-item-main">
                <div class="order-name">${p.name}</div>
                <div class="order-race">${p.race ? p.race.name : ""}</div>
            </div>
            <div class="order-status">${p.passed ? "Passed" : "Active"}</div>
        `;

        li.addEventListener("click", () => {
            p.passed = !p.passed;
            renderOrderList();
        });

        orderList.appendChild(li);
    });
}
