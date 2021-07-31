const isNumeric = (num) => {
    return !isNaN(num);
};


const parseQs = (link) => {
    if (!link.includes("?")) return {}
    const qs = link.split("?")[1]
    const args = qs.split('&').map(arg => {
        splitted = arg.split('=')
        return {
            key: splitted[0],
            value: splitted.length == 2 ? splitted[1] : null
        }
    })
    const arguments = {}
    args.forEach(arg => arguments[arg.key] = arg.value)
    return arguments
}


chrome.notifications.onClicked.addListener(async (notifID) => {
    let tabsLength = 0
    await chrome.tabs.query({}, (tabs) => {
        tabsLength = tabs.length
    })
    if (tabsLength == 0) return
    if (isNumeric(notifID)) {
        try {
            await chrome.tabs.create({
                url: "https://nyaa.si/view/" + notifID,
            });
            chrome.storage.local.get("NyaaUtilSettings", async (result) => {
                delete result.NyaaUtilSettings.options.notifications[notifID];
                chrome.storage.local.set({
                    NyaaUtilSettings: result.NyaaUtilSettings,
                });
            });
        } catch {}
    } else {
        chrome.storage.local.get("NyaaUtilSettings", async (result) => {
            for ([key, value] of Object.entries(
                result.NyaaUtilSettings.options.subscribedFeeds
            )) {
                if (value === notifID) {
                    chrome.tabs.create({ url: key });
                    break;
                }
            }
            delete result.NyaaUtilSettings.options.notifications[notifID];
            chrome.storage.local.set({
                NyaaUtilSettings: result.NyaaUtilSettings,
            });
        });
    }
});

const fetchWithErrorCatching = async (link, options = {}) => {
    try {
        const res = await fetch(link, options);
        if (res.status == 200) {
            return res;
        }
        return undefined;
    } catch {
        console.log("Failed to fetch:", link, options)
    }
    
};

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//prettier-ignore
const popNotification = async (data) => {
    try {
        switch (data.mode) {
            case "addition": {
                chrome.notifications.create(key, {
                    type: "basic",
                    iconUrl: "assets/128.png",
                    title: data.title,
                    message: `${data.count} new comment${data.count > 1? 's' : ''}!`,
                    priority: 2,
                });
                return
            }
                
            default: {
                let message = parseQs(data.message.trim()).q
                message = message && message.trim() != '' ? message : data.message
                message += ` - Feed`
                console.log(message)
                chrome.notifications.create(key, {
                    type: "basic",
                    iconUrl: "assets/128.png",
                    title: data.title,
                    message,
                    priority: 2,
                });
                return
            }
                
        }
    } catch {
        console.log("Notification Error: ", data)
    }
    
};

//prettier-ignore
const getData = async (id, rss=false) => {
    let link = "https://nyaa.si/view/"

    if (`${id}`.includes("rss")) {
        link = id
        rss = true
    } else {
        link += id
    }

    let req = await fetchWithErrorCatching(link, {
        headers: {
            "User-Agent": navigator.userAgent,
        },
    });
    if (req == undefined) {
        await sleep(5000);
        req = await fetchWithErrorCatching(link, {
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
        timestamp: html.querySelector('div.panel-body > div:nth-child(1) > div:nth-child(4)').dataset.timestamp,
        id        
    }
}

//prettier-ignore
setInterval(async () => {
    console.log('=========================\nChecking for new comments\n=========================')
    await chrome.storage.local.get("NyaaUtilSettings", async (result) => {
        for ([key, value] of Object.entries(result.NyaaUtilSettings.options.subscribedThreads)) {
            let data = await getData(key)
            if (Object.keys(data).length == 0) {
                await sleep(5000)
                data = await getData(key)
                if (Object.keys(data).length == 0) {
                    await sleep(5000)
                    continue
                }
            }

            if (value == data.comments) continue
            else if (value > data.comments) {
                data.count = value - data.comments
                data.mode = "deletion"
            } else {
                data.count = data.comments - value
                data.mode = "addition"
            }
            data.type = "comment"

            popNotification(data)
            result.NyaaUtilSettings.options.subscribedThreads[key] = data.comments;
            result.NyaaUtilSettings.options.notifications[key] = data
            chrome.storage.local.set({
                NyaaUtilSettings: result.NyaaUtilSettings,
            });

            if (data.mode == "addition") {
                console.log(`${data.count} new comment${data.count > 1? 's' : ''}!`)
            } else {
                console.log(`${data.count} comment${data.count > 1? 's were deleted.' : ' was deleted'}.`)
            }
        }
    });
    console.log('=========================\nFinished checking for new comments.\n=========================')
}, 1000 * 60 * 30); // every 30 minutes

//prettier-ignore
setInterval(async () => {
    console.log('=========================\nChecking for new items in the subscribed feeds.\n=========================')
    await chrome.storage.local.get("NyaaUtilSettings", async (result) => {
        for ([key, value] of Object.entries(result.NyaaUtilSettings.options.FeedsTracker)) {
            let data = await getData(key, true)

            if (data.length == 0) {
                await sleep(5000)
                data = await getData(key, true)
                if (data.length == 0) {
                    await sleep(5000)
                    continue
                }
            }

            const items = []

            if (value === data[0].id) continue
            else {
                for (const item of data) {
                    if (item.id == value) {
                        break
                    }
                    items.push(item)
                }
            }
            if (items.length > 0) {
                popNotification({
                    title: `${items.length} new torrent${items.length > 1 ? 's have' : ' has'} been detected.`,
                    message: key.replace('+', ' ').trim()
                })
                result.NyaaUtilSettings.options.FeedsTracker[key] = items[0].id
                result.NyaaUtilSettings.options.notifications[Date.now()] = items
                chrome.storage.local.set({
                    NyaaUtilSettings: result.NyaaUtilSettings,
                });
            }
        }
    });
    console.log('=========================\nFinished checking for new items in the subscribed feeds\n=========================')
}, 1000 * 60 * 15); // every 15 minutes
