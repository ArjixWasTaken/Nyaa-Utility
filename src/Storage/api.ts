import deepmerge from "deepmerge";

interface torrent {
    id: number
    commentsCount: number
}



const filterOutDuplicates = (torrents: Array<torrent>): Array<torrent> => {
    // takes in an array of torrents and filters out duplicate objects, since Set cant do that
    const ids = Array<number>()

    return torrents.map(torrent => {
        if (!ids.includes(torrent.id)) {
            ids.push(torrent.id)
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


const defaults = <settings> {
    blockedUsers: [],
    deadTorrentsRemover: {
        removeTorrentsEnabled: false,
        minimumSeeders: 0,
        minimumLeechers: 0,
        torrentRemoveCondition: "both"
    },
    newCommentsNotifier: Array<torrent>(),
}




class Config {
    username: string
    settings = JSON.parse(JSON.stringify(defaults)) as settings
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
            if (JSON.stringify(value) == JSON.stringify({})) {
                // no config, set the defaults
                await this.saveConfig()
            } else {
                this.settings = deepmerge(JSON.parse(JSON.stringify(defaults)), value.NyaaUtilitiesRewrite) as settings
                this.settings.newCommentsNotifier = filterOutDuplicates(this.settings.newCommentsNotifier)
            }
        })
    }

    constructor() {
        // TODO: Detect if this is running in the background or not.
        // If it is running in the background then set it to "Guest"
        // Else scrape the user's username.
        this.username = "Guest"


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
    torrent
}
