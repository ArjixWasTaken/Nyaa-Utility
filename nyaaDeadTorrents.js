// ==UserScript==
// @name         NyaaDeadTorrents
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  A simple script to remove dead torrents from the browse section of Nyaa.
// @author       Arjix
// @include      https://nyaa.si/*
// @include      https://sukebei.nyaa.si/*
// @include      https://meowinjapanese.cf/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==


if (!localStorage.getItem("NyaaRemoveRule")) {
    localStorage.setItem("NyaaRemoveRule", "seeds")
}
if (!localStorage.getItem("AutoNextPage")) {
    localStorage.setItem("AutoNextPage", "false")
}

function removeTorrent(torrent, count) {
    torrent.parentNode.removeChild(torrent)
    console.log("Removed torrent with index of: " + count.toString())
}

window.addEventListener("load", function () {
    const title = document.querySelector("title").innerText
    const allMeta = document.head.querySelectorAll("meta")
    const desc = allMeta[allMeta.length - 1].content

    if ("Browse :: Nyaa" === title || desc === "Nyaa homepage" || "Browse :: Sukebei" === title || desc === "Sukebei homepage" || desc.includes("Search for ") || desc.includes("Torrents uploaded by ")) {
        let torrents = document.querySelectorAll(".table-responsive > table > tbody > tr")
        var torrentsCount = torrents.length
        let removeRule = localStorage.getItem("NyaaRemoveRule")
        for (let count = 0; count < torrents.length; count++) {
            let seeds = torrents[count].querySelector("td:nth-child(6)").innerText
            let leachers = torrents[count].querySelector("td:nth-child(7)").innerText

            if (seeds == "0" && removeRule == "seeds") {
                removeTorrent(torrents[count], count)
                torrentsCount = torrentsCount - 1
            } else if (leachers == "0" && removeRule == "leachers") {
                removeTorrent(torrents[count], count)
                torrentsCount = torrentsCount - 1
            } else if (seeds == "0" && leachers == "0" && removeRule == "both") {
                removeTorrent(torrents[count], count)
                torrentsCount = torrentsCount - 1
            }
        }
        if (torrentsCount <= 0 && localStorage.getItem("AutoNextPage") == "true") {
            let pagination = document.querySelectorAll("ul.pagination > li")
            let nextPage = pagination[pagination.length - 1].childNodes[0].href
            window.location.replace(nextPage)
        }
    }
}, false)