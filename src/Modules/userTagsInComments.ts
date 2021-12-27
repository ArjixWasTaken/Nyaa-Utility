import { Module } from "./index"
import { Config } from "../Storage/api"


class UserTagsInComments implements Module {
    id = "userTagsInComments"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;  // we need to know the tag of the user first.
    options = () => {}
    //prettier-ignore
    async inject(config?: Config) {
        if (config == undefined) return

        let comments = Array.from(
            (document.querySelector("#collapse-comments") as HTMLElement)?.querySelectorAll("div.panel.panel-default.comment-panel")
        ).filter((comment) => comment != undefined && (comment.querySelector("div.col-md-2 > p > a") as HTMLElement)?.innerText?.trim() != config.username) as Array<HTMLElement>;

        for (let i = 0; i < comments.length; i++) {
            let comment = comments[i].querySelector(
                "div[markdown-text].comment-content > p "
            ) as HTMLElement;
            if (comment?.innerText?.includes(`@ArjixGamer`)) {
                comments[i].style.borderColor = "white";
                comments[i].innerHTML = comments[i].innerHTML.replace(
                    `@${config.username}`,
                    `<mark>@${config.username}</mark>`
                );
            }
        }
    }
}

export default UserTagsInComments