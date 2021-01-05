// ==UserScript==
// @name         Nyaa Mention User
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A user script that adds a button to append a user mention in the message field.
// @author       Arjix
// @match        https://nyaa.si/view/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// ==/UserScript==

if (document.location.href.includes("/view/")) {

    (function () {
        'use strict';
        window.addEventListener("load", function () {
            const userName = document.querySelector("#navbar > ul.nav.navbar-nav.navbar-right > li > a.dropdown-toggle.visible-lg.visible-sm.visible-xs").innerText.trim()
            const textArea = document.querySelector('textarea#comment')
            var comments = Array.from(document.querySelector("#collapse-comments").querySelectorAll('div.panel.panel-default.comment-panel'))
            comments = comments.map(comment => {
                if (comment.querySelector('div.col-md-2 > p > a').innerText.trim() != userName) {
                    return comment
                }
            }).filter(comment => comment != undefined)
            comments.forEach(comment => {
                let user = comment.querySelector('div.col-md-2 > p > a')
                user.style.float = 'left'
                user.style['padding-right'] = '10%'
                let mentionButton = `<input class="btn btn-xs btn-danger" id="mentionUser" type="button" style="background-color: #646464; border: none;" value="Mention"></input>`
                $(user).after(mentionButton)

                comment.querySelector('input').onclick = () => {
                    textArea.value += '@'+user.innerText.trim()+' '
                    window.scrollTo(0,document.body.scrollHeight);
                }
            })
        }, false)
    })();
}