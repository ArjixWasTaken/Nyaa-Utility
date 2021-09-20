//prettier-ignore
if (document.location.href.includes("/view/")) {
    nyaaUtility.storage.system.onload(() => {
        if (nyaaUtility.userName == "Guest") {
            return undefined;
        }
        const comments = document
            .querySelector("#collapse-comments")
            .querySelectorAll("div.panel.panel-default.comment-panel");
        for (let i = 0; i < comments.length; i++) {
            let comment = comments[i].querySelector(
                "div[markdown-text].comment-content > p "
            );
            if (comment?.innerText?.includes(`@${nyaaUtility.userName}`)) {
                comments[i].style["border-color"] = "white";
                comments[i].innerHTML = comments[i].innerHTML.replace(
                    `@${nyaaUtility.userName}`,
                    `<mark>@${nyaaUtility.userName}</mark>`
                );
            }
        }
    });
}
