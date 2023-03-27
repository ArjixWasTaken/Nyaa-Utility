import deepmerge from "deepmerge";
import _ from "lodash";

import browser from "webextension-polyfill";

export interface Torrent {
    url: string
    commentsCount: number
}


export interface FeedItem {
    url: string
    lastTorrentId: string
}


export interface NewTorrentsNotifier {
    enabled: boolean
    feeds: FeedItem[]
}

enum Scope {
    Background,
    Popup,
    Web,
    Content
}

const getScope = (): Scope => {
    // https://stackoverflow.com/a/45310299
    if (browser && browser.extension) {
        if (browser.extension.getBackgroundPage && browser.extension.getBackgroundPage() === window) return Scope.Background;
        else return Scope.Popup;
    } else if (!browser.runtime || !browser.runtime.onMessage) {
        return Scope.Web
    } else {
        return Scope.Content
    }
}


const filterOutDuplicates = (torrents: Array<Torrent>): Array<Torrent> => {
    // takes in an array of torrents and filters out duplicate objects, since Set cant do that
    const ids = Array<string>()

    return torrents.filter(i => {
        if (!i) return;
        if (ids.includes(i.url)) return;

        ids.push(i.url)
        return 1
    }) as Array<Torrent>
}

interface deadTorrentsRemover {
    enabled: boolean
    minimum: [number, number]
    removeCondition: String
}

interface settings {
    blockedUsers: string[]
    deadTorrentsRemover: deadTorrentsRemover
    newCommentsNotifier: Array<Torrent>,
    newTorrentsNotifier: NewTorrentsNotifier
}

const defaults = JSON.stringify(<settings>{
    blockedUsers: [],
    deadTorrentsRemover: <deadTorrentsRemover>{
        enabled: false,
        minimum: [0, 0],
        removeCondition: "both"
    },
    newCommentsNotifier: Array<Torrent>(),
    newTorrentsNotifier: <NewTorrentsNotifier>{
        enabled: true,
        feeds: []
    }
})

class Config {
    username: string
    settings = JSON.parse(defaults) as settings
    initialized: Boolean = false
    __listeners: Function[]

    onload(callback: Function): void {
        if (!this.initialized) {
            setTimeout(() => {
                this.onload(callback);
            }, 100);
        } else {
            callback();
        }
    }

    async saveConfig() {
        browser.storage.local.set({ NyaaUtilitityRewriteV2: this.settings })
    }

    async loadConfig() {
        const config = await browser.storage.local.get("NyaaUtilitityRewriteV2");

        if (_.isEmpty(config)) {
            // no config, set the defaults
            await this.saveConfig()
        } else {
            this.settings = deepmerge(JSON.parse(defaults), config.NyaaUtilitityRewriteV2) as settings

            // Making sure that all the data is valid, because it is possible that deepmerge messed it up.
            this.settings.newCommentsNotifier = filterOutDuplicates(this.settings.newCommentsNotifier)
            this.settings.deadTorrentsRemover.minimum = config.NyaaUtilitityRewriteV2.deadTorrentsRemover.minimum.splice(0, 2) as [number, number]
            let tmp: string[] = []
            this.settings.newTorrentsNotifier.feeds = ((config.NyaaUtilitityRewriteV2.newTorrentsNotifier.feeds ?? []) as Array<FeedItem>).filter(f => {
                if (tmp.includes(f.url)) return false
                tmp.push(f.url); return true
            })
        }
        console.log("Nyaa-Util[RewriteV2]: Config", this.settings)
    }

    async liveSync() {
        // Keep the copy of the config up to date.
        browser.storage.onChanged.addListener((_changes: object) => {
            this.loadConfig()
            this.__listeners.forEach(c => c())
        })
    }

    async onChange(callback: Function) {
        this.__listeners.push(callback)
    }

    constructor() {
        this.username = getScope() == Scope.Content ? (document.querySelector("i.fa-user")!.parentNode as HTMLElement).innerText.trim() : "Guest"

        if (Scope.Content && this.username != "Guest") {
            this.username = `${window.location.hostname}/user/${this.username}`
        }

        console.log("Username", this.username);

        this.__listeners = []

        this.loadConfig().then(() => {
            this.initialized = true
        })
    }
}

const config = new Config()

export default config

export {
    config,
    Config,
    getScope,
    Scope
}