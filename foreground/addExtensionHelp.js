const container = document.querySelector("body > .container");

container.removeChild(container.querySelector("h1"));
container.removeChild(container.querySelector("p"));

document.querySelector("title").innerText = "Nyaa-Utility :: Nyaa";

themeUtil.onload(() => {
    container.innerHTML =
        `<h1>Nyaa-Utility v${chrome.runtime.getManifest().version}</h1>
<div>
    Changes on the new version!:
    <ul>
        <li>Fixed a bug with the notifications. (There is a high chance that you have to <input class="btn btn-xs btn-danger" type="button" value="Reset"> all of your user data in order to fix this.)</li>
        <li>The <input class="btn btn-xs btn-danger" type="button" style="background-color: #646464; border: none;" value="Mention"></input> button now creates a link to the exact comment it's a reply to.</li>
    </ul>
</div>
<h3 id="nyaa-getting-help">
    Getting help
    <a class="header-anchor" href="#nyaa-getting-help">
    <i class="fa fa-link" aria-hidden="true"></i>
    </a>
</h3>

<div>
    If the extension appears to not be working, try to reset all of its data to the default settings.
    <br/>
    You can do so by pressing the <input class="btn btn-xs btn-danger" type="button" value="Reset"> button in the <a href="/profile">profile</a> page, or, if you don't have a nyaa account and can't access that location, the <a href="/settings">settings</a> page.
    <br/>
    If the above somehow didn't fix the errors, then you can go ahead and publish an issue at the <a href="https://github.com/ArjixWasTaken/Nyaa-Utility/issues">Nyaa-Utility issue tracker</a>
</div>


<h3 id="nyaa-usage">
    How to use the extension
    <a class="header-anchor" href="#nyaa-usage">
    <i class="fa fa-link" aria-hidden="true"></i>
    </a>
</h3>

<div>
    Welp, if you can read this text, then it means the extension is already in use!
    <br/>
    So um, what you want to learn instead is what features the extension provides, no?
    <br/>
    <br/>
    So, this extension has the following features:
    <ul>
        <li>
            Themes Support! Themes available:
            <ul>
                ` +
        themes
            .map(
                (e) =>
                    `<li><button type="button" class="collapsible" onclick="((elem) => {
                        elem.classList.toggle('active'); const content = this.nextElementSibling; if (content.style.display === 'block') { content.style.display = 'none' } else { content.style.display = 'block' }; if (content.style.maxHeight){ content.style.maxHeight = null; } else { content.style.maxHeight = content.scrollHeight + 'px';}})(this)">${
                            e.theme_name
                        }</button>
                    <div class="content">
                    <img 
                    width=1000
                    height=700
                    src=${chrome.runtime.getURL(
                        "assets/themes/" +
                            e.theme_name.replace(/ /g, "-").toLowerCase() +
                            ".png"
                    )}></div></li>`
            )
            .join("\n") +
        `
            </ul>
        </li>
        <li>
            Filters out dead torrents from the browse section by one of the following rules.
            <ul>
                <li>Disabled</li>
                <li>0 Seeds</li>
                <li>0 Leechers</li>
                <li>Both (0 seeds and leechers)</li>
            </ul>
        </li>
        <li>
            Can go to the next available page if the above feature removed all the torrents from the browse section.
        </li>
        <li>
            Adds a user blocking system. (only hides their comments)
        </li>
        <li>
            Adds a tag blocking system. (removes torrents from the browse section based on their tags)
        </li>
        <li>
            Adds a reply feature (in the comments), this feature implements the following.
            <ul>
                <li>A  <input class="btn btn-xs btn-danger" type="button" style="background-color: #646464; border: none;" value="Mention"></input> button next to usernames, when clicked it appends the @username of said user, as a link to the exact comment.</li>
                <li>When a message contains your @username, that message becomes highlighted and the <mark>@username</mark> gets marked.</li>
            </ul>
        </li>
        <li>
            Adds a subscription feature to subscribe for new comments in torrents.
        </li>
        <li>
            Adds a torrent watcher feature to get notified for new torrents in the followed feeds.
            <br/>
            To use this you simply click the <button class="btn btn-xs" type="button">
            <i class="fa fa-rss fa-fw"></i></button> button.
            <br/>
            When the button is blue it means that the current feed is not being followed.
            <br/>Clicking it will follow that feed.
            <br/><br/>
            When the button is red it means that the current feed is already followed.
            <br/>
            Clicking it will unfollow that feed.
        </li>
    </ul>
    <br/>
    If you want to request for a new feature, then go and create an issue on the <a href="https://github.com/ArjixWasTaken/Nyaa-Utility/issues">Nyaa-Utility issue tracker</a>
</div>
<hr/>
` +
        container.innerHTML;
    Array.from(document.querySelectorAll(`input[value="Reset"]`)).forEach((elem) => elem.onclick = () => {
        if (
            confirm(
                "Are you sure you want to reset all of the settings to the default?\nNote: This will also unblock all the blocked users."
            )
        ) {
            chrome.storage.local.clear(() => {
                themeUtil.removeTheme();
                window.location.reload();
            });
        }
    })
});
