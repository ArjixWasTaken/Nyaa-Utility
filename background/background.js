//prettier-ignore
chrome.notifications.onClicked.addListener((notifID) => {
    chrome.tabs.create({ url: "https://nyaa.si/view/" + notifID });
    chrome.storage.sync.get("NyaaUtilSettings", async (result) => {
        delete result.NyaaUtilSettings.options.notifications[notifID]
        chrome.storage.sync.set({
            NyaaUtilSettings: result.NyaaUtilSettings,
        });
    })
})

const fetchWithErrorCatching = async (link, options = {}) => {
    const res = await fetch(link, options);
    if (res.status == 200) {
        return res;
    }
    return undefined;
};

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//prettier-ignore
const popNotification = async (data) => {
    switch (data.mode) {
        case "addition":
            const message = `${data.count} new comment${data.count > 1? 's' : ''}!`;
            chrome.notifications.create(key, {
                type: "basic",
                iconUrl: "assets/128.png",
                title: data.title,
                message,
                priority: 2,
            });
            return
        default:
            break
    }
};

//prettier-ignore
const getData = async (id) => {
    const link = "https://nyaa.si/view/" + id;
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
            return {};
        }
    }

    const data = await req.text();
    const html = $(data)
    return {
        comments: html.find("div.panel.panel-default.comment-panel").length,
        category: html.find(`.panel-body > .row a[href*="/?c="]:nth-child(2)`).attr('href').match(/(\d_\d)/)[1],
        title: html.find("h3.panel-title").text().trim(),
        id
    }
};

//prettier-ignore
setInterval(async () => {
    console.log('===============================\nChecking for new comments\n===============================')
    await chrome.storage.sync.get("NyaaUtilSettings", async (result) => {
        for ([key, value] of Object.entries(result.NyaaUtilSettings.options.subscribedThreads)) {
            let data = await getData(key)
            if (data == {}) {
                await sleep(5000)
                data = await getData(key)
                if (data == {}) {
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

            popNotification(data)
            result.NyaaUtilSettings.options.subscribedThreads[key] = data.comments;
            result.NyaaUtilSettings.options.notifications[key] = data
            chrome.storage.sync.set({
                NyaaUtilSettings: result.NyaaUtilSettings,
            });

            if (data.mode == "addition") {
                console.log(`${data.count} new comment${data.count > 1? 's' : ''}!`)
            } else {
                console.log(`${data.count} comment${data.count > 1? 's were deleted.' : ' was deleted'}.`)
            }

        }
        
    });
    console.log('===============================\nFinished checking for new comments\n===============================')
}, 1000 * 60 * 30); // every 30 minutes
