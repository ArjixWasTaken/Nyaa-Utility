import type { Module } from "./index";
import type { Config } from "../storage";
import _ from "lodash";
import EasyMDE from "easymde";

export default class CommentReplyBtn implements Module {
    id = "userMentions";
    shouldRun: RegExp = /\/view\/\d+/;
    injectWithConfig = true;
    options = () => {};
    injectCss = `
        .user-tag {
            background-color: #e7e4e4;
            cursor: pointer;
        }
    `;
    async inject(config?: Config) {
        if (!config) return;

        // prettier-ignore
        if (import.meta.env.DEV) {
            document
                .querySelectorAll<Element>(".mention[data-comment], #collapse-comments #tagUser")
                ?.forEach((m) => m.remove());
        }

        // prettier-ignore
        const comments = Array.prototype.map
            .call(document.querySelectorAll<HTMLElement>("#collapse-comments div.panel.panel-default.comment-panel"),
                (comment: HTMLElement) => {
                    let user = comment.querySelector<HTMLElement>("div.col-md-2 > p > a");

                    return (
                        user && {
                            user,
                            username: user?.innerText?.trim(),
                            node: comment,
                        }
                    );
                }
            )
            .filter(Boolean) as {
                user: HTMLElement;
                username: string;
                node: HTMLElement;
            }[];

        // prettier-ignore
        const textArea = document.querySelector<HTMLTextAreaElement>("textarea#comment");
        if (textArea) {
            for (const { username, user, node: comment } of comments) {
                if (!username || username == config.username) continue;

                Object.assign(user.style, {
                    float: "left",
                    paddingRight: "10%",
                });

                user.insertAdjacentHTML(
                    "afterend",
                    `
                        <input
                            type="button"
                            value="Ping"
                            class="btn btn-xs btn-danger"
                            id="tagUser"
                            data-user="${username}"
                            style="background-color: #646464; border: none;"
                        ></input>
                    `
                );

                comment.querySelector<HTMLElement>("input")!.onclick = () => {
                    let editor = {
                        codemirror: {
                            setValue: (v: string) => {
                                textArea.value = v;
                            },
                            getValue: () => textArea.value,
                        },
                    } as EasyMDE;

                    if ("markdownEditor" in window)
                        editor = window.markdownEditor as EasyMDE;

                    let value = editor.codemirror.getValue();
                    if (!/\s$/.test(textArea.value)) value += " ";

                    value += `@${username} `;

                    editor.codemirror.setValue(value);
                    window.scrollTo(0, document.body.scrollHeight);
                };
            }
        }

        for (const comment of comments) {
            const currentIdx = comments.indexOf(comment);

            // prettier-ignore
            const content = comment.node.querySelector<HTMLElement>(".comment-content");
            if (!content) continue;

            let innerHTML = content.innerHTML;
            const textContent = content.innerText;

            // prettier-ignore
            const mentions = Array.from(textContent.matchAll(/@([^\s]+)/g) || []).map((m) => m.pop());

            if (!mentions.length) continue;
            for (const mention of mentions) {
                // prettier-ignore
                const idx = _.findLastIndex(comments,
                    (c) => {
                        if (comments.indexOf(c) >= currentIdx) return false;
                        return c.username?.toLocaleLowerCase() === mention?.toLocaleLowerCase()
                    }
                );

                const comment = comments[idx];
                if (!comment) continue;

                // prettier-ignore
                innerHTML = innerHTML.replace(
                    `@${comment.username}`,
                    `<span class="user-tag" data-comment="${
                        comment.node
                            .querySelector<HTMLAnchorElement>(".comment-details a")
                            ?.href?.split("#")?.[1]
                    }" onclick="document.querySelector('#'+this.dataset.comment).scrollIntoView({ behavior: 'smooth' });">@${comment.username}</span>`
                );
            }

            content.innerHTML = innerHTML;
        }
    }
}
