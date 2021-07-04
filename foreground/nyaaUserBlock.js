//prettier-ignore
function blockUser(message) {
    let userLink = message.split("_iter")[0]
    if (!nyaaUtility.storage.user.options.nyaaBlockedUsers.includes(userLink)) {
        let choice = confirm("Are you sure you want to block: " + userLink.split("/")[userLink.split("/").length - 1])
        if (choice) {
            nyaaUtility.storage.user.options.nyaaBlockedUsers.push(userLink)
            nyaaUtility.settings.save()

            let comments = document.querySelectorAll("div.panel.panel-default.comment-panel")
            for (let i = 0; i < comments.length; i++) {
                let user = comments[i].querySelector("a").href
                if (nyaaUtility.storage.user.options.nyaaBlockedUsers.includes(user)) {
                    comments[i].parentNode.removeChild(comments[i])
                }
            }

            const commentsTitle = document.querySelector("div.panel-heading > a > h3")
            comments = document.querySelectorAll("div.panel.panel-default.comment-panel")
            const title = commentsTitle.innerText.split("- ")[0] + "- " + comments.length
            commentsTitle.innerText = title
        }
    } else {
        alert("The user: " + userLink.split("/")[userLink.split("/").length - 1] + " is already blocked")
        // this should never be able to run
    }
}

//prettier-ignore
nyaaUtility.storage.system.onload(() => {
    if (document.location.href.includes("/view/") && !nyaaUtility.storage.user.options.NyaaUserBlocks) {
        let comments = document.querySelectorAll("div.panel.panel-default.comment-panel")

        for (let i = 0; i < comments.length; i++) {
            let user = comments[i].querySelector("a").href
            if (nyaaUtility.storage.user.options.nyaaBlockedUsers.includes(user)) {
                comments[i].parentNode.removeChild(comments[i])
            }
        }
        const commentsTitle = document.querySelector("div.panel-heading > a > h3")
        comments = document.querySelectorAll("div.panel.panel-default.comment-panel")
        let title = commentsTitle.innerText.split("- ")[0] + "- " + comments.length
        commentsTitle.innerText = title

        for (let i = 0; i < comments.length; i++) {
            if (nyaaUtility.storage.user.options.commentPostedAtTime) {
                const date = comments[i].querySelector('a[href*="com-"] > small')
                date.innerText = date.title
            }
            if (comments[i].querySelector("a").href.match(/\/user\/(.*)/)[1] == nyaaUtility.userName) continue
            $(`<button type="button"
            id="user_${comments[i].querySelector("a").href}_iter_${i}"
            class="btn btn-xs btn-danger pull-right">
                Block User
            </button>`).appendTo(comments[i].querySelector("div.col-md-10.comment"))
            document.getElementById('user_' + comments[i].querySelector("a").href + "_iter_" + i).onclick = () => {
                blockUser(comments[i].querySelector("a").href + "_iter_" + i);
            }
        }
    }
});
