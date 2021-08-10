//prettier-ignore
setInterval(async () => {
    console.log('=========================\nChecking for new comments\n=========================')
    await chrome.storage.local.get("NyaaUtilSettings", async (result) => {
        for ([torrent, prevComments] of Object.entries(result.NyaaUtilSettings.options.subscribedThreads)) {
            let dataComment = await getData(torrent)
            if (Object.keys(dataComment).length == 0) {
                await sleep(5000)
                dataComment = await getData(torrent)
                if (Object.keys(dataComment).length == 0) {
                    await sleep(5000)
                    continue
                }
            }

            if (prevComments == dataComment.comments) continue
            else if (prevComments > dataComment.comments) {
                dataComment.count = prevComments - dataComment.comments
                dataComment.mode = "deletion"
            } else {
                dataComment.count = dataComment.comments - prevComments
                dataComment.mode = "addition"
            }
            dataComment.type = "comment"

            popNotification(dataComment)
            result.NyaaUtilSettings.options.subscribedThreads[torrent] = dataComment.comments;
            result.NyaaUtilSettings.options.notifications[torrent] = dataComment
            await chrome.storage.local.set({
                NyaaUtilSettings: result.NyaaUtilSettings,
            });

            if (dataComment.mode == "addition") {
                console.log(`${dataComment.count} new comment${dataComment.count > 1? 's' : ''}!`)
            } else {
                console.log(`${dataComment.count} comment${dataComment.count > 1? 's were deleted.' : ' was deleted'}.`)
            }
        }
    });
    console.log('=========================\nFinished checking for new comments.\n=========================')
}, 1000 * 60 * 15); // every 15 minutes
