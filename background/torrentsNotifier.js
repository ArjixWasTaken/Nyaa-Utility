//prettier-ignore
setInterval(async () => {
    console.log('=========================\nChecking for new items in the subscribed feeds.\n=========================')
    await chrome.storage.local.get("NyaaUtilSettings", async (result) => {
        for ([link, torrentId] of Object.entries(result.NyaaUtilSettings.options.FeedsTracker)) {
            let dataTorrents = await getData(link, true)

            if (dataTorrents.length == 0) {
                await sleep(5000)
                dataTorrents = await getData(link, true)
                if (dataTorrents.length == 0) {
                    await sleep(5000)
                    continue
                }
            }

            const items = []

            if (torrentId === dataTorrents[0].id) continue
            else {
                for (const item of dataTorrents) {
                    if (item.id == torrentId) {
                        break
                    }
                    items.push(item)
                }
            }
            if (items.length > 0) {
                console.log(torrentId, items[0].id, items)
                popNotification({
                    title: `${items.length} new torrent${items.length > 1 ? 's have' : ' has'} been detected.`,
                    message: link.replace('+', ' ').trim()
                })
                result.NyaaUtilSettings.options.FeedsTracker[link] = items[0].id
                result.NyaaUtilSettings.options.notifications[Date.now()] = items
                await chrome.storage.local.set({
                    NyaaUtilSettings: result.NyaaUtilSettings,
                });
            }
        }
    });
    console.log('=========================\nFinished checking for new items in the subscribed feeds\n=========================')
}, 1000 * 60 * 15); // every 15 minutes
