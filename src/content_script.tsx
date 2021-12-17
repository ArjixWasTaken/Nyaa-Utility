import $ from "jquery";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});


class Module {
    id: String = "";
    shouldRun: RegExp = new RegExp("");
    settings: {} = {};
    injectWithConfig: boolean = false;
    inject() {}
}


class CommentReplyBtn extends Module {
    id = "commentReplyBtn"
    shouldRun: RegExp = /\/view\/\d+/
    //prettier-ignore
    inject() {
        const textArea = document.querySelector("textarea#comment") as HTMLTextAreaElement;
        if (!textArea) return;
        let comments = Array.from(
            (document.querySelector("#collapse-comments") as HTMLElement)?.querySelectorAll("div.panel.panel-default.comment-panel")
        ).filter((comment) => comment != undefined && (comment.querySelector("div.col-md-2 > p > a") as HTMLElement)?.innerText?.trim() != "ArjixGamer");

    comments.forEach((comment) => {
        let user = comment.querySelector("div.col-md-2 > p > a") as HTMLElement;
        user.style.float = "left";
        user.style.paddingRight = "10%";
        let mentionButton = `<input class="btn btn-xs btn-danger" id="mentionUser" type="button" style="background-color: #646464; border: none;" value="Mention"></input>`;
        $(user).after(mentionButton);

        (comment.querySelector("input") as HTMLElement)!.onclick = () => {
            textArea.value += "@" + user?.innerText.trim() + " ";
            window.scrollTo(0, document.body.scrollHeight);
        };
    });
    }
}


const enabledModules: String[] = ["commentReplyBtn"]


//  Module loader
const modules: Module[] = [new CommentReplyBtn()]
modules.forEach(module => {
    if (module.shouldRun.test(window.location.href) && enabledModules.includes(module.id)) {
        if (module.injectWithConfig) {
            let a = setInterval(() => {
                module.inject()
                clearInterval(a)
            }, 200)
        } else {
            module.inject()
        }
    }
})
