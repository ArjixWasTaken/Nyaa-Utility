import React, { useState, useEffect } from "react";
import { Config, torrent } from "../Storage/api";
import { Module } from "./index"
import jQ from "jquery";
import cheerio from "cheerio";


class NewCommentsNotifier implements Module {
    id = "bgCheckForNewComments"
    shouldRun = /\/view\/(\d+)/
    injectWithConfig = true;  // we need to know the tag of the user first.
    backgroundTaskInterval = 35 * 60;  // 35 minutes

    options = (config: Config) => {
        return <></>
    }
    async inject(config?: Config) {
        if (config == undefined) return

        const torrentId = window.location.href.match(this.shouldRun)?.[1]
        const id = torrentId ? parseInt(torrentId, 10) : undefined

        if (id) {
            // should always be true, but oh well
            var isSubscribed = false

            let found = false
            for (const torrent of config.settings.newCommentsNotifier) {
                if (torrent.id == id) {
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
                let found = false
                for (const torrent of config.settings.newCommentsNotifier) {
                    if (torrent.id == id) {
                        isSubscribed = true
                        found = true
                        break
                    }
                }
                if (!found) isSubscribed = false
                button.style.backgroundColor = isSubscribed ? "" : "#4CAF50"
                button.innerText = isSubscribed ? "Unsubscribe" : "Subscribe"
            }, 200)

            button.onclick = async () => {
                if (!isSubscribed) {
                    config.settings.newCommentsNotifier.push({id: id, commentsCount: Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel")).length})
                } else {
                    config.settings.newCommentsNotifier = config.settings.newCommentsNotifier.filter(t => t.id != id)
                }

                await config.saveConfig()
                window.location.reload()
            }

            const lastElem = jQ("body > div > div:nth-child(1) > div.panel-footer.clearfix > button, body > div > div:nth-child(1) > div.panel-footer.clearfix > a").last()
            lastElem.after(button)

        }
    }

    async backgroundTask(config: Config) {
        let torrents = Array.from(config.settings.newCommentsNotifier)
        let updateCount = 0
        let newCommentsCount = 0

        for (const torrent of torrents) {
            const html = await (await fetch(`https://nyaa.si/view/${torrent.id}`)).text()
            const $ = cheerio.load(html)
            const comments = $("div.panel.panel-default.comment-panel").toArray().length

            if (torrent.commentsCount != comments) {
                updateCount++
                if (comments - torrent.commentsCount > 0) {
                    newCommentsCount += comments - torrent.commentsCount
                }


                for (const c of config.settings.newCommentsNotifier) {
                    if (c.id == torrent.id) {
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
