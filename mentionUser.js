//prettier-ignore
if (document.location.href.includes("/view/")) {

    (function () {
        'use strict';
        window.addEventListener("load", function () {
            const textArea = document.querySelector('textarea#comment')
            if (!textArea) return
            var comments = Array.from(document.querySelector("#collapse-comments").querySelectorAll('div.panel.panel-default.comment-panel'))
            comments = comments.map(comment => {
                if (comment.querySelector('div.col-md-2 > p > a').innerText.trim() != nyaaUtility.userName) {
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
