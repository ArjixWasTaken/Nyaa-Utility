import type { Config } from "../storage";
import type { Module } from "./index";
import _ from "lodash";

class BlockUser implements Module {
    // TODO: Add a red tint to any blocked comment.
    injectCss = `
/*
        .block-user-btn {
            position: absolute;
            transform: translateX(-100%) translateY(650%);
        }
*/
        .blocked-user > .panel-body > div > p {
            text-align: center;
            padding-block: 8px;
            margin-inline: 5px;
        }

        .blocked-user > .panel-body:hover > div > p {
            text-align: unset;
            padding-block: unset;
            margin-inline: unset;
        }

        .blocked-user > .panel-body > div > p > :not(a) {
            display: none;
        }

        .blocked-user > .panel-body .block-user-btn {
            display: none;
        }

        .blocked-user > .panel-body:hover .block-user-btn {
            display: unset;
        }

        .blocked-user > .panel-body:hover > div > p > :not(a) {
            display: unset;
        }

        .blocked-user > .panel-body > div.col-md-2 {
            display: flex;
            flex-direction: row-reverse;
            align-items: start;
            justify-content: start;
        }

        .blocked-user > .panel-body:hover > div.col-md-2 {
            flex-direction: column;
            align-items: unset;
        }

        .blocked-user > .panel-body .avatar {
            height: 40px;
            width: 40px;
            border-radius: 50px;
            transition: height 0.2s, width 0.2s;
        }

        .blocked-user > .panel-body:hover .avatar {
            border-radius: unset;
            height: 120px;
            width: 120px;
        }

        .blocked-user > .panel-body > div:first-child > :not(p):not(.avatar),
        .blocked-user > .panel-body .comment > :not(.comment-details) {
            display: none;
        }

        .blocked-user > .panel-body:hover > div:first-child > :not(p > a),
        .blocked-user > .panel-body:hover .comment > :not(.comment-details) {
            display: block;
        }
    `;

    id = "blockUsers";
    shouldRun = /\/view\/\d+/;
    injectWithConfig = true; // we need to know the tag of the user first.

    toggleBlock(userLink: string, config: Config) {
        const username = _.last(userLink.split("/"));

        if (config.settings.blockedUsers.includes(userLink)) {
            if (confirm(`Are you sure you want to unblock: ${username}?`)) {
                config.settings.blockedUsers =
                    config.settings.blockedUsers.filter(
                        (user) => user != userLink
                    );
                config.saveConfig();
            }
        } else {
            if (confirm(`Are you sure you want to block: ${username}?`)) {
                config.settings.blockedUsers.push(userLink);
                config.saveConfig();

                document
                    .querySelectorAll("div.panel.panel-default.comment-panel")
                    .forEach((comment: Element) => {
                        let user = (
                            comment.querySelector("a") as HTMLAnchorElement
                        ).href;
                        if (!user) return;

                        if (config.settings.blockedUsers.includes(user)) {
                            Object.assign((comment as HTMLElement).style, {
                                display: "none",
                            });
                        }
                    });
            }
        }
    }

    async inject(config?: Config) {
        if (!config) return;

        if (import.meta.env.DEV)
            document.querySelectorAll(".block-user-btn").forEach((btn) => {
                btn.remove();
            });

        // prettier-ignore
        let comments = document.querySelectorAll("div.panel.panel-default.comment-panel");

        const update = () => {
            comments.forEach((comment: Element) => {
                let user = (comment.querySelector("a") as HTMLAnchorElement)
                    .href;
                if (!user) return;

                user = `${window.location.hostname}/user/${user
                    .split("/")
                    .pop()}`;

                if (config.settings.blockedUsers.includes(user))
                    comment.classList.add("blocked-user");
                else {
                    comment.classList.remove("blocked-user");
                }
            });
        };

        update();

        config.onChange(() => {
            update();

            // prettier-ignore
            comments = document.querySelectorAll("div.panel.panel-default.comment-panel");
        });

        comments.forEach((comment: Element) => {
            let user = (comment.querySelector("a") as HTMLAnchorElement).href;
            if (!user) return;

            user = `${window.location.hostname}/user/${user.split("/").pop()}`;
            if (user == config.username) return;

            const button = document.createElement("button");
            button.dataset.user = user;

            Object.assign(button, {
                type: "button",
                className: "btn btn-xs btn-danger pull-right block-user-btn",
                innerText: "Block User",
                onclick: () => {
                    this.toggleBlock(user, config);
                },
            });

            config.onChange(() => {
                if (
                    comment.classList.contains("blocked-user") &&
                    button.innerText == "Block User"
                ) {
                    button.innerText = "Unblock User";
                } else if (
                    !comment.classList.contains("blocked-user") &&
                    button.innerText == "Unblock User"
                ) {
                    button.innerText = "Block User";
                }
            });

            comment
                .querySelector("div.col-md-10.comment")
                ?.insertAdjacentElement("afterend", button);
        });
    }
}

export default BlockUser;
