import { Config } from "../Storage/api";
import { Module } from "./index"

class BlockUser implements Module {
    id = "blockUsers"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;  // we need to know the tag of the user first.
    async inject(config?: Config) {
        if (config == undefined) return

        let comments = Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel")) as Array<HTMLElement>


        for (const comment of comments) {
            const user = comment.querySelector("a")!.href.match(/user\/(.+)/)![1].replace("/", ""); // in case there is a trailing slash
            if (config.blockedUsers.includes(user)) {
                comment.remove()
            }
        }
    }
}

export default BlockUser