// temporary constants until I actually implement this.
// TODO: Implement this.

interface settings {
    blockedUsers: string[]
    removeTorrentsEnabled: boolean
    minimumSeeders: number
    minimumLeechers: number
    torrentRemoveCondition: string
}

class Config {
    username: string
    settings = {} as settings
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

    constructor() {
        this.username = "ArjixGamer"


        chrome.storage.local.get("NyaaUtilitiesRewrite", async (value) => {
            if (JSON.stringify(value) == JSON.stringify({})) {
                // no config, set the defaults
                this.settings.blockedUsers = []
                console.log(this.settings)
                await this.saveConfig()
            } else {
                this.settings = value.NyaaUtilitiesRewrite as settings
            }

            this.initialized = true
        })
    }
}

const config = new Config()

export default config

export {
    config,
    Config
}