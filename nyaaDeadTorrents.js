function removeTorrent(torrent) {
    torrent.parentNode.removeChild(torrent);
    console.log(
        "Removed torrent: " +
            $(torrent).find("td:nth-child(2) > a").attr("title")
    );
}

//prettier-ignore
if (!window.location.href.match(/\/profile/)) {
    window.addEventListener("load", function () {
        const title = document.querySelector("title").innerText;
        const desc = document.querySelector('meta[property="og:description"]').content;
        const titleRegex = /Browse \:\: (?:(?:Nyaa)|(?:Sukebei))/;
        const descRegex = /(?:Search for )|(?:Torrents uploaded by )|(?:Sukebei homepage)/;
    
        if (title.match(titleRegex) || desc.match(descRegex)) {
            let torrents = document.querySelectorAll(".table-responsive > table > tbody > tr")
            let torrentsCount = torrents.length
            let removeRule = nyaaUtility.storage.user.options.NyaaRemoveRule
            if (removeRule == 'disabled') torrents = []
            for (let count = 0; count < torrents.length; count++) {
                let seeds = torrents[count].querySelector("td:nth-child(6)").innerText
                let leachers = torrents[count].querySelector("td:nth-child(7)").innerText
    
                if (seeds == "0" && removeRule == "seeds") {
                    removeTorrent(torrents[count])
                    torrentsCount = torrentsCount - 1
                } else if (leachers == "0" && removeRule == "leachers") {
                    removeTorrent(torrents[count])
                    torrentsCount = torrentsCount - 1
                } else if (seeds == "0" && leachers == "0" && removeRule == "both") {
                    removeTorrent(torrents[count])
                    torrentsCount = torrentsCount - 1
                }
            }
            if (torrentsCount <= 0 && nyaaUtility.storage.user.options.AutoNextPage) {
                let pagination = document.querySelectorAll("ul.pagination > li")
                let nextPage = pagination[pagination.length - 1].childNodes[0].href
                window.location.replace(nextPage)
            }
        }
    }, false)
}
