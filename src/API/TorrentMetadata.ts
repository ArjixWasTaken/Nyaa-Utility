import cheerio, { Cheerio, CheerioAPI, Element } from "cheerio";


interface NyaaComment {
    author: string | undefined;
    avatar: string | undefined;
    date: string | undefined;
    content: string;
}

interface NyaaTorrent {
    id: string;
    title: string;
    author: string | undefined;
    date: string | undefined;
    seeds: string | undefined;
    leeches: string | undefined;
    completed: string | undefined;
    files: Folder | File

    hash: string | undefined;
    magnet: string | undefined;
    torrentFile: string | undefined;
    filesize: string | undefined;

    comments: NyaaComment[];
    description: string;
}



interface FolderNode {
    type: string;
    name: string;
    content: [FolderNode[], File[]][]
}

interface Folder {
    type: string;
    name: string;
    folders: Folder[]
    files: File[]
}


interface File {
    type: string;
    name: string;
    size: string;
}


// prettier-ignore
const parseFileFolderTree = (element: Cheerio<Element>, dom: CheerioAPI) => {

    const content: [FolderNode[], File[]][] = []

    dom(element).find("> li").toArray().forEach((item) => {
        const folders: FolderNode[] = dom(item).find("> ul").toArray().map((folder) => {
            const name = dom(folder).parent().find("> a").first().text().trim()

            return <FolderNode> {
                type: "folder",
                name,
                content: parseFileFolderTree(dom(folder), dom)
            }
        });
        const files: File[] = dom(item).find("> li").toArray().map((file) => {
            const name = dom(file).text().trim()
            return <File> {
                type: "file",
                name,
                size: dom(file).find(".file-size").text().trim().replace(/[\(\)]/g, "")
            }
        });

        if (dom(item).find("> i").first().attr("class")?.includes("fa-file")) {
            files.push( <File> {
                type: "file",
                name: dom(item).text().trim().replace(dom(item).find(".file-size").text().trim(), ""),
                size: dom(item).find(".file-size").text().trim().replace(/[\(\)]/g, "")
            })
        }

        if (files.length > 0 || folders.length > 0) {
            content.push([folders, files])
        }
    })

    return content
}


const getFileFolderTree = (element: Cheerio<Element>, dom: CheerioAPI): Folder | File => {
    const tree = parseFileFolderTree(element, dom);

    console.log(tree)
    const isSingleFile = tree[0][1].length > 0;

    if (isSingleFile) {
        return tree[0][1][0] as File;
    }

    const folder = tree[0][0][0] as any;
    const copy = JSON.parse(JSON.stringify(tree[0][0][0]));

    delete folder.content;

    folder.folders = [].concat(...copy.content.map((c: [FolderNode, File]) => c[0]));
    folder.files = [].concat(...copy.content.map((c: [FolderNode, File]) => c[1]));

    const inner = (foldr: any) => {
        const bak = JSON.parse(JSON.stringify(foldr));
        delete foldr.content;

        foldr.folders = [].concat(...bak.content.map((c: [FolderNode, File]) => c[0]));
        foldr.files = [].concat(...bak.content.map((c: [FolderNode, File]) => c[1]));
        foldr.folders = foldr.folders.map(inner);

        return foldr;
    };

    folder.folders = folder.folders.map(inner);

    return folder as Folder;
};



const getTorrentMeta = async (torrentUrl: string): Promise<NyaaTorrent | undefined> => {
    const req =  await fetch(torrentUrl, {
        headers: {
            "User-Agent": navigator.userAgent,
        },
    })

    if (!req.ok) return

    const $ = cheerio.load(await req.text())


    const panel = $(".panel-body")

    const title = $(".panel-title").first().text()?.trim()
    const date = panel.find(".data-timestamp").first().attr("data-timestamp")?.trim()
    const author = panel.find(`.row:nth-child(2) > div > a[title="Trusted"], .row:nth-child(2) > div > a[title="User"]`).attr("href")


    const hash = panel.find(".row:last-of-type > .col-md-5").text()?.trim()
    const magnet = $(`.panel-footer > [href^="magnet:"]`).attr("href")
    const torrentFile = $(`.panel-footer > a[href$=".torrent"]`).attr("href")
    const filesize = panel.find(`.row:nth-child(4) > .col-md-5`).first().text()

    const description = $(`#torrent-description[markdown-text]`).text()?.trim()

    const comments = $("div.panel.panel-default.comment-panel").toArray().map(comment => {
        const node = $(comment)
        return {
            author: node.find("a").first().text(),
            avatar: node.find("img").attr("src"),
            date: node.find("[data-timestamp]").attr("data-timestamp"),
            content: node.find(".comment-content").text()
        }
    })

    return {
        id: torrentUrl.match(/view\/(\d+)/)![1],
        author,
        title,
        date,
        seeds: undefined,
        leeches: undefined,
        completed: undefined,
        files: getFileFolderTree($(".torrent-file-list > ul").first(), $),

        hash,
        magnet,
        torrentFile,
        filesize,

        comments,
        description
    }
}


export { getTorrentMeta, NyaaTorrent, NyaaComment }
