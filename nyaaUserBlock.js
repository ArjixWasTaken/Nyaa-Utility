// ==UserScript==
// @name         Nyaa User Block
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A user script that adds the feature of blocking users on nyaa.
// @author       Arjix
// @match        https://nyaa.si/view/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

if (document.location.href.includes("/view/") && localStorage.getItem("NyaaUserBlocks") == "false") {
    function blockUser(message) {
        let blockedList = localStorage.getItem("nyaa_blocked_users") || []
        if (!Array.isArray(blockedList)) { blockedList = blockedList.split(',') }
        let userLink = message.split("_iter")[0]
        if (!blockedList.includes(userLink)) {
            let choice = confirm("Are you sure you want to block: " + userLink.split("/")[userLink.split("/").length - 1])
            if (choice) {
                blockedList.push(userLink)
                localStorage.setItem("nyaa_blocked_users", blockedList.toString())
                document.location.reload()
            }
        } else {
            alert("The user: " + userLink.split("/")[userLink.split("/").length - 1] + " is already blocked")
        }
    }

    (function () {
        'use strict';
        window.addEventListener("load", function () {
            var comments = document.querySelectorAll("div.panel.panel-default.comment-panel")
            let blockedList = localStorage.getItem("nyaa_blocked_users") || []
            console.log(blockedList)
            if (!Array.isArray(blockedList)) { blockedList = blockedList.split(',') }
            for (let i = 0; i < comments.length; i++) {
                let user = comments[i].querySelector("a").href
                if (blockedList.includes(user)) {
                    comments[i].parentNode.removeChild(comments[i])
                    console.log("Removed: " + user)
                } else {
                    //console.log(user)
                }
            }
            var commentsTitle = document.querySelector("div.panel-heading > a > h3")
            comments = document.querySelectorAll("div.panel.panel-default.comment-panel")
            let title = commentsTitle.innerText.split("- ")[0] + "- " + comments.length
            commentsTitle.innerText = title
            // let css = `<style>
            // .nyaaUserBlock {
            //     position: fixed;
            //     bottom: 0;
            //     right: 0;
            // }
            // </style>`
            // $("body").after(css)
            for (let i = 0; i < comments.length; i++) {
                $('<button type="button" id="user_' + comments[i].querySelector("a").href + "_iter_" + i + '"' + 'class="btn btn-xs btn-danger pull-right">' +
                    "Block User" +
                    "</button>").appendTo(comments[i].querySelector("div.col-md-10.comment"))
                document.getElementById('user_' + comments[i].querySelector("a").href + "_iter_" + i).onclick = () => { blockUser(comments[i].querySelector("a").href + "_iter_" + i); } //.addEventListener('click', () => { blockUser(comments[i].querySelector("a").href + "_iter_" + i); }, false);
            }
        }, false)
    })();
}
