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
        fetchWithErrorCatching: async (link, options = {}) => {
            const res = await fetch(link, options);
            if (res.status == 200) {
                return res;
            }
            return undefined;
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
        stringIncludes: (string, substrings) => {
            for (let substring of substrings) {
                if (string.includes(substring)) {
                    return true
                }
            }
            return false
        },
        getData : async (id, rss=false) => {
            const link = `${rss ? id : "https://nyaa.si/view/" +  id}`;
        
            let req = await nyaaUtility.utils.fetchWithErrorCatching(link, {
                headers: {
                    "User-Agent": navigator.userAgent,
                },
            });
            if (req == undefined) {
                await sleep(5000);
                req = await nyaaUtility.utils.fetchWithErrorCatching(link, {
                    headers: {
                        "User-Agent": navigator.userAgent,
                    },
                });
                if (req == undefined) {
                    await sleep(10000);
                    if (rss) return []
                    return {};
                }
            }
        
            const data = await req.text();
            const html = new window.DOMParser().parseFromString(data, `text/${rss ? "xml" : "html"}`).documentElement
        
            if (rss) {
                items = []
                html.querySelectorAll("item").forEach(el => {
                    items.push({
                        comments: el.getElementsByTagName("nyaa:comments")[0].innerHTML.trim(),
                        category: el.getElementsByTagName("nyaa:categoryId")[0].innerHTML.trim(),
                        title: el.querySelector("title").innerHTML.trim(),
                        size: el.getElementsByTagName("nyaa:size")[0].innerHTML.trim(),
                        timestamp: (new Date(el.querySelector("pubDate").innerHTML)).getTime(),
                        id: el.querySelector("guid").innerHTML.match(/view\/(\d+)/)[1]
                    })
                })
                return items
            }
        
            return {
                comments: html.querySelectorAll("div.panel.panel-default.comment-panel").length,
                category: html.querySelector(`.panel-body > .row a[href*="/?c="]:nth-child(2)`).href.match(/(\d_\d)/)[1],
                title: html.querySelector("h3.panel-title").innerText.trim(),
                size: html.querySelector("div.panel-body > div:nth-child(4) > div:nth-child(2)").innerText.trim(),
                timestamp: html.querySelector('div.panel-body > div:nth-child(1) > div:nth-child(4)')['data-timestamp'],
                id        
            }
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
                "FeedsTracker": {},
                "subscribedFeeds": {},
                "notifications": {},
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
            nyaaUtility.storage.user.values = nyaaUtility.storage.user.values.filter(({key}) => key !== keyName)
            nyaaUtility.settings.save()
            return
        }
    },
    settings: {
        load: () => {
            chrome.storage.local.get("NyaaUtilSettings", function (value) {
                if (JSON.stringify(value) == JSON.stringify({})) {
                    nyaaUtility.settings.save(() => {nyaaUtility.settings.load()})
                } else {
                    nyaaUtility.storage.user = value.NyaaUtilSettings
                    nyaaUtility.storage.system.initialized = true
                }
            });
        },
        save: (callback=false) => {
            chrome.storage.local.set({NyaaUtilSettings: nyaaUtility.storage.user}, () => {
                if (typeof callback == 'function') {
                    callback()
                }
            });
        }
    }
};

// dont initialize if the page is rss
if (!nyaaUtility.utils.stringIncludes(document.location.href, ["page=rss"])) {
    nyaaUtility.userName = document
        .querySelector("i.fa-user")
        .parentNode.innerText.trim();

    nyaaUtility.settings.load(); // async fetch settings

    // adds a notifications option to the dropdown menu
    $(`.dropdown-menu > li > a[href*="/profile"]`).parent().after(`
        <li>
            <a href="/notifications">
                <i class="fa fa-bell fa-fw"></i>
                Notifications
            </a>
        </li>
    `);
    try {
        document.querySelector(
            `.dropdown-menu > li > [href*="/profile"]`
        ).innerHTML = document
            .querySelector(`[href*="/profile"]`)
            .innerHTML.replace("Profile", "Settings");
    } catch {
        $(`.dropdown-menu > li > a[href*="/login"]`).parent().before(`
        <li>
            <a href="/settings">
                <i class="fa fa-gear fa-fw"></i>
                Settings
            </a>
        </li>
    `);
    } // user is not logged in
}

nyaaUtility.storage.system.onload(() => {
    console.log(
        `%c${nyaaUtility.userName} - NyaaUtility Settings %c${JSON.stringify(
            nyaaUtility.storage.user,
            null,
            2
        )}`,
        "color: red;",
        "color: green;"
    );
});
