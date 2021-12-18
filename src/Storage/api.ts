// temporary constants until I actually implement this.
// TODO: Implement this.


class Config {
    username: string
    blockedUsers: Array<string>
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


    constructor() {
        this.username = "ArjixGamer"
        this.blockedUsers = []
        this.initialized = true
    }
}

const config = new Config()

export default config

export {
    config,
    Config
}