import cheerio from "cheerio";


interface NyaaComment {
    author: string | undefined;
    avatar: string | undefined;
    date: string;
    content: string;
}

interface NyaaTorrent {
    id: string;
    title: string;
    author: string | undefined;
    date: string | undefined;

    hash: string | undefined;
    magnet: string | undefined;
    torrentFile: string | undefined;

    comments: NyaaComment[];
    description: string;
}

const getTorrentMeta = async (torrentUrl: string): Promise<NyaaTorrent | undefined> => {
    const req =  await fetch(torrentUrl, {
        headers: {
            "User-Agent": navigator.userAgent,
        },
    })

    if (!req.ok) return

    const $ = cheerio.load(await req.text())


    const panel = $(".panel-body")

    const title = $(".panel-title").text()?.trim()
    const date = panel.find(".row:nth-child(2) > .data-timestamp").attr("data-timestamp")?.trim()
    const author = panel.find(`.row:nth-child(2) > div > a[title="Trusted"], .row:nth-child(2) > div > a[title="User"]`).attr("href")


    const hash = panel.find(".row:last-of-type > .col-md-5").text()?.trim()
    const magnet = $(`.panel-footer > [href^="magnet:"]`).attr("href")
    const torrentFile = $(`.panel-footer > a[href$=".torrent"]`).attr("href")

    const description = $(`#torrent-description[markdown-text]`).text()?.trim()

    const comments = $("div.panel.panel-default.comment-panel").toArray().map(comment => {
        const node = $(comment)
        return {
            author: node.find("a").first().text(),
            avatar: node.find("img").attr("src"),
            date: node.find(".data-timestamp").text(),
            content: node.find(".comment-content").text()
        }
    })

    return {
        id: torrentUrl.match(/(https?:\/\/.*?view\/\d+)/)![1],
        author,
        title,
        date,

        hash,
        magnet,
        torrentFile,

        comments,
        description
    }
}


export { getTorrentMeta, NyaaTorrent, NyaaComment }