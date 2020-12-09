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
            `</select></p>
					          </div>
                            </div>`
        var userBlock = `<div class="row">
    <div class="form-group col-md-4">
            <input id="disableUserBlocks" name="disableUserBlocks" type="checkbox" value="n">
            <label for="disableUserBlocks">Disable the user blocking function</label>
    </div>
</div>`
        var AutoNextPage = `<div class="row">
        <div class="form-group col-md-4">
                <input id="AutoNextPage" name="AutoNextPage" type="checkbox" value="n">
                <label for="AutoNextPage">Automatically go to next page if current page is empty.</label>
        </div>
    </div>`
        $("#preferences-change > form > .row").first().after(AutoNextPage + userBlock + settings)
        if (localStorage.getItem("NyaaUserBlocks") == "true") {
            document.querySelector("input#disableUserBlocks").checked = true
        }
        if (localStorage.getItem("AutoNextPage") == "true") {
            document.querySelector("input#AutoNextPage").checked = true
        }

        document.getElementById("submit_settings").addEventListener('click', () => { submitSetting(); }, false);
    }
}
