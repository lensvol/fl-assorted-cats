(function () {
    const DONE = 4

    const VISUALLY_HIDDEN_STYLE = 'u-visually-hidden';
    const USED_SLOT = 'Destiny';
    const DEFAULT_CAT_LABELS = [
        'Sebastian the Nocturnal Smotherer',
        'Calliope the Yowler',
        'Love-Sickened Seneschal',
        'The Minister of War',
        'The Minister of Enigmas',
        'The Minister of Culture',
        'The Minister of State Affairs',
        'Starveling Stole',
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
        'An Uneasy Alliance with an Exiled Tiger',
        'Tomb-Lion',
        'Parabolan Panther',
        'Parabolan Kitten',
        'Lovingly Be-Ribboned Kitten',
        'Wretched Mog',
        'Princeling of the Wakeful Court',
        'Morally and Physically Flexible Rubbery Cat',
        'A Short-Tempered Shorthair',
        'Lyon Pursuivant of Arms Extraordinary',
        'Inquisitive Lamp-cat',
        'Feline Pariah',
    ];
    const DEFAULT_SLOT_NAME = 'Cats, Assorted';
    const INTERESTING_CATEGORIES = [
        'Companion',
        'Weapon',
        'Gloves',
        'Hat',
        'Boots',
        'Destiny',
        'Ship',
        'Spouse',
        'Club',
        'Clothing',
        'Affiliation',
        'Home Comfort',
        'Transportation',
        'Treasure',
        'Burden',
    ];

    let slotName = DEFAULT_SLOT_NAME;
    let catLabels = DEFAULT_CAT_LABELS;
    let fauxItemGroup = createFauxItemGroup();
    let trueItemImage = null;
    let trueItemQualityId = null;

    // Automatically generated item group based on the HTML code of item group list element.
    function createFauxItemGroup() {
        const li = document.createElement('li');
        li.classList.add('equipment-group-list__item', VISUALLY_HIDDEN_STYLE);
        li.setAttribute('data-faux-group', 'true');

        const container = document.createElement('div');
        container.classList.add('equipment-group');

        const h2 = document.createElement('h2');
        h2.classList.add('heading', 'heading--2', 'equipment-group__name');

        const container2 = document.createElement('div');
        container2.classList.add('equipment-group__slot-and-available-items');

        const text = document.createTextNode(USED_SLOT);

        const container3 = document.createElement('div');
        container3.classList.add('equipment-group__equipment-slot-container', 'equipment-group__equipment-slot-container--full', 'equipment-group__equipment-slot-container--unchangeable');

        const ul = document.createElement('ul');
        ul.classList.add('available-item-list');

        const container4 = document.createElement('div');
        container4.classList.add('equipped-item');
        container4.setAttribute("data-quality-id", "0");

        const container5 = document.createElement('div');
        container5.setAttribute('data-item-placeholder', 'true')

        li.appendChild(container);

        container.appendChild(h2);
        container.appendChild(container2);

        h2.appendChild(text);

        container2.appendChild(container3);
        container2.appendChild(ul);

        container3.appendChild(container4);

        container4.appendChild(container5);

        return li;
    }

    function modifyResponse (response) {
        /*
        The idea itself is pretty simple: trick FL UI to put specific items into specific slots
        by modifying data that is returned from 'api/character/myself' endpoint.

        Each item dictionary has 'category' key that corresponds to one of the category IDs
        hardcoded into the FL UI source code, so by patching that value you can direct UI
        to "misplace" it into the category that you need. For all intents and purposes, it will be
        treated as a fully functioning item and if you click on it will be equipped into the proper
        slot.

        Here we make use of the "test slots" that are left in the "Possesions" tab, praying that FBG
        will not decide to remove them in the future.
         */

        if (this.readyState === DONE) {
            if (/\/api\/character\/myself\/?$/.test(response.currentTarget.responseURL)) {
                const data = JSON.parse(response.target.responseText);

                /*
                 Here is the tricky part: this response does not contain any indication that if
                 specific item is equipped or not, and if you mark equipped item as belonging
                 to the test slot then it would not possible to un-equip it.

                 To prevent that, we use a heuristic that tries to get the list of the currently
                 equipped items so we can skip patching them.
                 */

                const equippedItemSlots = document.getElementsByClassName('equipped-item');
                const equippedItems = [];
                for (const slot of equippedItemSlots) {
                    const qualityId = Number.parseInt(slot.attributes['data-quality-id'].value);
                    equippedItems.push(qualityId);
                }

                for (const category of data.possessions) {
                    // Only some of the categories can contain cats, so we'll just skip others to save time.
                    if (!INTERESTING_CATEGORIES.includes(category.name)) continue;

                    for (const candidate of category.possessions) {
                        if (candidate.id in equippedItems) continue;

                        for (const label of catLabels) {
                            if (candidate.name.includes(label)) {
                                candidate.category = USED_SLOT;
                                break;
                            }
                        }
                    }
                }

                // Need to do this in order to reset "read-only" status on responseText attribute
                Object.defineProperty(this, 'responseText', { writable: true });
                this.responseText = JSON.stringify(data);
            }
        }
    }

    /*
     HERE BE DRAGONS

     I would have really liked to just use `webRequest` API and modify the responses transparently,
     but until https://bugs.chromium.org/p/chromium/issues/detail?id=104058 is resolved that
     would have lead to more convoluted code base due to the need for separate interception
     mechanisms for both Chrome and Firefox (don't start me on Safari T_T).

     Solution taken from https://stackoverflow.com/a/41566077
     */
    function openBypass (original_function) {
        return function (method, url, async) {
            this.addEventListener('readystatechange', modifyResponse);
            return original_function.apply(this, arguments);
        };
    }

    // This observer automatically moves item images recreated by React in the original item slot
    // into the faux item slot.
    const slotImageObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' &&
                mutation.target.nodeName.toLowerCase() === 'div' &&
                mutation.addedNodes.length > 0
            ) {
                // Prevent item change spinner appearing in the "deleted" item slot
                const imageChangeSpinner = mutation.target.querySelector("div[class='loading-image']");
                if (imageChangeSpinner != null) {
                    imageChangeSpinner.classList.add(VISUALLY_HIDDEN_STYLE);
                }

                const trueItemImage = mutation.target.querySelector("img[class*='equipped-item__image']");
                if (trueItemImage == null) return;

                trueItemImage.parentElement.removeChild(trueItemImage);

                const fauxEquippedItem = fauxItemGroup.querySelector("div[class*='equipped-item']");
                if (fauxEquippedItem) {
                    // FIXME: quality ID transfer is not working at the moment and I cannot be bothered to fix it.
                    // After all, how often would you change your destiny?
                    fauxEquippedItem.setAttribute("data-quality-id", trueItemQualityId);
                }

                // Ensure that the old image is removed
                const swapContainer = fauxItemGroup.querySelector("div[data-item-placeholder]");
                while (swapContainer.lastElementChild) {
                    swapContainer.removeChild(swapContainer.lastElementChild);
                }
                swapContainer.appendChild(trueItemImage);
            }
        })
    });

    /*
    For some reason, items equipped leave ugly "holes behind", which
    are actually empty <li> nodes.

    As a matter of convenience, we listen to the changes on those elements and hide them
    if their contents are removed.

    Conversely, if their contents are restored due to item being unequipped, we will show them again.
    */
    const itemContentsObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' &&
                mutation.target.nodeName.toLowerCase() === 'li') {

                if (mutation.removedNodes.length > 0) {
                    mutation.target.classList.add(VISUALLY_HIDDEN_STYLE)
                } else if (mutation.addedNodes.length > 0) {
                    mutation.target.classList.remove(VISUALLY_HIDDEN_STYLE)
                }
            }
        })
    })

    /*
    To my understanding, on the initial load FL UI will render most of its content at once and
    so mutation observer will not trigger on filled equipment list. That is because technically
    it is not being added as it is, but as a part of a larger 'div'.
     */
    const testSlotObserver = new MutationObserver(function (mutations) {
        for (let m = 0; m < mutations.length; m++) {
            const mutation = mutations[m];

            for (let n = 0; n < mutation.addedNodes.length; n++) {
                const node = mutation.addedNodes[n];

                if (node.nodeName.toLowerCase() === 'div') {
                    const equipmentGroups = node.getElementsByClassName('equipment-group-list__item');
                    for (const group of equipmentGroups) {
                        // Skip groups without any items in them
                        if (group.children.length === 0) {
                            continue;
                        }

                        // Skip groups created by us
                        if (group.hasAttribute("data-faux-group")) {
                            continue;
                        }

                        const header = group.getElementsByTagName('h2')[0];

                        if (header.textContent === USED_SLOT) {
                            header.textContent = slotName;

                            const itemList = group.getElementsByTagName('ul')[0];
                            /*
                            Since nothing can be equipped in the test slot, we'll just hide the container
                            for the currently equipped item.

                            TODO: Make it Horatio's seat of honor?
                            */

                            // Place faux item group before the original one
                            group.parentElement.insertBefore(fauxItemGroup, group);
                            // Place the repurposed item group at the top of the list
                            group.parentElement.insertBefore(group, group.parentElement.firstElementChild);

                            const equippedContainer = group.getElementsByClassName('equipment-group__equipment-slot-container')[0];
                            if (equippedContainer) {
                                equippedContainer.className = "";

                                // Set up observer so that any new image elements are moved to the faux item group
                                slotImageObserver.observe(equippedContainer, { childList: true, subtree: true });

                                // Remove the currently equipped item image from the original group
                                trueItemImage = equippedContainer.querySelector("img");
                                trueItemImage.parentElement.removeChild(trueItemImage);

                                const currentlyEquippedItem = equippedContainer.querySelector("div[class*='equipped-item']");
                                if (currentlyEquippedItem) {
                                    // Quality ID associated with the equipped item is set on the slot, not the item image
                                    trueItemQualityId = Number.parseInt(currentlyEquippedItem.attributes['data-quality-id'].value);
                                    // Hide slot for the currently equipped item
                                    currentlyEquippedItem.classList.add(VISUALLY_HIDDEN_STYLE);
                                }

                                // Remove any remaining decorations from the hidden item slot
                                equippedContainer.classList.remove("equipment-group__equipment-slot-container--full");
                                equippedContainer.classList.remove("equipment-group__equipment-slot-container--empty");

                                // Show the faux item group
                                fauxItemGroup.classList.remove(VISUALLY_HIDDEN_STYLE);
                                const fauxEquippedItem = fauxItemGroup.querySelector("div[class*='equipped-item']");
                                if (fauxEquippedItem) {
                                    // Transfer quality ID to the faux item slot
                                    fauxEquippedItem.setAttribute("data-quality-id", trueItemQualityId);
                                }

                                const swapContainer = fauxItemGroup.querySelector("div[data-item-placeholder]");
                                while (swapContainer.lastElementChild) {
                                    swapContainer.removeChild(swapContainer.lastElementChild);
                                }
                                swapContainer.appendChild(trueItemImage);
                            }

                            // As items in that group are already pre-filled, our observer will not trigger yet.
                            for (const child of itemList.children) {
                                if (!child.hasChildNodes()) {
                                    child.classList.add(VISUALLY_HIDDEN_STYLE)
                                }
                            }
                            itemContentsObserver.observe(itemList, { childList: true, subtree: true });
                            return;
                        }
                    }
                }
            }
        }
    });

    window.addEventListener("message", (event) => {
        if (event.data.action === "FL_AC_settings") {
            slotName = event.data.settings.slotName;
            catLabels = event.data.settings.items;
        }
    });
    document.dispatchEvent(new CustomEvent('FL_AC_injected'));
    testSlotObserver.observe(document, { childList: true, subtree: true });
    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);
}())
