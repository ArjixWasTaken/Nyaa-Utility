import type { Module } from "./index"
import type { Config } from "../storage";


export default class CommentReplyBtn implements Module {
    id = "commentReplyBtn"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;
    options = () => { }
    async inject(config?: Config) {
        if (config == undefined) return

        const textArea = document.querySelector("textarea#comment") as HTMLTextAreaElement;
        if (!textArea) return;

        const comments = Array.prototype.filter.call(
            document.querySelectorAll("#collapse-comments div.panel.panel-default.comment-panel"),
            (comment: HTMLElement) => {
                let user = comment.querySelector("div.col-md-2 > p > a") as HTMLElement;
                return user && user.innerText?.trim() != config.username;
            }
        );

        comments.forEach((comment) => {
            if (import.meta.env.DEV)
                comment.querySelectorAll("#mentionUser")?.forEach((m: HTMLElement) => m.remove());

            let user = comment.querySelector("div.col-md-2 > p > a") as HTMLElement;

            Object.assign(user.style, {
                float: "left",
                paddingRight: "10%",
            })

            user.insertAdjacentHTML(
                "afterend",
                `
                    <input
                        type="button"
                        value="Mention"
                        class="btn btn-xs btn-danger"
                        id="mentionUser"
                        data-user="${user?.innerText.trim()}"
                        style="background-color: #646464; border: none;"
                    ></input>
                `
            );

            (comment.querySelector("input") as HTMLElement)!.onclick = () => {
                textArea.value += "@" + user?.innerText.trim() + " ";
                window.scrollTo(0, document.body.scrollHeight);
            };
        });
    }
}
