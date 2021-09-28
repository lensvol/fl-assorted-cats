document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("slotSettingsForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const newSlotName = form.elements.slotName.value;
        const newItems = form.elements.slotItems.value.split("\n");

        chrome.storage.local.set({
            settings: {
                slotName: newSlotName,
                items: newItems,
            }
        }, () => {
            const settingsEvent = new CustomEvent("FL_AC_settings", {
                detail: {
                    slotName: newSlotName,
                    items: newItems
                }
            });
            document.dispatchEvent(settingsEvent);
        });
    });

    chrome.storage.local.get(["settings"], (result) => {
        if (chrome.runtime.lastError) {
            console.debug("[FL Assorted Cats] Could not load settings from DB, falling back to defaults.");
        } else {
            form.elements.slotName.value = result.settings.slotName;
            form.elements.slotItems.value = result.settings.items.join("\n");
        }
    });
});