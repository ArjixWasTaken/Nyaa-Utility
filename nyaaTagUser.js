// ==UserScript==
// @name         Nyaa Tag User
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights messages that mention ur user.
// @author       Arjix
// @match        https://nyaa.si/view/*
// ==/UserScript==

if (document.location.href.includes("/view/")) {
    (function () {
        'use strict';
        window.addEventListener("load", function () {
            const userName = document.querySelector("#navbar > ul.nav.navbar-nav.navbar-right > li > a.dropdown-toggle.visible-lg.visible-sm.visible-xs").innerText.trim()
            if (userName == 'Guest') {return undefined}
            var comments = document.querySelector("#collapse-comments").querySelectorAll('div.panel.panel-default.comment-panel')
            for (let i = 0; i < comments.length; i++) {
                console.log(comments[i])
                let comment = comments[i].querySelector('div[markdown-text].comment-content > p ')
                // console.log(comment)
                if (comment.innerText.includes(`@${userName}`)) {
                    comments[i].style['border-color'] = 'white'
                }
            }
        }, false)
    })();
}