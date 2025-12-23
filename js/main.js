/* -----------------------------------------------------------
   APP ENTRY POINT
----------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    attachGestureHandlers();
    bindUiEvents();

    // Initial local setup
    setPlayerCount(document.getElementById("playerCount").value);
    renderSetupFromState();
    renderOrderFromState();

    // Shared state via Firebase
    initSharedGameState();
});
