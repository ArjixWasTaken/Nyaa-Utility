import type { Module } from "./index"
import type { Config } from "../storage";

export default class CommentReply implements Module {
    id = "commentReplyBtn"
    shouldRun: RegExp = /\/view\/\d+/
    injectWithConfig = true;

    injectCss = `
        .reply-bar {
            width: 100%;
            color: white;
            display: flex;
            justify-content: space-between;
            background-color: rgb(76, 80, 87);
            margin-bottom: 2px;
            padding: 8px;

            --radius: 15px;
            /* jesus, why the browser-specific css? */
            -webkit-border-top-left-radius: var(--radius);
            -webkit-border-top-right-radius: var(--radius);
            -moz-border-radius-topleft: var(--radius);
            -moz-border-radius-topright: var(--radius);
            border-top-left-radius: var(--radius);
            border-top-right-radius: var(--radius);
            /* sighs */
        }

        .reply-bar p, .reply-bar span {
            margin-inline: 1%;
            margin-block: 0;
        }

        .reply-bar > span {
            cursor: pointer;
            margin-top: 1px;
            font-size: 14pt;
        }

        .hidden-reply-bar {
            display: none;
        }

        .reply-btn {
            margin-right: 1%;
        }

        .reply-target {
            cursor: pointer;
            user-select: none;
        }
    `;


    // prettier-ignore
    setupReplyBar(): HTMLDivElement | undefined {
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea#comment")
        const submitBtn = document.querySelector<HTMLButtonElement>(`.comment-box input[type="submit"]`);
        const form = document.querySelector<HTMLFormElement>("form.comment-box");
        if (!textarea || !submitBtn || !form) return;

        let replyBar = document.querySelector<HTMLDivElement>(".reply-bar");
        if (replyBar) return replyBar;

        replyBar = document.createElement("div");
        textarea.parentElement?.insertBefore(replyBar, textarea);

        Object.assign(replyBar, {
            className: "reply-bar hidden-reply-bar",
        });
        //  onclick="${`let c = this.parentElement.parentElement.parentElement.dataset.comment; if (!c) return; window.location.hash = c`}"
        replyBar.innerHTML = `
            <p>
                Replying to <strong><i class="reply-target"></i></strong>
            </p>
            <span onclick="this.parentElement.classList.add('hidden-reply-bar'); this.parentElement.dataset.comment=undefined" class="glyphicon glyphicon-remove-circle"></span>
        `;

        return replyBar;
    }

    async inject(config?: Config) {
        if (!config) return
        const replyBar = this.setupReplyBar()
        if (!replyBar) return

        if (import.meta.env.DEV)
            // prettier-ignore
            document.querySelectorAll(".reply-btn")
                .forEach((b) => b.remove());

        // prettier-ignore
        const comments = document.querySelectorAll<HTMLElement>("div.panel.panel-default.comment-panel");

        comments.forEach((comment) => {
            const user = comment.querySelector<HTMLAnchorElement>("a")?.href;
            if (!user) return;

            const button = document.createElement("button");

            Object.assign(button, {
                type: "button",
                className: "btn btn-xs pull-right reply-btn",
                innerText: "Reply",
                onclick: () => {
                    replyBar.classList.remove("hidden-reply-bar");
                    replyBar.dataset.comment = comment.id;
                    window.location.hash = comment.id;
                    document.querySelector<HTMLElement>(".reply-target")!.innerText = user.split("/").pop()! + "#" + comment.id;
                },
            });

            comment
                .querySelector("div.col-md-10.comment")
                ?.insertAdjacentElement("afterend", button);
        });
    }
}
