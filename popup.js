document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('slotSettingsForm');

    function setSubmitButtonState(isDisabled) {
        const submitButton = document.getElementById("submitBtn");
        if (submitButton) {
            if (isDisabled) {
                submitButton.setAttribute("disabled", isDisabled);
            } else {
                submitButton.removeAttribute("disabled");
            }
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        setSubmitButtonState(true);

        const newSlotName = form.elements.slotName.value;
        const newItems = form.elements.slotItems.value
            .split('\n')
            .map(word => word.trim())
            .filter(word => word);

        chrome.storage.local.set({
            settings: {
                slotName: newSlotName,
                items: newItems
            }
        }, () => {
            const statusIndicator = document.getElementById("statusIndicator");

            if (chrome.runtime.lastError) {
                statusIndicator.textContent = "Error occurred while saving your settings. Please try again :(";
            } else {
                statusIndicator.textContent = "New settings were saved successfully! Please reload the FL tab.";
                const settingsEvent = new CustomEvent('FL_AC_settings', {
                    detail: {
                        slotName: newSlotName,
                        items: newItems
                    }
                });
                document.dispatchEvent(settingsEvent);
            }

            setSubmitButtonState(false);
        });
    });

    chrome.storage.local.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
            console.debug('[FL Assorted Cats] Could not load settings from DB, falling back to defaults.');
        } else {
            form.elements.slotName.value = result.settings.slotName;
            form.elements.slotItems.value = result.settings.items.join('\n');
        }
    });
});
