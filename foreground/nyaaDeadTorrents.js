function removeTorrent(torrent) {
    torrent.parentNode.removeChild(torrent);
    console.log(
        "Removed torrent: " +
            $(torrent).find("td:nth-child(2) > a").attr("title")
    );
}

const main = () => {
    let torrents = document.querySelectorAll(
        ".table-responsive > table > tbody > tr"
    );
    let torrentsCount = torrents.length;
    let removeRule = nyaaUtility.storage.user.options.NyaaRemoveRule;
    if (removeRule == "disabled") {
        return;
    }

    for (let count = 0; count < torrents.length; count++) {
        let seeds = torrents[count].querySelector("td:nth-child(6)")?.innerText;
        let leachers =
            torrents[count].querySelector("td:nth-child(7)")?.innerText;

        switch (removeRule) {
            case "both":
                if (seeds == "0" && leachers == "0") {
                    removeTorrent(torrents[count]);
                    torrentsCount = torrentsCount - 1;
                }
                break;

            case "seeds":
                if (seeds == "0") {
                    removeTorrent(torrents[count]);
                    torrentsCount = torrentsCount - 1;
                }
                break;

            case "leachers":
                if (leachers == "0") {
                    removeTorrent(torrents[count]);
                    torrentsCount = torrentsCount - 1;
                }
                break;

            default:
                break;
        }
    }
    if (torrentsCount <= 0 && nyaaUtility.storage.user.options.AutoNextPage) {
        let pagination = document.querySelectorAll("ul.pagination > li");
        let nextPage = pagination[pagination.length - 1]?.childNodes?.[0]?.href;
        if (nextPage) {
            window.location.replace(nextPage);
        }
    }
};

nyaaUtility.storage.system.onload(main);
