// ---- RACES (add your real glyph paths here) ----
const RACES = [
  { id: "terran", name: "Terran", glyph: "assets/glyphs/terran.png" },
  { id: "planta", name: "Planta", glyph: "assets/glyphs/planta.png" },
  { id: "hydran", name: "Hydran", glyph: "assets/glyphs/hydran.png" },
  { id: "orion", name: "Orion", glyph: "assets/glyphs/orion.png" },
  { id: "mechanema", name: "Mechanema", glyph: "assets/glyphs/mechanema.png" },
  { id: "exiles", name: "Exiles", glyph: "assets/glyphs/exiles.png" },
  { id: "magellan", name: "Magellan", glyph: "assets/glyphs/magellan.png" }
];

// ---- DOM ----
const playerCountSelect = document.getElementById("playerCountSelect");
const startGameBtn = document.getElementById("startGameBtn");
const playerListEl = document.getElementById("playerList");
const setupSummaryEl = document.getElementById("setupSummary");

const gamePanelEl = document.getElementById("gamePanel");
const turnDisplayEl = document.getElementById("turnDisplay");
const hintTextEl = document.getElementById("hintText");
const orderListEl = document.getElementById("orderList");
const undoBtn = document.getElementById("undoBtn");

const raceModalBackdrop = document.getElementById("raceModalBackdrop");
const raceGridEl = document.getElementById("raceGrid");
const closeRaceModalBtn = document.getElementById("closeRaceModalBtn");

// ---- STATE ----
let players = [];
let roundNumber = 1;
let passOrder = 0;
let lastPassedPlayerId = null;
let raceSelectPlayerIndex = null;

// ---- INIT ----
window.addEventListener("DOMContentLoaded", init);


function init() {
  const defaultCount = parseInt(playerCountSelect.value, 10) || 4;
  createPlayers(defaultCount);
  renderSetupPlayers();
  updateSetupSummary();
  hookEvents();
  // Game panel hidden until game-started; but we pre-render empty state
  renderGamePanel();
}

function hookEvents() {
  playerCountSelect.addEventListener("change", onPlayerCountChange);
  startGameBtn.addEventListener("click", onStartGame);
  undoBtn.addEventListener("click", onUndoLastPass);
  closeRaceModalBtn.addEventListener("click", closeRaceModal);
  raceModalBackdrop.addEventListener("click", (e) => {
    if (e.target === raceModalBackdrop) {
      closeRaceModal();
    }
  });
}

// ---- Player count / setup ----

function onPlayerCountChange() {
  const count = parseInt(playerCountSelect.value, 10);
  resizePlayers(count);
  renderSetupPlayers();
  updateSetupSummary();
}

function createPlayers(count) {
  players = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: cryptoRandomId(),
      name: `Player ${i + 1}`,
      raceId: null,
      raceName: "",
      glyph: "",
      passed: false,
      passPosition: null
    });
  }
}

function resizePlayers(count) {
  const current = players.length;
  if (count > current) {
    for (let i = current; i < count; i++) {
      players.push({
        id: cryptoRandomId(),
        name: `Player ${i + 1}`,
        raceId: null,
        raceName: "",
        glyph: "",
        passed: false,
        passPosition: null
      });
    }
  } else if (count < current) {
    players = players.slice(0, count);
  }
}

// ---- Setup rendering ----

function renderSetupPlayers() {
  playerListEl.innerHTML = "";

  players.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "player-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = `Player ${idx + 1}`;
    nameInput.value = p.name;
    nameInput.addEventListener("input", () => {
      p.name = nameInput.value;
      updateSetupSummary();
    });

    const chooseRaceBtn = document.createElement("button");
    chooseRaceBtn.type = "button";

    const raceSummary = document.createElement("div");
    raceSummary.className = "player-race-summary";

    const glyphDiv = document.createElement("div");
    glyphDiv.className = "player-race-glyph";
    if (p.glyph) {
      const img = document.createElement("img");
      img.src = p.glyph;
      img.alt = p.raceName || "Race glyph";
      glyphDiv.appendChild(img);
    }

    const raceNameSpan = document.createElement("span");
    raceNameSpan.className = "player-race-name";
    raceNameSpan.textContent = p.raceName || "Choose Race";

    raceSummary.appendChild(glyphDiv);
    raceSummary.appendChild(raceNameSpan);
    chooseRaceBtn.appendChild(raceSummary);

    chooseRaceBtn.addEventListener("click", () => openRaceModal(idx));

    row.appendChild(nameInput);
    row.appendChild(chooseRaceBtn);

    playerListEl.appendChild(row);
  });
}

function updateSetupSummary() {
  const count = players.length;
  const namedCount = players.filter(p => p.name && p.name.trim().length > 0).length;
  const raceChosenCount = players.filter(p => p.raceId !== null).length;

  setupSummaryEl.textContent =
    `${count} players configured — ` +
    `${namedCount}/${count} named, ` +
    `${raceChosenCount}/${count} races chosen`;
}

// ---- Race modal ----

function openRaceModal(playerIndex) {
  raceSelectPlayerIndex = playerIndex;
  raceGridEl.innerHTML = "";

  RACES.forEach(r => {
    const card = document.createElement("div");
    card.className = "race-card";

    const main = document.createElement("div");
    main.className = "race-card-main";

    const glyphDiv = document.createElement("div");
    glyphDiv.className = "race-card-glyph";
    if (r.glyph) {
      const img = document.createElement("img");
      img.src = r.glyph;
      img.alt = r.name;
      glyphDiv.appendChild(img);
    } else {
      glyphDiv.textContent = r.name.charAt(0);
    }

    const nameDiv = document.createElement("div");
    nameDiv.className = "race-card-name";
    nameDiv.textContent = r.name;

    main.appendChild(glyphDiv);
    main.appendChild(nameDiv);
    card.appendChild(main);

    card.addEventListener("click", () => {
      const p = players[playerIndex];
      p.raceId = r.id;
      p.raceName = r.name;
      p.glyph = r.glyph || "";
      closeRaceModal();
      renderSetupPlayers();
      updateSetupSummary();
    });

    raceGridEl.appendChild(card);
  });

  raceModalBackdrop.classList.add("visible");
}

function closeRaceModal() {
  raceModalBackdrop.classList.remove("visible");
  raceSelectPlayerIndex = null;
}

// ---- Start Game ----

function onStartGame() {
  if (players.length === 0) return;

  // You could add validation here if you want all races/names required

  // Reset game state
  roundNumber = 1;
  passOrder = 0;
  lastPassedPlayerId = null;

  players.forEach(p => {
    p.passed = false;
    p.passPosition = null;
  });

  randomisePlayerOrder();

  document.body.classList.add("game-started");
  renderGamePanel();
}

// ---- Game rendering ----

function renderGamePanel() {
  turnDisplayEl.textContent = `Round ${roundNumber}`;
  hintTextEl.textContent =
    roundNumber <= 8
      ? "Tap a player when they pass."
      : "Maximum round reached.";

  renderOrderList();
  updateUndoButton();
}

function renderOrderList() {
  orderListEl.innerHTML = "";

  players.forEach(p => {
    const li = document.createElement("li");
    li.className = "order-item";
    if (p.passed) {
      li.classList.add("passed");
    }

    const main = document.createElement("div");
    main.className = "order-main";

    const glyphDiv = document.createElement("div");
    glyphDiv.className = "order-glyph";
    if (p.glyph) {
      const img = document.createElement("img");
      img.src = p.glyph;
      img.alt = p.raceName || "Race";
      glyphDiv.appendChild(img);
    } else {
      glyphDiv.textContent = p.raceName ? p.raceName.charAt(0) : "?";
    }

    const textDiv = document.createElement("div");
    textDiv.className = "order-text";

    const nameDiv = document.createElement("div");
    nameDiv.className = "order-name";
    nameDiv.textContent = p.name || "Unnamed";

    const raceDiv = document.createElement("div");
    raceDiv.className = "order-race";
    raceDiv.textContent = p.raceName || "No race";

    textDiv.appendChild(nameDiv);
    textDiv.appendChild(raceDiv);

    main.appendChild(glyphDiv);
    main.appendChild(textDiv);

    const statusDiv = document.createElement("div");
    statusDiv.className = "order-status";
    if (!p.passed) {
      statusDiv.textContent = "Active";
    } else if (p.passPosition != null) {
      statusDiv.textContent = `Passed ${formatOrdinal(p.passPosition)}`;
    } else {
      statusDiv.textContent = "Passed";
    }

    li.appendChild(main);
    li.appendChild(statusDiv);

    li.addEventListener("click", () => onPassClick(p));

    orderListEl.appendChild(li);
  });
}

function updateUndoButton() {
  undoBtn.disabled = lastPassedPlayerId === null;
}

// ---- Pass & Undo logic ----

function onPassClick(player) {
  // Ignore if already passed
  if (player.passed) return;

  // Ignore if we've already completed 8 rounds and all passed
  if (roundNumber >= 8 && allPlayersPassed()) return;

  passOrder += 1;
  player.passed = true;
  player.passPosition = passOrder;
  lastPassedPlayerId = player.id;

  renderOrderList();
  updateUndoButton();

  if (allPlayersPassed()) {
    advanceRoundIfPossible();
  }
}

function onUndoLastPass() {
  if (!lastPassedPlayerId) return;

  const p = players.find(pl => pl.id === lastPassedPlayerId);
  if (!p) return;

  p.passed = false;
  p.passPosition = null;
  passOrder = Math.max(passOrder - 1, 0);
  lastPassedPlayerId = null;

  renderOrderList();
  updateUndoButton();
}

// ---- Round handling ----

function allPlayersPassed() {
  return players.length > 0 && players.every(p => p.passed);
}

function advanceRoundIfPossible() {
  if (roundNumber >= 8) {
    // Cap at 8, but you could show a message if you want
    renderGamePanel();
    lastPassedPlayerId = null;
    updateUndoButton();
    return;
  }

  // Order players by passPosition ascending
  players.sort((a, b) => {
    const ap = a.passPosition ?? 999;
    const bp = b.passPosition ?? 999;
    return ap - bp;
  });

  // Reset pass flags for next round
  players.forEach(p => {
    p.passed = false;
    p.passPosition = null;
  });

  roundNumber += 1;
  passOrder = 0;
  lastPassedPlayerId = null;

  renderGamePanel();
}

// ---- Utilities ----

function randomisePlayerOrder() {
  players = players
    .map(p => ({ ...p, _r: Math.random() }))
    .sort((a, b) => a._r - b._r)
    .map(({ _r, ...rest }) => rest);
}

function formatOrdinal(n) {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

