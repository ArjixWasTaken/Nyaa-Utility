import React from "react";
import { Config } from "../Storage/api";
import { Module } from "./index"
import jQ from "jquery";
import cheerio from "cheerio";


class NewTorrentsNotifier implements Module {
    id = "bgCheckForNewTorrents"
    shouldRun = /((p|q|s|o)=)|(user\/)|(\.si\/?)$/
    injectWithConfig = false; // We don't wait for the config because we want to have the buttons appear as soon as possible.
    backgroundTaskInterval = 35 * 60;  // 35 minutes

    options = (config: Config) => {
        return <></> // TODO: Add config for bgNewTorrentsNotifier
    }

    async inject(config?: Config) {
        if (!config?.settings?.newTorrentsNotifier?.enabled) return

        const feedUrl = (document.querySelector(`[href*="rss"]`) as HTMLAnchorElement).href;
        let torrents = Array.from(
            document.querySelectorAll(
              "body > div > div.table-responsive > table > tbody > tr"
            )
          ) as Array<HTMLElement>;

        var isFollowed = config?.settings?.newTorrentsNotifier?.feeds?.some(f => f.url == feedUrl)
        var isFollowedNew = null


        const onclick = async () => {
            if (config == undefined) return


            if (isFollowed) {
                config.settings.newTorrentsNotifier.feeds = config.settings.newTorrentsNotifier.feeds.filter(f => f.url != feedUrl)
            } else {
                config.settings.newTorrentsNotifier.feeds.push({
                    url: feedUrl,
                    lastTorrentId: (torrents[0].querySelector(`a[href*="/view/"]`) as HTMLAnchorElement).href.match(/https?:\/\/.*?view\/(\d+)/)?.[1] as string
                })
            }
            isFollowed = config.settings.newTorrentsNotifier.feeds.some(f => f.url == feedUrl)

            jQ("#followFeedMobile").text(`${isFollowed ? "Unfollow" : "Follow" } Feed`)
            jQ(`#followFeedMobile, #followFeed`).css("background-color", isFollowed ? "red" : "")
            await config.saveConfig()
        }


        {
            // Making the buttons
            jQ("#navbar > form > div").append(
                `<div class="input-group-btn search-btn">
                    <button disabled class="btn btn-primary" id="followFeed" type="button">
                        <i class="fa fa-rss fa-fw"></i>
                    </button>
                </div>`,
            );

            jQ(`#navbar > div > form`).append(`
                <button disabled class="btn btn-primary form-control" id="followFeedMobile" type="button">
                    <i class="fa fa-rss fa-fw"></i>
                    Follow Feed
                </button>`
            );
            jQ(`#followFeedMobile, #followFeed`).on("click", onclick).css("background-color", "");
        }

        const run = () => {
            if (config != undefined) {
                jQ(`#followFeedMobile, #followFeed`).removeAttr("disabled");
                isFollowed = config.settings.newTorrentsNotifier.feeds.some(f => f.url == feedUrl)

                jQ("#followFeedMobile").text(`${isFollowed ? "Unfollow" : "Follow" } Feed`)
                jQ(`#followFeedMobile, #followFeed`).css("background-color", isFollowed ? "red" : "")

                config.onChange(() => {
                    isFollowedNew = config.settings.newTorrentsNotifier.feeds.some(f => f.url == feedUrl)
        
                    if (isFollowed != isFollowedNew) {
                        isFollowed = isFollowedNew
        
                        jQ("#followFeedMobile").text(`${isFollowed ? "Unfollow" : "Follow" } Feed`)
                        jQ(`#followFeedMobile, #followFeed`).css("background-color", isFollowed ? "red" : "")
                    }
                })
            } else {
                // We use setTimeout because we only want this to run once after the config has loaded.
                setTimeout(run, 100);
            }
        }

        setTimeout(run, 100);
    }

    async backgroundTask(config: Config) {
        if (!config.settings.newTorrentsNotifier.enabled) return

        let feeds = Array.from(config.settings.newTorrentsNotifier.feeds) // We make a copy because we don't want accidents.
        let updateCount = 0
        let newTorrentsCount = 0

        for (const feed of feeds) {
            const html = await (await fetch(feed.url, {
                headers: {
                    "User-Agent": navigator.userAgent,
                },
            })).text()
            const $ = cheerio.load(html)
            const torrentIds = $("item").toArray()
              .map(e => $(e).find(`guid`).first().text()
              .match(/view\/(\d+)/)?.[1])

            const lastTorrentId = torrentIds[0]
            if (lastTorrentId == undefined) break

            if (feed.lastTorrentId != lastTorrentId) {
                updateCount++

                for (const torrentId of torrentIds) {
                    if (torrentId == feed.lastTorrentId) break
                    newTorrentsCount++
                }

                for (let f of config.settings.newTorrentsNotifier.feeds) {
                    if (f.url == feed.url) {
                        f.lastTorrentId = lastTorrentId + ""
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
                title: "Found new torrents on nyaa.",
                message: `${newTorrentsCount} new torrent${newTorrentsCount > 1 ? "s" : ""} on ${updateCount} feed${updateCount > 1 ? "s" : ""}.`,
                priority: 2,
            });
        }
        // TODO: Implement a notification dashboard where this will be saved in.
    }
}

export default NewTorrentsNotifier
