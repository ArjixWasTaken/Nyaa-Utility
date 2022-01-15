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



interface deadTorrentsRemover {
    enabled: boolean
    minimum: [number, number]
    removeCondition: String
}




interface settings {
    blockedUsers: string[]
    deadTorrentsRemover: deadTorrentsRemover
    newCommentsNotifier: Array<torrent>
}


const defaults = JSON.stringify(<settings> {
    blockedUsers: [],
    deadTorrentsRemover: <deadTorrentsRemover> {
        enabled: false,
        minimum: [0, 0],
        removeCondition: "both"
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

                // Check if the legacy config is present.
                chrome.storage.local.get("NyaaUtilSettings", async (legacyConfig) => {
                    return // for now this is disabled as it has not been tested, and not all the settings are transferred.
                    if (_.isEmpty(legacyConfig)) return
                    const NyaaUtilSettings = legacyConfig.NyaaUtilSettings.options

                    this.settings.deadTorrentsRemover.enabled = NyaaUtilSettings.NyaaRemoveRule !== "disabled"
                    if (this.settings.deadTorrentsRemover.enabled) this.settings.deadTorrentsRemover.removeCondition = NyaaUtilSettings.NyaaRemoveRule.replace("seeds", "seeders")

                    this.settings.newCommentsNotifier = filterOutDuplicates(NyaaUtilSettings.subscribedThreads.entries.map((id: string, commentsCount: number) => {
                        return <torrent> {
                            url: `https://nyaa.si/view/${id}`,
                            commentsCount
                        }
                    }))

                    this.settings.blockedUsers = Array.from(new Set(NyaaUtilSettings.nyaaBlockedUsers))
                    // These are the only settings that can be transferred as of now.

                    chrome.storage.local.remove("NyaaUtilSettings")
                    // After we are done migrating, we will remove the legacy settings.

                    await this.saveConfig()
                })
            } else {
                this.settings = deepmerge(JSON.parse(defaults), value.NyaaUtilitiesRewrite) as settings

                // Making sure that all the data is valid, because it is possible that deepmerge messed it up.
                this.settings.newCommentsNotifier = filterOutDuplicates(this.settings.newCommentsNotifier)
                this.settings.deadTorrentsRemover.minimum = value.NyaaUtilitiesRewrite.deadTorrentsRemover.minimum.splice(0, 2) as [number, number]
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
