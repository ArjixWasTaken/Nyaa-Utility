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
