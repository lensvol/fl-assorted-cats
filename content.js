let actualCode = '(' + function () {
    const VISUALLY_HIDDEN_STYLE = "u-visually-hidden";

    // TODO: Fill it out with the remaining felines from wiki.
    const CAT_LABEL_SET = {
        "Sebastian the Nocturnal Smotherer": true,
        "Calliope the Yowler": true,
        "Love-Sickened Seneschal": true,
        "The Minister of War": true,
        "The Minister of Enigmas": true,
        "The Minister of Culture": true,
        "The Minister of State Affairs": true,
        "Starveling Cat": true,
        "Pink-Painted Cat": true,
        "Horatio, Finest of His Lineage": true,
        "Rubbery Feline": true,
        "August Feline": true,
        "Corresponding Ocelot": true,
        "Benvolio the Bacon Thief": true,
        "Freya, Scourge of Fragile Ornaments": true,
        "Midnight Matriarch": true,
    };

    const USED_TEST_SLOT = "TestSlot3";

    let categorySet = {
        "Companion": true,
        "Weapon": true,
        "Gloves": true,
        "Hat": true,
        "Boots": true,
        "Clothing": true,
    }

    function modifyResponse(response) {
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
        if (this.readyState === 4) {
            // TODO: Proper URL matching
            if (response.currentTarget.responseURL.includes("api/character/myself")) {
                let data = JSON.parse(response.target.responseText);

                /*
                 Here is the tricky part: this response does not contain any indication that if
                 specific item is equipped or not, and if you mark equipped item as belonging
                 to the test slot then it would not possible to un-equip it.

                 To prevent that, we use a heuristic that tries to get the list of the currently
                 equipped items so we can skip patching them.
                 */

                let equippedItems = document.getElementsByClassName("equipped-item");
                let equippedSet = {};
                for (const item of equippedItems) {
                    let qualityId = Number.parseInt(item.attributes["data-quality-id"].value);
                    equippedSet[qualityId] = true;
                }

                for (const category of data["possessions"]) {

                    // Only some of the categories can contain cats, so we'll just skip others to save time.
                    if (!(category.name in categorySet)) continue;

                    for (const candidate of category["possessions"]) {
                        if (candidate.name in CAT_LABEL_SET && !(candidate.id in equippedSet)) {
                            candidate.category = USED_TEST_SLOT;
                        }
                    }
                }

                // Need to do this in order to reset "read-only" status on responseText attribute
                Object.defineProperty(this, "responseText", {writable: true});
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
    function openBypass(original_function) {
        return function (method, url, async) {
            this.addEventListener("readystatechange", modifyResponse);
            return original_function.apply(this, arguments);
        };
    }

    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);

    /*
    For some reason, items equipped from the test slot leave ugly "holes behind", which
    are actually empty <li> nodes.

    As a matter of convenience, we listen to the changes on those elements and hide them
    if their contents are removed.

    Conversely, if their contents are restored due to item being unequipped, we will show them again.
    */
    let itemContentsObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList"
                 && mutation.target.nodeName.toLowerCase() === "li") {

                let alreadyHidden = mutation.target.classList.contains(VISUALLY_HIDDEN_STYLE);

                if (mutation.removedNodes.length > 0) {
                    mutation.target.classList.add(VISUALLY_HIDDEN_STYLE)
                } else if (mutation.addedNodes.length > 0){
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
    let testSlotObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                // TODO: Target those layers more precisely
                if (node.nodeName.toLowerCase() === "div") {
                    let equipmentGroups = node.getElementsByClassName("equipment-group-list__item");
                    for (const group of equipmentGroups) {
                        // Skip groups without any items in them
                        if (group.children.length === 0) {
                            continue;
                        }

                        let header = group.getElementsByTagName("h2")[0];

                        if (header.textContent === USED_TEST_SLOT) {
                            header.textContent = "Cats, Assorted";

                            let itemList = group.getElementsByTagName("ul")[0];
                            /*
                            Since nothing can be equipped in the test slot, we'll just hide the container
                            for the currently equipped item.

                            TODO: Make it Horatio's seat of honor?
                            */

                            let equippedContainer = group.getElementsByClassName("equipment-group__equipment-slot-container")[0];
                            equippedContainer.className = "";

                            // As items in that group are already pre-filled, our observer will not trigger yet.
                            for (const child of itemList.children) {
                                if (!child.hasChildNodes()) {
                                    child.classList.add(VISUALLY_HIDDEN_STYLE)
                                }
                            }
                            itemContentsObserver.observe(itemList, {childList: true, subtree: true})


                            // Since we already found the test slot and processed it, it is no longer
                            // necessary to monitor changes on the entire document.
                            testSlotObserver.disconnect();
                            break;
                        }
                    }
                }
            });
        });
    });

    testSlotObserver.observe(document, {childList: true, subtree: true});
} + ')();';

// Here we inject our code above into the context of the page itself, since we need to patch its XHR mechanisms.
// Taken from https://stackoverflow.com/a/9517879
let script = document.createElement('script');
script.textContent = actualCode;
(document.head || document.documentElement).appendChild(script);
script.remove();