// prettier-ignore
const injectConfig = () => {
    const ops = nyaaUtility.storage.user.options;

    const AutoNextPage = nyaaUtility.utils.snippets.getCheckBox(
        "Go to next page when the current page is empty.",
        "AutoNextPage",
        ops.AutoNextPage
    );

    const NyaaUserBlocks = nyaaUtility.utils.snippets.getCheckBox(
        "Disable the user blocking function",
        "NyaaUserBlocks",
        ops.NyaaUserBlocks
    );
    const blockedUsers = nyaaUtility.utils.snippets.getListBox(
        "Blocked Users:",
        "blockedUsersNyaa",
        ops.nyaaBlockedUsers,
        "blockedUser",
        "unblock",
        "No blocked users were found."
    );

    const deadTorrentRemovalRule = nyaaUtility.utils.snippets.getDropdownList(
        "DeadTorrent removeRule:",
        "removeDeadTorrentsRule",
        ['disabled', 'both', 'seeds', 'leechers'],
        ops.NyaaRemoveRule
    )
    

    $("#preferences-change > form > .row")
        .first()
        .before(deadTorrentRemovalRule)
        .after(AutoNextPage + NyaaUserBlocks + blockedUsers);
    
    {
        document.querySelectorAll('#blockedUsersNyaa > li').forEach((li) => {
            li.onclick = () => {
                const link = li.querySelector('a').href
                // https://nyaa.si/user/XXXXXXX
                const user = link.match(/user\/(.*)/);
                if (!user) {
                    return
                }
                const ops = nyaaUtility.storage.user.options
                ops.nyaaBlockedUsers = ops.nyaaBlockedUsers.filter(usr => usr.match(/user\/(.*)/)[1] != user[1])
                nyaaUtility.settings.save()
                window.location.reload()
            }
            
        });
    }

    document.getElementById("submit_settings").addEventListener(
        "click",
        () => {
            nyaaUtility.storage.user.options.AutoNextPage = document.querySelector("input#AutoNextPage").checked;
            nyaaUtility.storage.user.options.NyaaUserBlocks = document.querySelector("input#NyaaUserBlocks").checked;
            nyaaUtility.storage.user.options.NyaaRemoveRule = document.querySelector("select#removeDeadTorrentsRule").value;
            nyaaUtility.settings.save()
        },
        false
    );
};

if (window.location.href.match(/\/profile/)) {
    {
        /*
            Changes the active tab to the preferences one
            instead of the "change password" one.
        */
        classes = ["active", "in"];
        for (let class_ of classes) {
            $("#password-change").toggleClass(class_);
            $("#preferences-change").toggleClass(class_);
        }

        $("#profileTabs > li:nth-child(1)").toggleClass("active");
        $("#profileTabs > li:nth-child(3)").toggleClass("active");
    }
    injectConfig();
}
