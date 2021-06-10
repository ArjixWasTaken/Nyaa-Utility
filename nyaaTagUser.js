// ==UserScript==
// @name         Nyaa Tag User
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights messages that mention ur user.
// @author       Arjix
// @match        https://nyaa.si/view/*
// ==/UserScript==

//prettier-ignore
if (document.location.href.includes("/view/")) {
    (function () {
        'use strict';
        window.addEventListener("load", function () {
            if (nyaaUtility.userName == 'Guest') {return undefined}
            var comments = document.querySelector("#collapse-comments").querySelectorAll('div.panel.panel-default.comment-panel')
            for (let i = 0; i < comments.length; i++) {
                console.log(comments[i])
                let comment = comments[i].querySelector('div[markdown-text].comment-content > p ')
                if (comment.innerText.includes(`@${nyaaUtility.userName}`)) {
                    comments[i].style['border-color'] = 'white'
                }
            }
        }, false)
    })();
}
