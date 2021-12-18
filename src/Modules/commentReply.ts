import { Module } from "./index"
import { Config } from "../Storage/api";
import $ from "jquery";


class CommentReplyBtn implements Module {
    id = "commentReplyBtn"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;
    //prettier-ignore
    async inject(config?: Config) {
        if (config == undefined) return

        const textArea = document.querySelector("textarea#comment") as HTMLTextAreaElement;
        if (!textArea) return;
        let comments = Array.from(
            (document.querySelector("#collapse-comments") as HTMLElement)?.querySelectorAll("div.panel.panel-default.comment-panel")
        ).filter((comment) => comment != undefined && (comment.querySelector("div.col-md-2 > p > a") as HTMLElement)?.innerText?.trim() != config.username);

        comments.forEach((comment) => {
            let user = comment.querySelector("div.col-md-2 > p > a") as HTMLElement;
            user.style.float = "left";
            user.style.paddingRight = "10%";
            let mentionButton = `<input class="btn btn-xs btn-danger" id="mentionUser" type="button" style="background-color: #646464; border: none;" value="Mention"></input>`;
            $(user).after(mentionButton);

            (comment.querySelector("input") as HTMLElement)!.onclick = () => {
                textArea.value += "@" + user?.innerText.trim() + " ";
                window.scrollTo(0, document.body.scrollHeight);
            };
        });
    }
}

export default CommentReplyBtn