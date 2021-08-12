let actualCode = '(' + function () {
    let catLabels = [
        "Sebastian the Nocturnal Smotherer",
        "Calliope the Yowler",
        "Love-Sickened Seneschal",
        "The Minister of War",
        "The Minister of Enigmas",
        "The Minister of Culture",
        "The Minister of State Affairs",
        "Starveling Cat",
        "Pink-Painted Cat",
        "Horatio, Finest of His Lineage",
        "Rubbery Feline",
        "August Feline",
        "Corresponding Ocelot",
        "Benvolio the Bacon Thief",
        "Freya, Scourge of Fragile Ornaments",
        "Midnight Matriarch",
    ];

    let labelSet = {};
    for (const label of catLabels) {
        labelSet[label] = true;
    }

    let categorySet = {
        "Companion": true,
        "Weapon": true,
        "Gloves": true,
        "Hat": true,
        "Boots": true,
        "Clothing": true,
    }

    function modifyResponse(response) {
        if (this.readyState === 4) {
            // TODO: Proper URL matching
            if (response.currentTarget.responseURL.includes("api/character/myself")) {
                let data = JSON.parse(response.target.responseText);

                let equippedItems = document.getElementsByClassName("equipped-item");
                let equippedSet = {};
                for (const item of equippedItems) {
                    let qualityId = Number.parseInt(item.attributes["data-quality-id"].value);
                    equippedSet[qualityId] = true;
                }

                for (const category of data["possessions"]) {
                    if (!(category.name in categorySet)) continue;

                    for (const candidate of category["possessions"]) {
                        if (candidate.name in labelSet && !(candidate.id in equippedSet)) {
                            candidate.category = "TestSlot2";
                        }
                    }
                }

                // Need to do this in order to reset "read-only" status on responseText attribute
                Object.defineProperty(this, "responseText", {writable: true});
                this.responseText = JSON.stringify(data);
            }
        }
    }

    function openBypass(original_function) {
        return function (method, url, async) {
            this.addEventListener("readystatechange", modifyResponse);
            return original_function.apply(this, arguments);
        };
    }

    // Taken from https://stackoverflow.com/a/41566077
    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);

    let testSlotObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList"
                 && mutation.removedNodes.length > 0
                 && mutation.target.nodeName.toLowerCase() === "li") {
                for (const child of mutation.target.parentElement.children) {
                    if (child.children.length === 0) {
                        child.className += " u-visually-hidden"
                    }
                }
            }
        })
    })

    let itemSectionObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeName.toLowerCase() === "div") {
                    let equipmentGroups = node.getElementsByClassName("equipment-group-list__item");
                    for (const group of equipmentGroups) {
                        if (group.children.length === 0) {
                            continue;
                        }

                        if (group.firstChild.firstChild.textContent === "TestSlot2") {
                            let header = group.firstChild.firstChild;
                            header.textContent = "Cats, Assorted";

                            group.firstChild.children[1].firstChild.className = "";
                            for (const child of group.firstChild.children[1].children[1].children) {
                                if (child.children.length === 0) {
                                    child.className += " u-visually-hidden";
                                }
                            }

                            itemSectionObserver.disconnect();
                            testSlotObserver.observe(group.firstChild.children[1], {childList: true, subtree: true})
                            break;
                        }
                    }
                }
            });
        });
    });

    itemSectionObserver.observe(document, {attributes: true, childList: true, subtree: true});
} + ')();';

// Taken from https://stackoverflow.com/a/9517879
let script = document.createElement('script');
script.textContent = actualCode;
(document.head || document.documentElement).appendChild(script);
script.remove();