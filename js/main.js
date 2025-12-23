/* -----------------------------------------------------------
   APP ENTRY POINT (LOCAL ONLY)
----------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    attachGestureHandlers();
    bindUiEvents();

    // Initial local setup
    setPlayerCount(document.getElementById("playerCount").value);
    renderSetupFromState();
    renderOrderFromState();
});
