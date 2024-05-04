import { Module } from "./index"
import { Config } from "../Storage/api";
import $ from "jquery";


class CommentReplyBtn implements Module {
    id = "commentReplyBtn"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;
    options = () => {}
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
                // Get the current URL
                let currentUrl = window.location.href;
                // Strip anchors from the URL if there are any
                currentUrl = currentUrl.split("#")[0];
                // Create a link to the current page with the comment id appended
                let link = currentUrl + "#" + comment.id;
                // Make the mention a markdown link to the comment
                textArea.value += `[@${user?.innerText.trim()}](${link}) `;
                window.scrollTo(0, document.body.scrollHeight);
            };
        });
    }
}

export default CommentReplyBtn