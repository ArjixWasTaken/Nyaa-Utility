const parseQs = (link) => {
    if (!link.includes("?")) return {};
    const qs = link.split("?")[1];
    const args = qs.split("&").map((arg) => {
        splitted = arg.split("=");
        return {
            key: splitted[0],
            value: splitted.length == 2 ? splitted[1] : null,
        };
    });
    const arguments_ = {};
    args.forEach((arg) => (arguments_[arg.key] = arg.value));
    return arguments_;
};

const isNumeric = (num) => {
    return !isNaN(num);
};

const sleep = (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
};

const popNotification = (data) => {
    try {
        switch (data.mode) {
            case "addition": {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "assets/128.png",
                    title: data.title,
                    message: `${data.count} new comment${
                        data.count > 1 ? "s" : ""
                    }!`,
                    priority: 2,
                });
                return;
            }

            case "deletion":
                break;

            default: {
                let message = parseQs(data.message.trim()).q;
                message =
                    message && message.trim() != "" ? message : data.message;
                message += ` - Feed`;
                console.log(message);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "assets/128.png",
                    title: data.title,
                    message,
                    priority: 2,
                });
                return;
            }
        }
    } catch {
        console.log("Notification Error: ", data);
    }
};

const fetchWithErrorCatching = async (link, options = {}) => {
    try {
        const res = await fetch(link, options);
        if (res.status == 200) {
            return res;
        }
        return undefined;
    } catch {
        console.log("Failed to fetch:", link, options);
    }
};

const getData = async (id, rss = false) => {
    let link = "https://nyaa.si/view/";

    if (`${id}`.includes("rss")) {
        link = id;
        rss = true;
    } else {
        link += id;
    }

    let req = await fetchWithErrorCatching(link, {
        headers: {
            "User-Agent": navigator.userAgent,
        },
    });
    if (req == undefined) {
        await sleep(5);
        req = await fetchWithErrorCatching(link, {
            headers: {
                "User-Agent": navigator.userAgent,
            },
        });
        if (req == undefined) {
            await sleep(10);
            if (rss) return [];
            return {};
        }
    }

    const data = await req.text();
    const html = new window.DOMParser().parseFromString(
        data,
        `text/${rss ? "xml" : "html"}`
    ).documentElement;

    if (rss) {
        items = [];
        html.querySelectorAll("item").forEach((el) => {
            items.push({
                comments: parseInt(
                    el.getElementsByTagName("nyaa:comments")[0].innerHTML.trim()
                ),
                category: el
                    .getElementsByTagName("nyaa:categoryId")[0]
                    .innerHTML.trim(),
                title: el.querySelector("title").innerHTML.trim(),
                size: el.getElementsByTagName("nyaa:size")[0].innerHTML.trim(),
                timestamp: new Date(
                    el.querySelector("pubDate").innerHTML
                ).getTime(),
                id: parseInt(
                    el.querySelector("guid").innerHTML.match(/view\/(\d+)/)[1]
                ),
            });
        });
        return items;
    }

    return {
        comments: parseInt(data.match(/Comments - (\d+)/)[1]),
        category: html
            .querySelector(`.panel-body > .row a[href*="/?c="]:nth-child(2)`)
            .href.match(/(\d_\d)/)[1],
        title: html.querySelector("h3.panel-title").innerText.trim(),
        size: html
            .querySelector(
                "div.panel-body > div:nth-child(4) > div:nth-child(2)"
            )
            .innerText.trim(),
        timestamp: html.querySelector(
            "div.panel-body > div:nth-child(1) > div:nth-child(4)"
        ).dataset.timestamp,
        id,
    };
};
