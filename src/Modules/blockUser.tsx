import React, { useState, useEffect } from "react";
import { Config } from "../Storage/api";
import { Module } from "./index"
import $ from "jquery";

class BlockUser implements Module {
    id = "blockUsers"
    shouldRun = /\/view\/\d+/
    injectWithConfig = true;  // we need to know the tag of the user first.
    options = (config: Config) => {
        const unblock = async (usr: String) => {
            config.settings.blockedUsers = config.settings.blockedUsers.filter(bUser => bUser != usr)
            await config.saveConfig()
            window.location.reload();
        }


        return (<>
                <style>
                    {`input {
                        margin-left: 20px;
                        background-color: #4caf50;
                        border: none;
                        font-size: 70%;
                        cursor: pointer;
                    }`}
                </style>
                Blocked users:
                <ul>
                    {config.settings.blockedUsers.map(user => {
                        return (<li>
                            <div>
                                <a href={`${user}`}>{user.match(/user\/(.*)/)![1]}</a>
                                <input type="button" value="unblock" onClick={() => unblock(user)}/>
                            </div>
                        </li>)
                    })}
                    {(config.settings.blockedUsers.length == 0) ? "No blocked users were found." : ""}
                </ul>
            </>)
    }
    blockUser(text: string, config: Config) {
        let userLink = text.split("_iter")[0]
        if (!config.settings.blockedUsers.includes(userLink)) {
            let choice = confirm("Are you sure you want to block: " + userLink.split("/")[userLink.split("/").length - 1])

            if (choice) {
                config.settings.blockedUsers.push(userLink)
                config.saveConfig()

                let comments = Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel"))
                for (let i = 0; i < comments.length; i++) {
                    let user = ((comments[i] as HTMLElement).querySelector("a") as HTMLAnchorElement).href
                    if (config.settings.blockedUsers.includes(user)) {
                        (comments[i] as HTMLElement).remove()
                    }
                }

                const commentsTitle = document.querySelector("div.panel-heading > a > h3") as HTMLElement
                comments = Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel"))
                let title = commentsTitle.innerText.split("- ")[0] + "- " + comments.length
                commentsTitle.innerText = title
            }
        } else {
            alert("The user: " + userLink.split("/")[userLink.split("/").length - 1] + " is already blocked")
        }
    }
    async inject(config?: Config) {
        console.log(config!.settings.blockedUsers)

        if (config == undefined) return
        let comments = Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel")) as Array<HTMLElement>


        for (const comment of comments) {
            const user = comment.querySelector("a")!.href
            if (config.settings.blockedUsers.includes(user)) {
                comment.remove()
            }
        }

        const commentsTitle = document.querySelector("div.panel-heading > a > h3") as HTMLElement
        comments = Array.from(document.querySelectorAll("div.panel.panel-default.comment-panel"))
        let title = commentsTitle.innerText.split("- ")[0] + "- " + comments.length
        commentsTitle.innerText = title


        for (let i = 0; i < comments.length; i++) {
            if ((comments[i].querySelector("a") as HTMLAnchorElement).href.match(/\/user\/(.*)/)![1] == config.username) continue
            $(`<button type="button"
            id="user_${(comments[i].querySelector("a") as HTMLAnchorElement).href}_iter_${i}"
            class="btn btn-xs btn-danger pull-right">
                Block User
            </button>`).appendTo((comments[i].querySelector("div.col-md-10.comment") as HTMLElement));
            (document.getElementById('user_' + (comments[i].querySelector("a") as HTMLAnchorElement).href + "_iter_" + i) as HTMLElement).onclick = () => {
                this.blockUser((comments[i].querySelector("a") as HTMLAnchorElement).href + "_iter_" + i, config);
            }
        }
    }
}

export default BlockUser