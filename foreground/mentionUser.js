nyaaUtility.storage.system.onload(() => {
    const textArea = document.querySelector("textarea#comment");
    if (!textArea) return;
    var comments = Array.from(
        document
            .querySelector("#collapse-comments")
            .querySelectorAll("div.panel.panel-default.comment-panel")
    );
    comments = comments
        .map((comment) => {
            if (
                comment
                    .querySelector("div.col-md-2 > p > a")
                    ?.innerText?.trim() != nyaaUtility.userName
            ) {
                return comment;
            }
        })
        .filter((comment) => comment != undefined);
    comments.forEach((comment) => {
        let user = comment.querySelector("div.col-md-2 > p > a");
        user.style.float = "left";
        user.style["padding-right"] = "10%";
        let mentionButton = `<input class="btn btn-xs btn-danger" id="mentionUser" type="button" style="background-color: #646464; border: none;" value="Mention"></input>`;
        $(user).after(mentionButton);

        comment.querySelector("input").onclick = () => {
            // Get the current URL
            let currentUrl = window.location.href;
            // strip anchors from the url if there are any
            currentUrl = currentUrl.split('#')[0];
            // Create a link to the current page with the comment id appended
            let link = currentUrl + '#' + comment.id;
            // Make the mention a markdown link to the comment
            textArea.value += `[@${user?.innerText.trim()}](${link}) `;
            window.scrollTo(0, document.body.scrollHeight);
        };
    });
});
