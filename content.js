// Here we inject our code into the context of the page itself, since we need to patch its XHR mechanisms.
chrome.storage.local.get(['settings'], (result) => {
    if (chrome.runtime.lastError) {
        console.error('[FL Assorted Cats] Could not load settings from DB, falling back to defaults.');
    } else {
        console.log('[FL Assorted Cats] Settings received:', result.settings)

        document.addEventListener('FL_AC_injected', (event) => {
            console.log('[FL Assorted Cats] Request for settings received!');

            window.postMessage({
                action: 'FL_AC_settings',
                settings: result.settings
            }, "https://www.fallenlondon.com");
        }, false);

        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('inject.js');
        s.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})
