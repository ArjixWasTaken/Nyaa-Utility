var chrome.downloads.search({}, function (downloads) {
    for i in downloads{
        console.log(downloads[i])
    }
})