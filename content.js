// Here we inject our code into the context of the page itself, since we need to patch its XHR mechanisms.
chrome.storage.local.get(["settings"], (result) => {
    if (chrome.runtime.lastError) {
        console.error("Could not load settings from DB, falling back to defaults.");
    } else {
        console.log("Settings received:", result.settings)
        document.addEventListener("injected", (event) => {
            console.log("Request for settings received!");
            const settingsEvent = new CustomEvent("settings", {detail: result.settings});
            document.dispatchEvent(settingsEvent);
        }, false);

        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('inject.js');
        s.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})
