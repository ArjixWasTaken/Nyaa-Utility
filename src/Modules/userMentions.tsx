import type { Module } from "./index";
import type { Config } from "../storage";
import _ from "lodash";

export default class CommentReplyBtn implements Module {
    id = "userMentions";
    shouldRun: RegExp = /\/view\/\d+/;
    injectWithConfig = true;
    options = () => {};
    injectCss = `
        .mention {
            background-color: #e7e4e4;
            cursor: pointer;
        }
    `;
    async inject(config?: Config) {
        if (!config) return;

        if (import.meta.env.DEV)
            document
                .querySelectorAll(".mention[data-comment]")
                ?.forEach((m: Element) => m.remove());

        const comments = Array.prototype.map
            .call(
                document.querySelectorAll(
                    "#collapse-comments div.panel.panel-default.comment-panel"
                ),
                (comment: HTMLElement) => {
                    let user = comment.querySelector<HTMLElement>(
                        "div.col-md-2 > p > a"
                    );

                    return (
                        user && {
                            author: user?.innerText?.trim(),
                            node: comment,
                        }
                    );
                }
            )
            .filter(Boolean) as { author: string; node: HTMLElement }[];

        for (const comment of comments) {
            const currentIdx = comments.indexOf(comment);

            // prettier-ignore
            const content = comment.node.querySelector<HTMLElement>(".comment-content");
            if (!content) continue;

            let innerHTML = content.innerHTML;
            const textContent = content.innerText;

            const mentions = Array.from(
                textContent?.matchAll(/@([^\s]+)/g) || []
            ).map((m) => m.pop());

            if (!mentions.length) continue;

            for (const mention of mentions) {
                // prettier-ignore
                const idx = _.findLastIndex(comments,
                    (c) => {
                        if (comments.indexOf(c) >= currentIdx) return false;
                        return c.author?.toLocaleLowerCase() === mention?.toLocaleLowerCase()
                    }
                );

                const comment = comments[idx];
                if (!comment) continue;

                // prettier-ignore
                innerHTML = innerHTML.replace(
                    `@${comment.author}`,
                    `<span class="mention" data-comment="${
                        comment.node
                            .querySelector<HTMLAnchorElement>(".comment-details a")
                            ?.href?.split("#")?.[1]
                    }" onclick="document.querySelector('#'+this.dataset.comment).scrollIntoView({ behavior: 'smooth' });">@${comment.author}</span>`
                );
            }

            content.innerHTML = innerHTML;
        }
    }
}
