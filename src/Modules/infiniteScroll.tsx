import { Config } from "../Storage/api";
import { Module } from "./index"
import jQ from "jquery";
import cheerio from "cheerio";

class InfiniteScroll implements Module {
    id = "InfiniteScroll"
    shouldRun = /(?:\/view\/(\d+)|(?:((p|q|s|o)=)|(user\/)|(\.si\/?)$))/
    injectWithConfig = true;

    async getNextPage(page: number | null): Promise<string[]> {
        try {
            const nextPage = page ? page + 1 : 2
            const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
            const params = new URLSearchParams(window.location.search)
            params.set("p", `${nextPage}`)

            const nextPageLink = `${baseUrl}?${params.toString()}`
            const html = await (await fetch(nextPageLink, {
                headers: {
                    "User-Agent": navigator.userAgent,
                },
            })).text()

            const $ = cheerio.load(html)
            return $(`.table-responsive > table > tbody > tr`).toArray().map(e => $(e).html()?.replace(/\t/g, "") ?? "")
        } catch {
            return []
        }
    }

    async inject(config?: Config) {
        if (config == undefined) return;
        (document.querySelector(".center > nav > ul.pagination")! as HTMLElement).style.display = "none"

        const paginationLinks = Array.from(document.querySelectorAll(`ul.pagination > li > a`)) as HTMLElement[]
        var hasNextPage = !paginationLinks[paginationLinks.length - 1].parentElement!.classList.contains("disabled")

        if (!hasNextPage) return;

        const params = new URLSearchParams(window.location.search)

        const torrents = (Array.from(
            document.querySelectorAll(
                "body > div > div.table-responsive > table > tbody > tr"
            )
        ) as Array<HTMLElement>).map(t => {
            const torrentUrl = (t.querySelector(`a[href*="/view/"]`) as HTMLAnchorElement).href.match(/(https?:\/\/.*?view\/\d+)/)?.[1]
            return torrentUrl
        }).filter(i => i);

        var fetchingNextPage = false

        const observer = new IntersectionObserver((entries) => {
            if (!hasNextPage || fetchingNextPage) return;
            if (entries[0].isIntersecting) {
                console.log("Fetching next page if available...");
                fetchingNextPage = true

                this.getNextPage(parseInt(params.get("p") ?? "1")).then(nextTorrents => {
                    if (nextTorrents.length == 0) {
                        hasNextPage = false;
                        return
                    }

                    for (const torrent of nextTorrents) {
                        const pathname = torrent.match(/href=\"(.*?\/view\/\d+).*?\"/)?.[1]
                        if (!pathname) continue;

                        const link = `${window.location.protocol}//${window.location.host}${pathname}`
                        if (torrents.includes(link)) continue
                        torrents.push(link)

                        const tr = document.createElement("tr")
                        tr.className = "default"
                        tr.innerHTML = torrent

                        document.querySelector(`.table-responsive > table > tbody`)?.appendChild(tr)
                    }
                })
                if (hasNextPage) {
                    params.set("p", `${parseInt(params.get("p") ?? "1") + 1}`)
                    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
                    const nextPageLink = `${baseUrl}?${params.toString()}`

                    window.history.replaceState(null, document.title, nextPageLink);
                }
                fetchingNextPage = false
            }
        }, {
            root: null,
            rootMargin: "30%",
            threshold: 0.5
        });
        observer.observe(document.querySelector("footer")!);
    }
}

export default InfiniteScroll