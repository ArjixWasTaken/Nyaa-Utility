
import { Module } from "./Modules/index"
import CommentReplyBtn from "./Modules/commentReply"
import UserTagsInComments from "./Modules/userTagsInComments"


const allModules: Module[] = [
    new CommentReplyBtn(),
    new UserTagsInComments()
]
// for now all modules are enabled
// TODO: Make this customizable
const enabledModules: String[] = allModules.map(mod => mod.id)


//  Module loader
allModules.forEach(module => {
    if (module.shouldRun.test(window.location.href) && enabledModules.includes(module.id)) {
        if (module.injectWithConfig) {
            let a = setInterval(() => {
                module.inject()
                clearInterval(a)
            }, 200)
        } else {
            module.inject()
        }
    }
})
