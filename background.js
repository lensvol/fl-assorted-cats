chrome.runtime.onInstalled.addListener(function (details) {
    let saveInitialSettings = false;

    if (details.reason === 'install') {
        saveInitialSettings = true;
    } else if (details.reason === 'update') {
        const thisVersion = chrome.runtime.getManifest().version;
        if (details.previousVersion !== thisVersion) {
            saveInitialSettings = true;
        }
    }

    if (saveInitialSettings) {
        chrome.storage.local.set({
            settings: {
                slotName: DEFAULT_PRESET_KEY,
                items: SLOT_CONTENTS_PRESETS.get(DEFAULT_PRESET_KEY),
            }
        }, () => { console.log('[FL Assorted Cats] Default settings saved into DB') });
    }
});
