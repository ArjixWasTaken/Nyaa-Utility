import React from "react";
import { Config } from "../Storage/api";
import { Module } from "./index"
import jQ from "jquery";
import cheerio from "cheerio";


function toInt(val: string): number {
    let conv = parseInt(val + "", 10);
    if (conv + "" == "NaN") return 0
    return conv
}


class NewCommentsNotifier implements Module {
    id = "bgCheckForNewComments"
    shouldRun = /(?:\/view\/(\d+)|(?:((p|q|s|o)=)|(user\/)|(\.si\/?)$))/
    injectWithConfig = true;  // we need to know the tag of the user first.
    backgroundTaskInterval = 35 * 60;  // 35 minutes

    options = (config: Config) => {
        return <></>
    }
    async inject(config?: Config) {
        if (config == undefined) return

        const url = window.location.href.match(/(https?:\/\/.*?view\/\d+)/)?.[1]

        if (url) {
            var isSubscribed = config.settings.newCommentsNotifier.some(tt => tt.url == url)

            let found = false
            for (const torrent of config.settings.newCommentsNotifier) {
                if (torrent.url == url) {
                    isSubscribed = true
                    found = true
                    break
                }
            }
            if (!found) isSubscribed = false


            const button = document.createElement('button')
            button.type = "button"
            button.className = "btn btn-xs btn-danger pull-right"
            button.style.marginRight = "10px"
            button.style.border = "none"
            button.style.fontSize = "80%"
            button.style.height = "22px"
            button.innerText = isSubscribed ? "Unsubscribe" : "Subscribe"
            button.style.backgroundColor = isSubscribed ? "" : "#4CAF50"

            setInterval(() => {
                // to keep this updated on multiple tabs.
                isSubscribed = config.settings.newCommentsNotifier.some(tt => tt.url == url)
                button.style.backgroundColor = isSubscribed ? "" : "#4CAF50"
                button.innerText = isSubscribed ? "Unsubscribe" : "Subscribe"
            }, 200)

            button.onclick = async () => {
                if (!isSubscribed) {
                    config.settings.newCommentsNotifier.push({url: url, commentsCount: Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel")).length})
                } else {
                    config.settings.newCommentsNotifier = config.settings.newCommentsNotifier.filter(t => t.url != url)
                }

                await config.saveConfig()
            }

            const lastElem = jQ("body > div > div:nth-child(1) > div.panel-footer.clearfix > button, body > div > div:nth-child(1) > div.panel-footer.clearfix > a").last()
            lastElem.after(button)

        } else {
            // we are not in a torrent, but at the browse page

            let torrents = Array.from(
                document.querySelectorAll(
                  "body > div > div.table-responsive > table > tbody > tr"
                )
              ) as Array<HTMLElement>;


            for (const torrent of torrents) {
                const torrentUrl = (torrent.querySelector(`a[href*="/view/"]`) as HTMLAnchorElement).href.match(/(https?:\/\/.*?view\/\d+)/)?.[1]
                if (!torrentUrl) continue;

                let isSubscribed = config.settings.newCommentsNotifier.some(tt => tt.url == torrentUrl)

                const button = document.createElement("button")
                button.type = "button"
                button.className = "btn btn-xs btn-danger pull-right"
                button.style.marginRight = "10px"
                button.style.border = "none"
                button.style.fontSize = "80%"
                button.style.height = "20px"
                button.style.width = "75px"
                button.style.float = "right"
                button.innerText = isSubscribed ? "Unsubscribe" : "Subscribe"
                button.style.backgroundColor = isSubscribed ? "" : "#4CAF50"

                setInterval(() => {
                    // to keep this updated on multiple tabs.
                    let isSubscribedNew = config.settings.newCommentsNotifier.some(tt => tt.url == torrentUrl)
                    if (isSubscribed != isSubscribedNew) {
                        isSubscribed = isSubscribedNew
                        button.style.backgroundColor = isSubscribed ? "" : "#4CAF50"
                        button.innerText = isSubscribed ? "Unsubscribe" : "Subscribe"
                    }
                }, 200)


                button.onclick = async () => {
                    if (!isSubscribed) {
                        config.settings.newCommentsNotifier.push( {
                            url: torrentUrl,
                            commentsCount: toInt(jQ(torrent).find(`a.comments`).text())
                        })
                    } else {
                        config.settings.newCommentsNotifier = config.settings.newCommentsNotifier.filter(tt => tt.url != torrentUrl)
                    }

                    await config.saveConfig()
                }

                jQ(torrent).find(`[colspan="2"] > a`).first().before(button)
            }
        }
    }

    async backgroundTask(config: Config) {
        let torrents = Array.from(config.settings.newCommentsNotifier)
        let updateCount = 0
        let newCommentsCount = 0

        for (const torrent of torrents) {
            const html = await (await fetch(torrent.url)).text()
            const $ = cheerio.load(html)
            const comments = $("div.panel.panel-default.comment-panel").toArray().length

            if (torrent.commentsCount != comments) {
                updateCount++
                if (comments - torrent.commentsCount > 0) {
                    newCommentsCount += comments - torrent.commentsCount
                }


                for (const c of config.settings.newCommentsNotifier) {
                    if (c.url == torrent.url) {
                        c.commentsCount = comments
                        break
                    }
                }
            }
        }

        if (updateCount > 0) {
            await config.saveConfig()
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Found new comments on nyaa.",
                message: `${newCommentsCount} new comment${newCommentsCount > 1 ? "s" : ""} on ${updateCount} torrent${updateCount > 1 ? "s" : ""}.`,
                priority: 2,
            });
        }
        // TODO: Implement a notification dashboard where this will be saved in.
    }
}

export default NewCommentsNotifier
