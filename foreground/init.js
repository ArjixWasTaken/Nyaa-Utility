// prettier-ignore
const nyaaUtility = {
    userName: "guest",
    utils: {
        createElement: (el, obj={}) => {
            const elem = document.createElement(el)

            Object.entries(obj).forEach(([key, value]) => {
                elem[key] = value
            })
            return elem
        },
        letterToBool: (letter) => {
            switch (letter) {
                case 'y':
                    return true;
                case 'n':
                    return false;
                default:
                    return undefined;
            }
        },
        getDataType: (obj) => {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
        },
        snippets: {
            getCheckBox: (text, identifier, check) => {
                let checked = 'value="n"'
                if (check) {
                    checked = 'value="y" checked'
                }
                return `<div class="row">
                                    <div class="form-group col-md-4">
                                        <input type="checkbox" ${checked} id="${identifier}" name="${identifier}">
                                        <label for="${identifier}">
                                            ${text}
                                        </label>
                                    </div>
                              </div>`
            },
            getListBox: (title, identifier, listOfItems, itemClass, btnName, emptyListDefault) => {
                let list = `<div class="row"><div class="form-group col-md-4"><div id="userList"><p>${title}</p><ul id="${identifier}" style="display:inline-block; border:1px solid #000; padding:20px; overflow-y:auto; height: 90px; list-style-type: none; padding: 0; margin: 0;">`

                for (let i = 0; i < listOfItems.length; i++) {
                    let listItem = `<li style="margin-left: 10px; margin-right: 10px;"><div class="${itemClass}" id=${itemClass}><p class="${itemClass}" style="display: inline-block;">` +
                        `<a target="_blank" href=${listOfItems[i]}>${listOfItems[i]}</a></p>` +
                        `<input class="btn btn-xs btn-danger pull-right" type="button" style="margin-left: 20px; background-color: #4CAF50; border: none; text-size: 70%;" value="${btnName}"` +
                        `></input>` +
                        `<br></div></li>`
                    list += listItem
                }

                if (listOfItems.length == 0) {
                    let listItem = `<li style="margin-left: 10px; margin-right: 10px;"><div class="${itemClass}">${emptyListDefault}</div></li>`
                    list += listItem
                }
                list += "</ul></div></div></div>"
                return list
            },
            getDropdownList: (text, identifier, listOfItems, selectedItem) => {
                return `
                <div class="row">
                    <div class="form-group col-md-4">
                        <p>${text}
                        <select id="${identifier}">
                ` + listOfItems.map(item => {
                    let selected = item == selectedItem? ' selected': '' 
                    return `
                        <option${selected}> ${item} </option>
                    `
                }).join('\n') + `\n</select></p></div></div>`
            }
        }
    },
    storage: {
        system: {
            onload: (callback) => {
                // thanks to https://stackoverflow.com/q/21518381/13077523
                if (!nyaaUtility.storage.system.initialized) {
                    setTimeout(() => {
                        nyaaUtility.storage.system.onload(callback)
                    }, 100);
                } else {
                    callback();
                }
            },
            initialized: false
        },
        user: {
            values: [],
            options: {
                "NyaaRemoveRule": "both",
                "NyaaUserBlocks": false,
                "AutoNextPage": false,
                "nyaaBlockedUsers": [],
                "commentPostedAtTime": true,
                "subscribedThreads": {},
                "notifications": {}
            }
        },
        get: (keyName) => {
            for (let value of nyaaUtility.storage.user.values) {
                if (value['key'] == keyName) {
                    return value['value']
                }
            }
            return undefined
        },
        set: (keyName, value) => {
            for (let i = 0; i < nyaaUtility.storage.user.values.length; i++) {
                if (nyaaUtility.storage.user.values[i]['key'] == keyName) {
                    nyaaUtility.storage.user.values[i]['value'] = value
                    nyaaUtility.settings.save()
                    return
                }
            }
            nyaaUtility.storage.user.values.push({
                key: keyName,
                value
            })
            nyaaUtility.settings.save()
            return
        },
        del: (keyName) => {
            nyaaUtility.storage.user.values = nyaaUtility.storage.user.values.filter(({key}) => {key !== keyName})
            nyaaUtility.settings.save()
            return
        }
    },
    settings: {
        load: () => {
            chrome.storage.sync.get("NyaaUtilSettings", function (value) {
                if (JSON.stringify(value) == JSON.stringify({})) {
                    nyaaUtility.settings.save(() => {nyaaUtility.settings.load()})
                } else {
                    nyaaUtility.storage.user = value.NyaaUtilSettings
                    nyaaUtility.storage.system.initialized = true
                }
            });
        },
        save: (callback=false) => {
            chrome.storage.sync.set({NyaaUtilSettings: nyaaUtility.storage.user}, () => {
                if (typeof callback == 'function') {
                    callback()
                }
            });
        }
    }
};

nyaaUtility.settings.load(); // async fetch settings

nyaaUtility.storage.system.onload(() => {
    nyaaUtility.userName = document
        .querySelector("i.fa-user")
        .parentNode.innerText.trim();
    console.log(
        `%cNyaaUtility Settings %c${JSON.stringify(
            nyaaUtility.storage.user,
            null,
            2
        )}`,
        "color: red;",
        "color: green;"
    );
});

// adds a notifications option to the dropdown menu
$(`.dropdown-menu > li > a[href*="/profile"]`).parent().after(`
    <li>
        <a href="/notifications">
            <i class="fa fa-bell fa-fw"></i>
            Notifications
        </a>
    </li>
`);
