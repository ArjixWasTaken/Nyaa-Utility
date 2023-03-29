import type { Module } from "./index"
import type { Config } from "../storage";

export default class CommentReplyBtn implements Module {
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
    `;

    async inject(config?: Config) {
        if (!config) return

        // prettier-ignore
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea#comment")
        // prettier-ignore
        const submitBtn = document.querySelector<HTMLButtonElement>(`.comment-box input[type="submit"]`);
        // prettier-ignore
        const form = document.querySelector<HTMLFormElement>("form.comment-box");
        if (!textarea || !submitBtn || !form) return;

        const replyBar = document.createElement("div");
        textarea.parentElement?.insertBefore(replyBar, textarea);

        Object.assign(replyBar, {
            className: "reply-bar hidden-reply-bar",
        });

        replyBar.innerHTML = `
            <p>
                Replying to <strong><i class="reply-target">SomaHeir</i></strong>
            </p>
            <span class="glyphicon glyphicon-remove-circle"></span>
        `;
    }
}
