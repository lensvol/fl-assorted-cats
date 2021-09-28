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
                slotName: 'Cats, Assorted',
                items: [
                    'Sebastian the Nocturnal Smotherer',
                    'Calliope the Yowler',
                    'Love-Sickened Seneschal',
                    'The Minister of War',
                    'The Minister of Enigmas',
                    'The Minister of Culture',
                    'The Minister of State Affairs',
                    'Starveling Cat',
                    'Pink-Painted Cat',
                    'Horatio, Finest of His Lineage',
                    'Grubby Kitten',
                    'Gustav the Ankle Weaver',
                    'Rubbery Feline',
                    'August Feline',
                    'Corresponding Ocelot',
                    'Benvolio the Bacon Thief',
                    'Freya, Scourge of Fragile Ornaments',
                    'Midnight Matriarch',
                    'Midnight Matriarch of the Menagerie of Roses',
                    'Bengal Tigress',
                    'Extravagantly-Titled Tigress',
                    'Tomb-Lion',
                    'Parabolan Panther',
                    'Parabolan Kitten',
                    'Wretched Mog',
                    'Princeling of the Wakeful Court',
                    'Morally and Physically Flexible Rubbery Cat',
                    'A Short-Tempered Shorthair',
                    'Lyon Pursuivant of Arms Extraordinary'
                ]
            }
        }, () => { console.log('[FL Assorted Cats] Default settings saved into DB') });
    }
});
