// ==UserScript==
// @name         AddSettingsForNyaaScripts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds settings to nyaa for my scripts.
// @author       Arjix
// @include      https://nyaa.si/profile*
// @include      https://sukebei.nyaa.si/profile*
// @include      https://meowinjapanese.cf/profile*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}


if (document.location.href.includes("/profile")) {
    function submitSetting() {
        // NyaaDeadTorrents
        var value = document.getElementById("removeDeadTorrentsRule").value
        localStorage.setItem("NyaaRemoveRule", value)

        //nyaaUserBlock
        value = document.querySelector("input#disableUserBlocks").checked
        localStorage.setItem("NyaaUserBlocks", value.toString())

        //AutoNextPage
        value = document.querySelector("input#AutoNextPage").checked
        localStorage.setItem("AutoNextPage", value.toString())
    }
    function unblockUser(user, userElement) {
        var blockedList = localStorage.getItem("nyaa_blocked_users") || []
        if (!Array.isArray(blockedList)) { blockedList = blockedList.split(',') }
        for (let i = 0; i < blockedList.length; i++) {
            if (blockedList[i] == user) {
                let dad = userElement.parentNode
                userElement.parentNode.parentNode.removeChild(dad)
                localStorage.setItem("nyaa_blocked_users", removeItemAll(blockedList, user).toString())
                alert("Successfully removed user: " + user.split('/')[user.split('/').length - 1] + " from the blocked list.")
                document.location.reload()
            }

        }
    }
    if (document.location.href == "https://nyaa.si/profile") {
        if (localStorage.getItem("NyaaRemoveRule") == "seeds") {
            var choiceOne = "<option selected>"
        } else { var choiceOne = "<option>" }
        if (localStorage.getItem("NyaaRemoveRule") == "leachers") {
            var choiceTwo = "<option selected>"
        } else { var choiceTwo = "<option>" }
        if (localStorage.getItem("NyaaRemoveRule") == "both") {
            var choiceThree = "<option selected>"
        } else { var choiceThree = "<option>" }
        var settings = `<div class="row">
					<div class="form-group col-md-4">
							<p>DeadTorrent removeRule:
                            <select id="removeDeadTorrentsRule">` +
            choiceOne + "seeds</option>" +
            choiceTwo + "leachers</option>" +
            choiceThree + "both</option>" +
            `</select></p></div></div>`
        var userBlock = `<div class="row"><div class="form-group col-md-4">
            <input id="disableUserBlocks" name="disableUserBlocks" type="checkbox" value="n">
            <label for="disableUserBlocks">Disable the user blocking function</label></div></div>`
        var AutoNextPage = `<div class="row"><div class="form-group col-md-4">
                <input id="AutoNextPage" name="AutoNextPage" type="checkbox" value="n">
                <label for="AutoNextPage">Automatically go to next page if current page is empty.</label></div></div>`
        var list = '<div class="row"><div class="form-group col-md-4"><div id="userList"><p>Blocked Users:</p><ul id="blockedUsersList" style="display:inline-block; border:1px solid #000; padding:20px; overflow-y:auto; height: 90px; list-style-type: none; padding: 0; margin: 0;">'
        var blockedList = localStorage.getItem("nyaa_blocked_users") || []
        if (!Array.isArray(blockedList)) { blockedList = blockedList.split(',') }
        for (let i = 0; i < blockedList.length; i++) {
            let listItem = '<li><div class="user" id = ' + blockedList[i] + '><p class="blockedUser" style="display: inline-block;">' +
                '<a target="_blank" href=' + blockedList[i] + '>' + blockedList[i] + '</a></p>' +
                `<input class="btn btn-xs btn-danger pull-right" id="unBlockUser" type="button" style="margin-left: 20px; background-color: #4CAF50; border: none;" value="Unblock user"` +
                `></input>` +
                `<br></div></li>`
            list += listItem
        }
        list += "</ul></div></div></div>"
        $("#preferences-change > form > .row").first().after(AutoNextPage + userBlock + settings + list)
        var unBlockUserButtons = document.querySelectorAll("input#unBlockUser")
        for (let i = 0; i < unBlockUserButtons.length; i++) {
            unBlockUserButtons[i].addEventListener('click', () => { unblockUser(unBlockUserButtons[i].parentNode.querySelector('a').href, unBlockUserButtons[i]) }, false)
        }
        if (unBlockUserButtons.length == 0) {
            var noItems = document.createElement("li");
            noItems.innerHTML = `<div class="user">No blocked users were found.</div>`
            document.querySelector("ul#blockedUsersList").appendChild(noItems);
        }
        if (localStorage.getItem("NyaaUserBlocks") == "true") {
            document.querySelector("input#disableUserBlocks").checked = true
        }
        if (localStorage.getItem("AutoNextPage") == "true") {
            document.querySelector("input#AutoNextPage").checked = true
        }

        document.getElementById("submit_settings").addEventListener('click', () => { submitSetting(); }, false);
    }
}