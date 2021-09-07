function removeTorrent(torrent) {
    torrent.parentNode.removeChild(torrent);
    console.log(
        "Removed torrent due to blocked tag: " +
            $(torrent).find("td:nth-child(2) > a").attr("title")
    );
}

nyaaUtility.storage.system.onload(() => {
    let torrents = document.querySelectorAll(
        ".table-responsive > table > tbody > tr"
    );
    let torrentsCount = torrents.length;
    // let nthChild = 0;
    let blockedTags = nyaaUtility.storage.user.options.blockedTags;
    if (blockedTags.length == 0) {
        return;
    }

    document
        .querySelectorAll(".table-responsive > table > tbody > tr")
        .forEach((torrent) => {
            let torrentTitle = torrent
                .querySelector("td:nth-child(2)")
                .innerText.split("\n");
            if (torrentTitle.length == 2) torrentTitle = torrentTitle[1];
            else torrentTitle = torrentTitle[0];

            let tags = torrentTitle.match(/[\[\(](.*?)[\]\)]/g)?.map((tag) => {
                return tag
                    .replace(/[\[\(\]\)]/g, "")
                    .toLowerCase()
                    .trim();
            });
            if (!tags) {
                console.log(torrentTitle);
                return;
            }

            for (let tag of tags) {
                if (blockedTags.includes(tag)) {
                    removeTorrent(torrent);
                    torrentsCount--;
                    return;
                }
            }
        });

    if (torrentsCount <= 0 && nyaaUtility.storage.user.options.AutoNextPage) {
        let pagination = document.querySelectorAll("ul.pagination > li");
        let nextPage = pagination[pagination.length - 1]?.childNodes?.[0]?.href;
        if (nextPage) {
            window.location.replace(nextPage);
        }
    }
});
