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
}, 1000 * 60 * 3); // every 15 minutes
