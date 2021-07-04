//prettier-ignore
if (document.location.href.includes("/view/")) {
    nyaaUtility.storage.system.onload(() => {
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
    })
}
