const injectScript = async (file) => {
    await chrome.runtime.sendMessage(
        {
            injectScript: true,
            filename: file,
        },
        (response) => {
            if (response.done) {
                console.log("loaded: ", file);
            }
        }
    );
};

const href = document.location.href;

switch (true) {
    case /\/nyaa-utility/.test(href): {
        injectScript("./foreground/addExtensionHelp.js");
        break;
    }
    case /\/(?:settings|profile)/.test(href): {
        injectScript("./foreground/addSettings.js");
        break;
    }

    // prettier-ignore
    case !nyaaUtility.utils.stringIncludes(href, [
        "/profile", "/view", "/rules", "/help",
        "/upload", "/notifications", "page=rss",
    ]): {
        injectScript("./foreground/newTorrentAnouncer.js");
        injectScript("./foreground/nyaaDeadTorrents.js")
        break;
    }

    case /\/notifications/.test(href): {
        injectScript("./foreground/notifications.js");
        break;
    }

    case /\/view\/\d+/.test(href): {
        injectScript("./foreground/nyaaTagUser.js");
        injectScript("./foreground/nyaaUserBlock.js");
        injectScript("./foreground/mentionUser.js");
        injectScript("./foreground/followTorrent.js");
        injectScript("./foreground/removeNotif.js");
        break;
    }

    default:
        break;
}
