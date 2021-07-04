const fetchWithErrorCatching = async (link, options = {}) => {
    const res = await fetch(link, options);
    if (res.status == 200) {
        return res;
    }
    return undefined;
};

//prettier-ignore
{
    let main = () => {
        const torrentID = window.location.href.match(/\/view\/([0-9]+)/)[1]
        const ops = nyaaUtility.storage.user.options
        let identifier = "subToTorrent"
        let text = "Subscribe"
        let colour = "background-color: #4CAF50;"

        if (ops.subscribedThreads[torrentID] != undefined) {
            identifier = "unSubFromTorrent"
            text = "Unsubscribe"
            colour = ''
        }

        btn = `
        <button type="button" class="btn btn-xs btn-danger pull-right" style="margin-right: 10px; border: none; text-size: 70%;${colour}" id="${identifier}">
            ${text}
        </button>
        `
        
        $("body > div > div:nth-child(1) > div.panel-footer.clearfix > button").after(btn)
        $('#' + identifier).on('click', async () => {
            if (ops.subscribedThreads[torrentID] != undefined) {
                delete ops.subscribedThreads[torrentID]
            } else {
                const res = await fetchWithErrorCatching(window.location.href, {
                    "headers": {
                        "User-Agent": navigator.userAgent
                    }
                })
                if (res == undefined) {
                    alert('Failed to subscribe to this torrent.\nPlease try again later.')
                }
                const regex = /<h3 class="panel-title">(?:\n|\s)*?Comments - (\d+)(?:\n|\s)*?<\/h3>/
                ops.subscribedThreads[torrentID] = parseInt((await res.text()).match(regex)[1])
            }
            
            nyaaUtility.settings.save()
            window.location.reload()
        })
    };

    if (document.location.href.includes("/view/")) {
        nyaaUtility.storage.system.onload(main);
    }
}
