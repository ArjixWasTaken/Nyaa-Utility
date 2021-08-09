const container = document.querySelector("body > .container");

container.removeChild(container.querySelector("h1"));
container.removeChild(container.querySelector("p"));

document.querySelector("title").innerText = "Nyaa-Utility :: Nyaa";

container.innerHTML =
    `<h1>Nyaa-Utility v${chrome.runtime.getManifest().version}</h1>
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
            Adds a reply feature (in the comments), this feature implements the following.
            <ul>
                <li>A  <input class="btn btn-xs btn-danger" type="button" style="background-color: #646464; border: none;" value="Mention"></input> button next to usernames, when clicked it appends the @username of said user.</li>
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
` + container.innerHTML;
