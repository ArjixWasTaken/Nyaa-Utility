
import { Module } from "./Modules/index"
import CommentReplyBtn from "./Modules/commentReply"
import UserTagsInComments from "./Modules/userTagsInComments"
import BlockUser from "./Modules/blockUser"
import DeadTorrentRemover from "./Modules/deadTorrentRemover"
import bgNewCommentsNotifier from "./Modules/bgNewCommentsNotifier"
import { config } from "./Storage/api"

const allModules: Module[] = [
    new CommentReplyBtn(),
    new UserTagsInComments(),
    new BlockUser(),
    new DeadTorrentRemover(),
    new bgNewCommentsNotifier()
]

export { allModules }

const enabledModules: String[] = allModules.map(mod => mod.id)

config.liveSync()
//  Module loader
allModules.forEach(module => {
    try {
        if (module.shouldRun.test(window.location.href) && enabledModules.includes(module.id)) {
            if (module.injectWithConfig) {
                config.onload(() => {
                    module.inject(config)
                    console.info("loaded module " + module.id)
                })
            } else {
                module.inject()
                console.info("loaded module " + module.id)
            }
        }
    } catch (error) {
        console.error("Error loading module " + module.id, error)
    }
})
