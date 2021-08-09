chrome.notifications.onClicked.addListener(async (data) => {
    // open torrent page
    let tabsLength = 0;
    await chrome.tabs.query({}, (tabs) => {
        tabsLength = tabs.length;
    });
    if (tabsLength == 0) return;

    if (isNumeric(data)) {
        console.log("comment notif clicked: ", data);
        try {
            await chrome.tabs.create({
                url: "https://nyaa.si/view/" + data,
            });
            chrome.storage.local.get("NyaaUtilSettings", async (result) => {
                delete result.NyaaUtilSettings.options.notifications[notifID];
                chrome.storage.local.set({
                    NyaaUtilSettings: result.NyaaUtilSettings,
                });
            });
        } catch {}
    }
});

chrome.notifications.onClicked.addListener(async (data) => {
    let tabsLength = 0;
    await chrome.tabs.query({}, (tabs) => {
        tabsLength = tabs.length;
    });
    if (tabsLength == 0) return;

    if (!isNumeric(data)) {
        console.log("feed notif clicked: ", data);
        await chrome.storage.local.get("NyaaUtilSettings", async (result) => {
            for ([key, value] of Object.entries(
                result.NyaaUtilSettings.options.subscribedFeeds
            )) {
                if (value === data) {
                    chrome.tabs.create({ url: key });
                    break;
                }
            }
            delete result.NyaaUtilSettings.options.notifications[data];
            await chrome.storage.local.set({
                NyaaUtilSettings: result.NyaaUtilSettings,
            });
        });
        await chrome.tabs.create({
            url: "https://nyaa.si/notifications",
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.injectScript) {
        chrome.tabs.executeScript(
            sender.tab.id,
            { file: message.filename },
            function () {
                sendResponse({ done: true });
            }
        );
        return true;
    }
});
