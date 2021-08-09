const onclick = async () => {
    ops = nyaaUtility.storage.user.options;
    mobileButton = document.getElementById("followFeedMobile");
    const feed = document.querySelector(`[href*="rss"]`).href;

    if (document.location.href in ops.subscribedFeeds) {
        // unfollow feed
        delete ops.subscribedFeeds[document.location.href];
        delete ops.FeedsTracker[feed];
        mobileButton.innerHTML = mobileButton.innerHTML.replace(
            "Unfollow",
            "Follow"
        );
        $("#followFeed, #followFeedMobile").css("background-color", "");
    } else {
        let items = await nyaaUtility.utils.getData(feed, true);

        // follow feed
        ops.subscribedFeeds[document.location.href] = feed;
        ops.FeedsTracker[feed] = items[0].id;

        $("#followFeed, #followFeedMobile").css("background-color", "red");
        mobileButton.innerHTML = mobileButton.innerHTML.replace(
            "Follow",
            "Unfollow"
        );
    }

    nyaaUtility.storage.user.options = ops;
    nyaaUtility.settings.save();
};

{
    document.querySelector("#navbar > form > div").appendChild(
        nyaaUtility.utils.createElement("div", {
            className: "input-group-btn search-btn",
            innerHTML: `<button disabled class="btn btn-primary" id="followFeed" type="button">
                            <i class="fa fa-rss fa-fw"></i>
                        </button>`,
        })
    );
    $("#followFeed").attr("disabled", true).on("click", onclick);

    document.querySelector("#navbar > div > form").appendChild(
        nyaaUtility.utils.createElement("button", {
            disabled: true,
            id: "followFeedMobile",
            type: "button",
            className: "btn btn-primary form-control",
            innerHTML: `<i class="fa fa-rss fa-fw"></i> Follow Feed`,
            onclick,
        })
    );
}

nyaaUtility.storage.system.onload(() => {
    ops = nyaaUtility.storage.user.options;
    $("#followFeed, #followFeedMobile").removeAttr("disabled");

    mobileButton = document.getElementById("followFeedMobile");
    if (document.location.href in ops.subscribedFeeds) {
        // if feed is followed then mark it as such
        $("#followFeed, #followFeedMobile").css("background-color", "red");
        mobileButton.innerHTML = mobileButton.innerHTML.replace(
            "Follow",
            "Unfollow"
        );
    }
});
