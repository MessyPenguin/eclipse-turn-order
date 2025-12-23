/* -----------------------------------------------------------
   FIREBASE INITIALISATION + SHARED GAME STATE
   - Hidden auto-reset on first load
   - Shared /gameState across all devices
----------------------------------------------------------- */

const firebaseConfig = {
    apiKey: "AIzaSyDun-jhE8IP_33kfjYEyIWuD9_ZA6Sv1Ic",
    authDomain: "eclipse-turn-order.firebaseapp.com",
    databaseURL: "https://eclipse-turn-order-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "eclipse-turn-order",
    storageBucket: "eclipse-turn-order.firebasestorage.app",
    messagingSenderId: "146861742560",
    appId: "1:146861742560:web:675f52cfe851e72199f385"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const gameStateRef = db.ref("gameState");

let isApplyingRemoteState = false;

const EMPTY_GAME_STATE = {
    players: [],
    passedOrderNames: [],
    turn: 1
};

function syncToFirebase() {
    if (isApplyingRemoteState) return;

    const safePlayers = players.map(p => ({
        name: p.name || "",
        raceId: p.raceId || null
    }));

    const safePassed = [...passedOrder];

    gameStateRef.set({
        players: safePlayers,
        passedOrderNames: safePassed,
        turn: turn || 1
    }).catch(err => {
        console.error("Error syncing game state:", err);
    });
}

function applyGameStateRemote(state) {
    isApplyingRemoteState = true;

    const s = state || EMPTY_GAME_STATE;

    players = (s.players || []).map(p => ({
        name: p.name || "",
        raceId: p.raceId || null
    }));

    turn = s.turn || 1;
    passedOrder = Array.isArray(s.passedOrderNames) ? [...s.passedOrderNames] : [];
    lastPassed = passedOrder.length ? passedOrder[passedOrder.length - 1] : null;

    renderSetupFromState();
    renderOrderFromState();

    isApplyingRemoteState = false;
}

/** Hidden auto-reset on first device; others join existing game */
function initSharedGameState() {
    gameStateRef.once("value").then(snapshot => {
        const val = snapshot.val();

        if (!val) {
            // No game yet → this device silently initialises a fresh state
            players = [];
            passedOrder = [];
            lastPassed = null;
            turn = 1;
            syncToFirebase();
        } else {
            // Existing game → join it
            applyGameStateRemote(val);
        }

        // Listen for ongoing changes from any device
        gameStateRef.on("value", snap => {
            const data = snap.val();
            if (!data) return;
            applyGameStateRemote(data);
        });
    }).catch(err => {
        console.error("Error initialising shared state:", err);
    });
}
