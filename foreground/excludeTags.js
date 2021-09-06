nyaaUtility.storage.system.onload(() => {
    let torrents = document.querySelectorAll(
        ".table-responsive > table > tbody > tr"
    );
    let torrentsCount = torrents.length;
    let nthChild = 0;
    let blockedTags = nyaaUtility.storage.user.options.blockedTags;
    if (blockedTags.length == 0) {
        return;
    }

    torrentsLoop: while (torrentsCount != nthChild) {
        nthChild++;
        let torrentTitle = document
            .querySelector(
                `.table-responsive > table > tbody > tr:nth-child(${nthChild})`
            )
            .querySelector("td:nth-child(2) > a").innerText;
        let tags = torrentTitle.match(/[\[\(](.*?)[\]\)]/g)?.map((tag) => {
            return tag
                .replace(/[\[\(\]\)]/g, "")
                .toLowerCase()
                .trim();
        });
        if (!tags) continue;
        for (let tag of tags) {
            if (blockedTags.includes(tag)) {
                document
                    .querySelector(
                        `.table-responsive > table > tbody > tr:nth-child(${nthChild})`
                    )
                    .remove();
                torrentsCount = document.querySelectorAll(
                    `.table-responsive > table > tbody > tr`
                ).length;
                nthChild--;
                continue torrentsLoop;
            }
        }
    }
    if (torrentsCount <= 0 && nyaaUtility.storage.user.options.AutoNextPage) {
        let pagination = document.querySelectorAll("ul.pagination > li");
        let nextPage = pagination[pagination.length - 1]?.childNodes?.[0]?.href;
        if (nextPage) {
            window.location.replace(nextPage);
        }
    }
});
