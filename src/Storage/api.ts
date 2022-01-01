import deepmerge from "deepmerge";
import _ from "lodash";

interface torrent {
    url: string
    commentsCount: number
}


enum Scope {
    Background,
    Popup,
    Web,
    Content
}


const getScope = (): Scope => {
    // https://stackoverflow.com/a/45310299
    if (chrome && chrome.extension && chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window) {
        return Scope.Background
    } else if (chrome && chrome.extension && chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() !== window) {
        return Scope.Popup
    } else if (!chrome || !chrome.runtime || !chrome.runtime.onMessage) {
        return Scope.Web
    } else {
        return Scope.Content
    }
}



const filterOutDuplicates = (torrents: Array<torrent>): Array<torrent> => {
    // takes in an array of torrents and filters out duplicate objects, since Set cant do that
    const ids = Array<string>()

    return torrents.map(torrent => {
        if (!ids.includes(torrent.url)) {
            ids.push(torrent.url)
            return torrent
        }
    }).filter(i => i != undefined) as Array<torrent>
}



interface settings {
    blockedUsers: string[]
    deadTorrentsRemover: {
        removeTorrentsEnabled: boolean
        minimumSeeders: number
        minimumLeechers: number
        torrentRemoveCondition: string
    }
    newCommentsNotifier: Array<torrent>
}


const defaults = JSON.stringify(<settings> {
    blockedUsers: [],
    deadTorrentsRemover: {
        removeTorrentsEnabled: false,
        minimumSeeders: 0,
        minimumLeechers: 0,
        torrentRemoveCondition: "both"
    },
    newCommentsNotifier: Array<torrent>(),
})




class Config {
    username: string
    settings = JSON.parse(defaults) as settings
    initialized: Boolean = false

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
        chrome.storage.local.set({ NyaaUtilitiesRewrite: this.settings})
    }

    async loadConfig() {
        chrome.storage.local.get("NyaaUtilitiesRewrite", async (value) => {
            if (_.isEmpty(value)) {
                // no config, set the defaults
                await this.saveConfig()
            } else {
                this.settings = deepmerge(JSON.parse(defaults), value.NyaaUtilitiesRewrite) as settings
                this.settings.newCommentsNotifier = filterOutDuplicates(this.settings.newCommentsNotifier)
            }
            console.log("Nyaa-Util[Rewrite]:Config", this.settings)
        })
    }

    async liveSync() {
        // Keep the copy of the config up to date.
        chrome.storage.onChanged.addListener((changes: object, areaName: string) => {
            this.loadConfig()
        })
    }

    constructor() {
        this.username = getScope() == Scope.Content ? (document.querySelector("i.fa-user")!.parentNode as HTMLElement).innerText.trim() : "Guest"

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
    torrent,
    getScope,
    Scope
}
