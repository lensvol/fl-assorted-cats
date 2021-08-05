(function() {
    function createNewSection(name) {
        let sectionItem = document.createElement("li");
        sectionItem.className = "equipment-group-list__item";

        let sectionDiv = document.createElement("div");
        sectionDiv.className = "equipment-group";

        let sectionHeader = document.createElement("h2");
        sectionHeader.className = "heading heading--2 equipment-group__name";
        sectionHeader.textContent = name;

        let currentItemContainer = document.createElement("div");
        currentItemContainer.className = "equipment-group__slot-and-available-items";

        let placeholderContainer = document.createElement("div");
        // placeholderContainer.className = "equipment-group__equipment-slot-container equipment-group__equipment-slot-container--empty u-visually-hidden"

        let placeholder = document.createElement("div");
        placeholder.className = "equipment__empty-slot"
        placeholder.style.cssText = "width: 40px; height: 40px;";

        let listOfItems = document.createElement("ul");
        listOfItems.className = "available-item-list";

        placeholderContainer.appendChild(placeholder);
        currentItemContainer.appendChild(placeholderContainer);
        currentItemContainer.appendChild(listOfItems);

        sectionDiv.appendChild(sectionHeader);
        sectionDiv.appendChild(currentItemContainer);

        sectionItem.appendChild(sectionDiv);

        return [sectionItem, listOfItems];
    }

    let catLabels = [
        "Sebastian the Nocturnal Smotherer",
        "Calliope the Yowler",
        "Love-Sickened Seneschal",
        // TODO: Figure out how to move around nearby items
        // "The Minister of War",
        // "The Minister of Enigmas",
        // "The Minister of Culture",
        // "The Minister of State Affairs",
        "Starveling Cat",
        "Pink-Painted Cat",
        "Horatio, Finest of His Lineage",
        "Rubbery Feline",
        "August Feline",
        "Corresponding Ocelot",
        "Benvolio the Bacon Thief",
        "Freya, Scourge of Fragile Ornaments",
        "Midnight Matriarch"
    ]

    let result = createNewSection("Cats, Assorted");
    let catSection = result[0];
    let listOfCatItems = result[1];

    var observer = new MutationObserver(function(mutations) {
        observer.disconnect()
        mutations.forEach(function(mutation) {
            let catsItemsToAdd = [];
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                let node = mutation.addedNodes[i];

                if (node.nodeName.toLowerCase() === "div") {
                    let equipmentGroupList = node.getElementsByClassName("equipment-group-list");

                    if (equipmentGroupList.length > 0) {
                        let groupList = equipmentGroupList[0];
                        let allItems = groupList.querySelectorAll("li.available-item-list__item");
                        for (var a = 0; a < allItems.length; a++) {
                            let label = allItems[a].firstChild.firstChild.ariaLabel;
                            for (var b = 0; b < catLabels.length; b++) {
                                if (label.includes(catLabels[b])) {
                                    catsItemsToAdd.push(allItems[a]);
                                    break;
                                }
                            }
                        }
                        groupList.insertBefore(catSection, groupList.children[3]);
                    }
                } else if (node.nodeName.toLowerCase() === "li" && node.className === "available-item-list__item") {
                    for (var b = 0; b < catLabels.length; b++) {
                        let label = node.firstChild.firstChild.ariaLabel;
                        if (label.includes(catLabels[b]) && node.parentElement !== listOfCatItems && !node.hasAttribute("wrappedAroundCat")) {
                            catsItemsToAdd.push(node);
                            break;
                        }
                    }
                }
            }

            if (catsItemsToAdd.length > 0) {
                for (var i = 0; i < catsItemsToAdd.length; i++) {
                    let parent = catsItemsToAdd[i].parentElement;
                    let catElement = catsItemsToAdd[i];
                    catsItemsToAdd[i].onclick = function () {
                        catElement.setAttribute("wrappedAroundCat", true);
                        catElement.className = "u-visually-hidden";
                        parent.appendChild(catElement);
                    }

                    listOfCatItems.appendChild(catsItemsToAdd[i]);
                }

            }
            observer.observe(document, {childList: true, subtree: true, attributes: true});
        });
    });
    observer.observe(document, { childList: true, subtree: true, attributes: true });

})();